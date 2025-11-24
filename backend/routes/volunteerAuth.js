const express = require('express');
const router = express.Router();
const volunteerAuthController = require('../controllers/volunteerAuthController');

// Volunteer authentication routes
router.post('/login', volunteerAuthController.volunteerLogin);
router.get('/account/:username', volunteerAuthController.getVolunteerAccount);
router.put('/account/:username/password', volunteerAuthController.changePassword);

module.exports = router;
