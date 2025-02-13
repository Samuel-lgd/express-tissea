const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

router.get('/distance/stops/:stopId1/:stopId2', statsController.distanceBetweenStops);
router.get('/distance/lines/:lineId', statsController.distanceOfLine);

module.exports = router;
