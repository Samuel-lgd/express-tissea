require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Category = require('./models/category.model');
const Line = require('./models/line.model');
const Stop = require('./models/stop.model');
const User = require('./models/user.model');

function createStop({ name, lon, lat, orderIndex }) {
    return new Stop({
        name,
        location: {
            type: 'Point',
            coordinates: [lon, lat]
        },
        orderIndex
    });
}

async function seedDB() {
    try {
        console.log('[seed] Connection à MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('[seed] Suppression de l\'ancienne BDD...');
        await Category.deleteMany({});
        await Line.deleteMany({});
        await Stop.deleteMany({});
        await User.deleteMany({});

        console.log('[seed] Seeding de la BDD...');
        const categoriesData = [
            { name: 'Bus', created_at: new Date(), updated_at: new Date() },
            { name: 'Metro', created_at: new Date(), updated_at: new Date() }
        ];
        const [busCategory, metroCategory] = await Category.insertMany(categoriesData);

        const bus58StopsData = [
            { name: 'Seysses', lon: 1.3166, lat: 43.5168, orderIndex: 0, created_at: new Date(), updated_at: new Date() },
            { name: 'Frouzins', lon: 1.3167, lat: 43.5268, orderIndex: 1, created_at: new Date(), updated_at: new Date() },
            { name: 'Villeneuve', lon: 1.3168, lat: 43.5368, orderIndex: 2, created_at: new Date(), updated_at: new Date() },
            { name: 'Cugnaux', lon: 1.3169, lat: 43.5468, orderIndex: 3, created_at: new Date(), updated_at: new Date() },
        ];
        const bus58Stops = [];
        for (const stopObj of bus58StopsData) {
            const stop = createStop(stopObj);
            bus58Stops.push(stop);
        }
        await Stop.insertMany(bus58Stops);

        const metroAStopsData = [
            { name: 'Patte d\'oie', lon: 1.4100, lat: 43.6000, orderIndex: 0, created_at: new Date(), updated_at: new Date() },
            { name: 'Saint Cyprien', lon: 1.4020, lat: 43.5900, orderIndex: 1, created_at: new Date(), updated_at: new Date() },
            { name: 'Esquirol', lon: 1.4470, lat: 43.6010, orderIndex: 2, created_at: new Date(), updated_at: new Date() },
            { name: 'Capitole', lon: 1.4420, lat: 43.6050, orderIndex: 3, created_at: new Date(), updated_at: new Date() },
            { name: 'Jean Jaurès', lon: 1.4530, lat: 43.6070, orderIndex: 4, created_at: new Date(), updated_at: new Date() },
        ];
        const metroAStops = [];
        for (const stopObj of metroAStopsData) {
            const stop = createStop(stopObj);
            metroAStops.push(stop);
        }
        await Stop.insertMany(metroAStops);

        const bus58Line = new Line({
            categoryId: busCategory._id,
            name: 'Bus 58',
            startOfActivity: '05:00',
            endOfActivity: '23:00',
            stops: bus58Stops.map(s => s._id),
            created_at: new Date(),
            updated_at: new Date()
        });
        const metroALine = new Line({
            categoryId: metroCategory._id,
            name: 'Metro A',
            startOfActivity: '06:00',
            endOfActivity: '01:00',
            stops: metroAStops.map(s => s._id),
            created_at: new Date(),
            updated_at: new Date()
        });

        await bus58Line.save();
        await metroALine.save();

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('password', saltRounds);
        const testUser = new User({
            email: 'test@test.com',
            password: hashedPassword,
            created_at: new Date(),
            updated_at: new Date()
        });
        await testUser.save();

        await mongoose.connection.close();
        console.log('[seed] Terminé. Connexion fermée.');
    } catch (error) {
        console.error('[seed] Erreur :', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

if (require.main === module) {
    seedDB();
}
