const Stop = require('../models/stop.model');
const Line = require('../models/line.model');

function calcDistanceKm(coords1, coords2) {
    const R = 6371; // yrayon de la terre
    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // merci google
}

// 4) GET - /api/stats/distance/stops/:stopId1/:stopId2
exports.distanceBetweenStops = async (req, res) => {
    try {
        const { stopId1, stopId2 } = req.params;

        const stop1 = await Stop.findById(stopId1);
        const stop2 = await Stop.findById(stopId2);

        if (!stop1 || !stop2) {
            return res.status(404).json({ message: 'Un ou plusieurs arrêts introuvables' });
        }

        const dist = calcDistanceKm(stop1.location.coordinates, stop2.location.coordinates);
        res.status(200).json({distanceKm: dist});
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// 5) GET - /api/stats/distance/lines/:lineId
exports.distanceOfLine = async (req, res) => {
    try {
        const { lineId } = req.params;
        const line = await Line.findById(lineId).populate('stops');
        if (!line) {
            return res.status(404).json({ message: 'Ligne introuvable' });
        }

        line.stops.sort((a, b) => a.orderIndex - b.orderIndex);

        let totalDistance = 0;
        for (let i = 0; i < line.stops.length - 1; i++) {
            const dist = calcDistanceKm(line.stops[i].location.coordinates, line.stops[i+1].location.coordinates);
            totalDistance += dist;
        }

        res.status(200).json({lineId: line._id, distanceKm: totalDistance
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};
