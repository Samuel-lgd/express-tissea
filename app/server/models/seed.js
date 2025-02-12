require('dotenv').config();
const mongoose = require('mongoose');

const Line = require('./line.model');
const Station = require('./station.model');
const Route = require('./route.model');
const User = require('./user.model');

async function seedDB() {
    try {

        console.log('Connexion à la BDD...');

        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connecté a la BDD');

        await Line.deleteMany({});
        await Station.deleteMany({});
        await Route.deleteMany({})
        await User.deleteMany({});

        const linesData = [
            { name: 'Bus 42', type: 'Bus', color: '#ff5722' },
            { name: 'Metro M1', type: 'Metro',  color: '#03a9f4' },
        ];

        const createdLines = await Line.insertMany(linesData);
        const busLine = createdLines.find(line => line.name === 'Bus 42');
        const metroLine = createdLines.find(line => line.name === 'Metro M1');

        const stationsData = [
            {
                name: 'Basso Cambo',
                linesServed: [busLine._id, metroLine._id]
            },
            {
                name: 'Carmes',
                linesServed: [busLine._id]
            },
            {
                name: 'Pate d\'oie',
                linesServed: [busLine._id]
            },
            {
                name: 'Jean Jaurès',
                linesServed: [busLine._id, metroLine._id]
            },
            {
                name: 'Capitole',
                linesServed: [busLine._id]
            },
            {
                name: 'Bind',
                linesServed: [busLine._id]
            },
            {
                name: 'Fracture',
                linesServed: [busLine._id, metroLine._id]
            }
        ];

        const createdStations = await Station.insertMany(stationsData);

        const bassoCambo = createdStations.find(st => st.name === 'Basso Cambo');
        const patteDoie = createdStations.find(st => st.name === 'Pate d\'oie');
        const carmes = createdStations.find(st => st.name === 'Carmes');
        const jeanJo = createdStations.find(st => st.name === 'Jean Jaurès');
        const bind = createdStations.find(st => st.name === 'Bind');
        const fracture = createdStations.find(st => st.name === 'Fracture');


        await bassoCambo.save();
        await patteDoie.save();
        await carmes.save();



        const routesData = [
            {
                lineId: busLine._id,
                stations: [patteDoie._id, carmes, jeanJo, bind, fracture],
                distance: 8,           // en km (exemple)
                approximateTime: 30,   // en minutes (exemple)
                direction: 'Pate d\'oie → Fracture'
            },
            {
                lineId: metroLine._id,
                stations: [bassoCambo._id, jeanJo, fracture],
                distance: 3,
                approximateTime: 10,
                direction: 'Basso Cambo → Fracture'
            }
        ];

        const createdRoutes = await Route.insertMany(routesData);

        mongoose.connection.close();
        console.log('Seed terminé, connexion fermée.');
    } catch (error) {
        console.error('Erreur lors du seed :', error);
        mongoose.connection.close();
    }
}

seedDB();
