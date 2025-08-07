const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

// Public routes - Anyone can view services
router.get('/', serviceController.getAllServices);
router.get('/category/:categoryId', serviceController.getServicesByCategory);
router.get('/:id', serviceController.getServiceById);

// Admin routes - Service management
router.use(protect); // Apply authentication to all routes below

router.post('/', authorize('admin'), serviceController.createService);
router.put('/:id', authorize('admin'), serviceController.updateService);
router.patch('/:id/status', authorize('admin'), serviceController.toggleServiceStatus);
router.delete('/:id', authorize('admin'), serviceController.deleteService);

// Search and filter routes
router.get('/search', serviceController.searchServices);
router.get('/active', serviceController.getActiveServices);

module.exports = router;
