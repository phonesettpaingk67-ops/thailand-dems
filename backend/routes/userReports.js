const express = require('express');
const router = express.Router();
const userReportController = require('../controllers/userReportController');

// Get all reports (admin)
router.get('/', userReportController.getAllReports);

// Get report statistics
router.get('/stats', userReportController.getReportStats);

// Create new report (user)
router.post('/create', userReportController.createReport);

// Update report status (admin)
router.put('/:id', userReportController.updateReportStatus);

// Delete report (admin)
router.delete('/:id', userReportController.deleteReport);

module.exports = router;
