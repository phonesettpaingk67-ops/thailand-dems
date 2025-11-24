const express = require('express');
const router = express.Router();
const partnerFacilitiesController = require('../controllers/partnerFacilitiesController');
const { requireAdmin } = require('../middleware/auth');

// All partner facilities routes require admin access
router.use(requireAdmin);

// Partner facilities
router.get('/facilities', partnerFacilitiesController.getAllPartnerFacilities);
router.get('/facilities/:id', partnerFacilitiesController.getFacilityById);
router.post('/facilities', partnerFacilitiesController.createPartnerFacility);
router.put('/facilities/:id', partnerFacilitiesController.updatePartnerFacility);

// Host families
router.get('/host-families', partnerFacilitiesController.getAllHostFamilies);
router.post('/host-families', partnerFacilitiesController.createHostFamily);
router.put('/host-families/:id/verify', partnerFacilitiesController.verifyHostFamily);

// Shelter activation
router.post('/activations', partnerFacilitiesController.requestShelterActivation);
router.put('/activations/:id/approve', partnerFacilitiesController.approveActivation);
router.get('/activations', partnerFacilitiesController.getActivationRequests);

// Analytics
router.get('/capacity/analytics', partnerFacilitiesController.getShelterCapacityAnalytics);
router.get('/capacity/nearby', partnerFacilitiesController.getNearbyCapacity);

module.exports = router;
