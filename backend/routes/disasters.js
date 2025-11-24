const express = require('express');
const router = express.Router();
const disasterController = require('../controllers/disasterController');
const { requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', disasterController.getAllDisasters);
router.get('/stats', disasterController.getDisasterStats);
router.get('/:id', disasterController.getDisasterById);

// Admin-only routes
router.post('/', requireAdmin, disasterController.createDisaster);
router.put('/:id', requireAdmin, disasterController.updateDisaster);
router.delete('/:id', requireAdmin, disasterController.deleteDisaster);

module.exports = router;
