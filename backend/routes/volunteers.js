const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const { requireAdmin } = require('../middleware/auth');

// Public routes (read-only for citizens)
router.get('/', volunteerController.getAllVolunteers);
router.get('/stats', volunteerController.getVolunteerStats);
router.get('/assignments', volunteerController.getVolunteerAssignments);
router.get('/:id', volunteerController.getVolunteerById);
router.get('/:id/assignments', volunteerController.getVolunteerAssignments);

// Admin-only routes
router.post('/', requireAdmin, volunteerController.createVolunteer);
router.post('/assign', requireAdmin, volunteerController.assignVolunteer);
router.post('/assignments/create', requireAdmin, volunteerController.createAssignment);
router.put('/assignments/:id', requireAdmin, volunteerController.updateAssignment);
router.delete('/assignments/:id', requireAdmin, volunteerController.deleteAssignment);
router.put('/:id', requireAdmin, volunteerController.updateVolunteer);
router.delete('/:id', requireAdmin, volunteerController.deleteVolunteer);

module.exports = router;
