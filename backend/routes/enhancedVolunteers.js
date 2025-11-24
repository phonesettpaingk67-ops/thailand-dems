const express = require('express');
const router = express.Router();
const enhancedVolunteerController = require('../controllers/enhancedVolunteerController');
const { requireAdmin } = require('../middleware/auth');

// All enhanced volunteer routes require admin access
router.use(requireAdmin);

// Volunteer management
router.get('/', enhancedVolunteerController.getAllVolunteers);
router.get('/:id/profile', enhancedVolunteerController.getVolunteerProfile);
router.get('/available', enhancedVolunteerController.getAvailableVolunteers);

// Skills
router.get('/skills/all', enhancedVolunteerController.getAllSkills);
router.post('/skills/add', enhancedVolunteerController.addSkillToVolunteer);

// Availability
router.post('/availability', enhancedVolunteerController.updateAvailability);

// Deployment
router.post('/deploy', enhancedVolunteerController.deployVolunteer);
router.put('/deployments/:id/complete', enhancedVolunteerController.completeDeployment);

// Recruitment campaigns
router.post('/campaigns', enhancedVolunteerController.createRecruitmentCampaign);
router.get('/campaigns', enhancedVolunteerController.getRecruitmentCampaigns);

// Training
router.get('/training/programs', enhancedVolunteerController.getAllTrainingPrograms);
router.post('/training/complete', enhancedVolunteerController.recordTrainingCompletion);

module.exports = router;
