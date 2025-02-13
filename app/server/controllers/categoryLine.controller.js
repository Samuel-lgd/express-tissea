const Category = require('../models/category.model');
const Line = require('../models/line.model');
const Stop = require('../models/stop.model');

// 1) GET - /api/categories/:id/lines
exports.getLinesByCategory = async (req, res) => {
    try {
        const { id: categoryId } = req.params;
        const lines = await Line.find({ categoryId })
        console.log(lines);
        res.status(200).json(lines);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// 2) GET - /api/categories/:id/lines/:lineId
exports.getLineDetails = async (req, res) => {
    try {
        const { lineId } = req.params;
        const line = await Line.findById(lineId).populate('stops');

        if (!line) {
            return res.status(404).json({ message: 'Ligne introuvable' });
        }

        const stopsNames = line.stops.map(stop => stop.name);

        res.status(200).json({
            _id: line._id,
            name: line.name,
            createdAt: line.createdAt,
            startOfActivity: line.startOfActivity,
            endOfActivity: line.endOfActivity,
            stops: stopsNames
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// 3) GET - /api/categories/:id/lines/:lineId/stops
exports.getLineStopsDetails = async (req, res) => {
    try {
        const { lineId } = req.params;
        const line = await Line.findById(lineId).populate('stops');
        if (!line) {
            return res.status(404).json({ message: 'Ligne introuvable' });
        }

        const detailedStops = line.stops.map(stop => ({
            stopId: stop._id,
            name: stop.name,
            longitude: stop.location.coordinates[0],
            latitude: stop.location.coordinates[1],
            orderIndex: stop.orderIndex
        }));

        detailedStops.sort((a, b) => a.orderIndex - b.orderIndex);

        res.status(200).json(detailedStops);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// 8) POST - /api/categories/:id/lines/:lineId/stops
// Ajout d'un arrêt sur la ligne sans avoir deux terminus.
exports.addStopToLine = async (req, res) => {
    try {
        const { lineId } = req.params;
        const { name, longitude, latitude, position } = req.body;

        const line = await Line.findById(lineId).populate('stops');
        if (!line) {
            return res.status(404).json({ message: 'Ligne introuvable' });
        }

        const stopsCount = line.stops.length;

        const newStop = new Stop({
            name,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            orderIndex: 0 // par defaut mais mis a jour plus bas
        });
        await newStop.save();

        if (stopsCount === 0) {
            newStop.orderIndex = 0;
            await newStop.save();
            line.stops.push(newStop._id);
        } else {
            if (position === 'start') {
                if (stopsCount >= 2) {
                    return res.status(400).json({
                        message: 'Impossible d’ajouter un 3e terminus. La ligne a déjà 2 terminus.'
                    });
                }
                for (let stop of line.stops) {
                    const s = await Stop.findById(stop._id);
                    s.orderIndex += 1;
                    await s.save();
                }
                newStop.orderIndex = 0;
                await newStop.save();
                line.stops.unshift(newStop._id);
            } else if (position === 'end') {
                if (stopsCount >= 2) {
                    return res.status(400).json({
                        message: 'Impossible d’ajouter un 3e terminus. La ligne a déjà 2 terminus.'
                    });
                }
                newStop.orderIndex = stopsCount;
                await newStop.save();
                line.stops.push(newStop._id);
            } else {
                const insertIndex = parseInt(position, 10);
                if (isNaN(insertIndex) || insertIndex < 0 || insertIndex > stopsCount) {
                    return res.status(400).json({ message: 'Position invalide.' });
                }
                for (let i = insertIndex; i < line.stops.length; i++) {
                    const stopId = line.stops[i];
                    const s = await Stop.findById(stopId);
                    s.orderIndex += 1;
                    await s.save();
                }
                newStop.orderIndex = insertIndex;
                await newStop.save();
                line.stops.splice(insertIndex, 0, newStop._id);
            }
        }

        await line.save();
        res.status(201).json({ message: 'Arrêt ajouté', stop: newStop });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// 9) PUT - /api/categories/:id/lines/:lineId
exports.updateLine = async (req, res) => {
    try {
        const { lineId } = req.params;
        const { name, startOfActivity, endOfActivity } = req.body;

        const updatedLine = await Line.findByIdAndUpdate(
            lineId,
            { name, startOfActivity, endOfActivity },
            { new: true }
        );

        if (!updatedLine) {
            return res.status(404).json({ message: 'Ligne introuvable' });
        }

        res.status(200).json(updatedLine);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// 10) DELETE - /api/categories/:id/lines/:lineId/stops/:stopId
exports.deleteStop = async (req, res) => {
    try {
        const { lineId, stopId } = req.params;

        const line = await Line.findById(lineId).populate('stops');
        if (!line) {
            return res.status(404).json({ message: 'Ligne introuvable' });
        }

        const stopIndex = line.stops.findIndex((s) => s._id.toString() === stopId);
        if (stopIndex === -1) {
            return res.status(404).json({ message: 'Arrêt introuvable dans la ligne' });
        }

        const stopToRemove = await Stop.findById(stopId);
        if (!stopToRemove) {
            return res.status(404).json({ message: 'Arrêt introuvable' });
        }
        const removedOrder = stopToRemove.orderIndex;

        line.stops.splice(stopIndex, 1);

        // On met a jour l'ordre de tous les autres stops
        for (let i = 0; i < line.stops.length; i++) {
            const s = await Stop.findById(line.stops[i]._id);
            if (s.orderIndex > removedOrder) {
                s.orderIndex -= 1;
                await s.save();
            }
        }

        // On supprime pas le stop car il peut être présent dans d'autres lignes
        // await Stop.findByIdAndDelete(stopId);

        await line.save();

        res.status(200).json({ message: 'Arrêt supprimé de la ligne: ', stopId });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};
