require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const app = express();

connectDB();

app.use(express.json());

const categoriesRoutes = require('./routes/categories.route');
app.use('/api/categories', categoriesRoutes);

const statsRoutes = require('./routes/stats.route');
app.use('/api/stats', statsRoutes);

const userRoutes = require('./routes/user.route');
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
