const Line = require('../models/line.model');

exports.getAllLines = async (req, res) => {
    try {
        const lines = await Line.find();
        res.status(200).json(lines);
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération des lignes',
            error: error.message,
        });
    }
};

exports.createLine = async (req, res) => {
    try {
        const { name } = req.body;
        const newLine = new Line({ name });
        await newLine.save();
        res.status(201).json(newLine);
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la création de la ligne',
            error: error.message,
        });
    }
};
