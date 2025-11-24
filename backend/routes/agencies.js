const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { requireAdmin } = require('../middleware/auth');

// All agency routes require admin access
router.use(requireAdmin);

// Agency management
router.get('/stats', agencyController.getAgencyStats);
router.get('/available', agencyController.getAvailableAgencies);
router.get('/', agencyController.getAllAgencies);
router.get('/:id', agencyController.getAgencyById);
router.post('/', agencyController.createAgency);
router.put('/:id', agencyController.updateAgency);
router.delete('/:id', agencyController.deleteAgency);

// Agency resources
router.post('/resources', agencyController.addAgencyResource);
router.put('/resources/:id/status', agencyController.updateResourceStatus);

// Agency activation
router.post('/activate', agencyController.activateAgency);
router.put('/activations/:id/status', agencyController.updateActivationStatus);
router.put('/activations/:id/confirm', agencyController.confirmActivation);
router.get('/disaster/:disasterId/active', agencyController.getActiveAgenciesForDisaster);

module.exports = router;
