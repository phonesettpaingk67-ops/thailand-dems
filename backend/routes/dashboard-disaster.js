const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController-disaster');

router.get('/', dashboardController.getDashboardStats);

module.exports = router;
