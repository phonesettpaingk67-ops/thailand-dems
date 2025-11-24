const express = require('express');
const router = express.Router();
const resourceIntelligenceController = require('../controllers/resourceIntelligenceController');
const { requireAdmin } = require('../middleware/auth');

// All resource intelligence routes require admin access
router.use(requireAdmin);

// Capacity analysis
router.post('/disasters/:disasterId/analyze', resourceIntelligenceController.analyzeDisasterCapacity);
router.get('/disasters/:disasterId/summary', resourceIntelligenceController.getCapacitySummary);

// Capacity alerts
router.get('/disasters/:disasterId/alerts', resourceIntelligenceController.getCapacityAlerts);
router.put('/alerts/:id/resolve', resourceIntelligenceController.resolveCapacityAlert);

// Smart recommendations
router.get('/disasters/:disasterId/recommendations', resourceIntelligenceController.getSmartRecommendations);
router.put('/recommendations/:id/implement', resourceIntelligenceController.implementRecommendation);

// Resource requests
router.post('/requests', resourceIntelligenceController.createResourceRequest);
router.get('/disasters/:disasterId/requests', resourceIntelligenceController.getResourceRequests);
router.put('/requests/:id', resourceIntelligenceController.updateResourceRequest);

module.exports = router;
