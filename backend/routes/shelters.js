const express = require('express');
const router = express.Router();
const shelterController = require('../controllers/shelterController');
const { requireAdmin } = require('../middleware/auth');

// Public routes (read-only for citizens)
router.get('/', shelterController.getAllShelters);
router.get('/stats', shelterController.getShelterStats);
router.get('/nearest', shelterController.getNearestAvailableShelters);
router.get('/:id', shelterController.getShelterById);

// Admin-only routes
router.post('/', requireAdmin, shelterController.createShelter);
router.post('/activate', requireAdmin, shelterController.activateShelterForDisaster);
router.put('/:id', requireAdmin, shelterController.updateShelter);
router.put('/:id/occupancy', requireAdmin, shelterController.updateOccupancy);
router.delete('/:id', requireAdmin, shelterController.deleteShelter);

module.exports = router;
