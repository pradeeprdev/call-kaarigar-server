const CustomerProfile = require('../models/CustomerProfile');

// Helper function to validate customer profile data
const validateProfileData = (data) => {
    const requiredFields = ['phoneNumber'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        return {
            isValid: false,
            error: `Missing required fields: ${missingFields.join(', ')}`
        };
    }

    // Validate phone number format (you can adjust the regex as needed)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(data.phoneNumber)) {
        return {
            isValid: false,
            error: 'Invalid phone number format. Must be 10 digits.'
        };
    }

    return { isValid: true };
};

// @desc    Create customer profile
// @route   POST /api/customer-profile
// @access  Private (Customer only)
exports.createCustomerProfile = async (req, res) => {
    try {
        console.log('Creating customer profile:', req.body);

        // Role validation
        if (req.user.role !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Only customers can create customer profiles'
            });
        }

        // Check for existing profile
        const existingProfile = await CustomerProfile.findOne({ userId: req.user._id });
        if (existingProfile) {
            return res.status(400).json({
                success: false,
                message: 'Customer profile already exists',
                profile: existingProfile
            });
        }

        const profile = await CustomerProfile.create({
            userId: req.user._id,
            ...req.body
        });

        res.status(201).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Create customer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating customer profile',
            error: error.message
        });
    }
};

// @desc    Get all customer profiles
// @route   GET /api/customer-profile
// @access  Private (Admin only)
exports.getAllCustomerProfiles = async (req, res) => {
    try {
        const profiles = await CustomerProfile.find()
            .populate('userId', 'name email phone');

        res.status(200).json({
            success: true,
            count: profiles.length,
            data: profiles
        });
    } catch (error) {
        console.error('Get customer profiles error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer profiles',
            error: error.message
        });
    }
};

// @desc    Get customer profile by ID
// @route   GET /api/customer-profile/:id
// @access  Private (Owner or Admin)
exports.getCustomerProfile = async (req, res) => {
    try {
        const profile = await CustomerProfile.findById(req.params.id)
            .populate('userId', 'name email phone');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Customer profile not found'
            });
        }

        // Check if user is owner or admin
        if (profile.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this profile'
            });
        }

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Get customer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer profile',
            error: error.message
        });
    }
};

// @desc    Update customer profile
// @route   PUT /api/customer-profile/:id
// @access  Private (Owner or Admin)
exports.updateCustomerProfile = async (req, res) => {
    try {
        let profile = await CustomerProfile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Customer profile not found'
            });
        }

        // Check ownership or admin status
        if (profile.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this profile'
            });
        }

        profile = await CustomerProfile.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('userId', 'name email phone');

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Update customer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating customer profile',
            error: error.message
        });
    }
};

// @desc    Delete customer profile
// @route   DELETE /api/customer-profile/:id
// @access  Private (Owner or Admin)
exports.deleteCustomerProfile = async (req, res) => {
    try {
        const profile = await CustomerProfile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Customer profile not found'
            });
        }

        // Check ownership or admin status
        if (profile.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this profile'
            });
        }

        await profile.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Customer profile deleted successfully'
        });
    } catch (error) {
        console.error('Delete customer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting customer profile',
            error: error.message
        });
    }
};
