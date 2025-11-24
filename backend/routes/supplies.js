const express = require('express');
const router = express.Router();
const supplyController = require('../controllers/supplyController');
const { requireAdmin } = require('../middleware/auth');

// Public routes (read-only for citizens)
router.get('/', supplyController.getAllSupplies);
router.get('/stats', supplyController.getSupplyStats);
router.get('/:id', supplyController.getSupplyById);

// Admin-only routes
router.post('/', requireAdmin, supplyController.createSupply);
router.post('/distribute', requireAdmin, supplyController.distributeSupply);
router.put('/:id', requireAdmin, supplyController.updateSupply);
router.delete('/:id', requireAdmin, supplyController.deleteSupply);

module.exports = router;
