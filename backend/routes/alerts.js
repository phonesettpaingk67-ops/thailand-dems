const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// Get all alerts
router.get('/', alertController.getAllAlerts);

// Get active alerts only
router.get('/active', alertController.getActiveAlerts);

// Get alerts for specific disaster
router.get('/disaster/:disasterId', alertController.getAlertsByDisaster);

// Get alert by ID
router.get('/:id', alertController.getAlertById);

// Create new alert (admin only)
router.post('/', alertController.createAlert);

// Update alert (admin only)
router.put('/:id', alertController.updateAlert);

// Cancel alert (admin only)
router.post('/:id/cancel', alertController.cancelAlert);

// Delete alert (admin only)
router.delete('/:id', alertController.deleteAlert);

module.exports = router;
