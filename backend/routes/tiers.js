const express = require('express');
const router = express.Router();
const tierController = require('../controllers/tierController');
const { requireAdmin } = require('../middleware/auth');

// All tier routes require admin access
router.use(requireAdmin);

// Tier definitions
router.get('/definitions', tierController.getTierDefinitions);
router.get('/statistics', tierController.getTierStatistics);

// Tier evaluation
router.get('/disasters/:disasterId/evaluate', tierController.evaluateDisasterTier);
router.post('/disasters/:disasterId/escalate', tierController.escalateTier);
router.get('/disasters/:disasterId/history', tierController.getEscalationHistory);

// Resource deployment
router.get('/disasters/:disasterId/deployments', tierController.getTierDeployments);
router.post('/deploy', tierController.deployTierResource);

// Bulk operations
router.get('/check-all-escalations', tierController.checkAllDisastersForEscalation);

module.exports = router;
