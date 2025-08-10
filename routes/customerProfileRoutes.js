const express = require('express');
const router = express.Router();
const {
    createCustomerProfile,
    getAllCustomerProfiles,
    getCustomerProfile,
    updateCustomerProfile,
    deleteCustomerProfile,
    addAddress,
    updateAddress,
    deleteAddress
} = require('../controllers/customerProfileController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Admin routes
router.get('/', authorize('admin'), getAllCustomerProfiles);

// Customer profile routes
router.post('/', authorize('customer'), createCustomerProfile);
router.get('/me', authorize('customer'), getCustomerProfile);
router.put('/me', authorize('customer'), updateCustomerProfile);
router.delete('/me', authorize('customer'), deleteCustomerProfile);

// Address management routes
router.post('/:id/addresses', authorize('customer'), addAddress);
router.put('/:id/addresses/:addressId', authorize('customer'), updateAddress);
router.delete('/:id/addresses/:addressId', authorize('customer'), deleteAddress);

// Mixed access routes (owner or admin)
router.get('/:id', getCustomerProfile);
router.put('/:id', updateCustomerProfile);
router.delete('/:id', deleteCustomerProfile);

module.exports = router;
