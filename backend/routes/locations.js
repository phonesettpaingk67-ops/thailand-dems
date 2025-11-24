const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Search locations (autocomplete)
router.get('/search', locationController.searchLocations);

// Get location by coordinates (reverse geocoding)
router.get('/reverse', locationController.getLocationByCoordinates);

// Get all provinces
router.get('/provinces', locationController.getProvinces);

// Get locations by type
router.get('/by-type', locationController.getLocationsByType);

// Get location by ID
router.get('/:id', locationController.getLocationById);

// Add custom location
router.post('/', locationController.addCustomLocation);

module.exports = router;
