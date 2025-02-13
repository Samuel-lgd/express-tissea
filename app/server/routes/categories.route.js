const express = require('express');
const router = express.Router();
const categoryLineController = require('../controllers/categoryLine.controller');
const authMiddleware = require('../middlewares/auth.middleware');


router.get('/:id/lines', categoryLineController.getLinesByCategory);
router.get('/:id/lines/:lineId', categoryLineController.getLineDetails);
router.get('/:id/lines/:lineId/stops', categoryLineController.getLineStopsDetails);
router.post('/:id/lines/:lineId/stops', authMiddleware, categoryLineController.addStopToLine);
router.put('/:id/lines/:lineId', authMiddleware, categoryLineController.updateLine);
router.delete('/:id/lines/:lineId/stops/:stopId', authMiddleware, categoryLineController.deleteStop);

module.exports = router;
