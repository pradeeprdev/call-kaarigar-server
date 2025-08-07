const Service = require('../models/Service');
const ServiceCategory = require('../models/ServiceCategory');

// Helper function to validate service data
const validateServiceData = (data) => {
    const requiredFields = ['title', 'service_categoryId', 'baseprice'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        return {
            isValid: false,
            error: `Missing required fields: ${missingFields.join(', ')}`
        };
    }

    if (data.baseprice && (isNaN(data.baseprice) || data.baseprice <= 0)) {
        return {
            isValid: false,
            error: 'Base price must be a positive number'
        };
    }

    return { isValid: true };
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (Admin only)
exports.createService = async (req, res) => {
    try {
        // Only allow if the logged in user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can create services'
            });
        }

        // Validate input data
        const validation = validateServiceData(req.body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }

        // Check if category exists
        const categoryExists = await ServiceCategory.findById(req.body.service_categoryId);
        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service category'
            });
        }

        const service = await Service.create({
            ...req.body,
            isActive: true
        });

        res.status(201).json({
            success: true,
            data: service,
            message: 'Service created successfully'
        });
    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating service',
            error: error.message
        });
    }
};

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find()
            .populate('category', 'name description')
            .populate('createdBy', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching services',
            error: error.message
        });
    }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('category', 'name description')
            .populate('createdBy', 'name email phone');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        console.error('Get service error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching service',
            error: error.message
        });
    }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Worker only)
exports.updateService = async (req, res) => {
    try {
        let service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check if the logged-in user is the service creator
        if (service.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own services'
            });
        }

        service = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('category', 'name description');

        res.status(200).json({
            success: true,
            data: service,
            message: 'Service updated successfully'
        });
    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating service',
            error: error.message
        });
    }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Worker only)
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check if the logged-in user is the service creator
        if (service.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own services'
            });
        }

        await service.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting service',
            error: error.message
        });
    }
};
exports.getAllServices = async (req, res) => {
  try {
    // Optionally you can add filtering by query params here.
    const services = await Service.find({ isActive: true })
      .populate('categoryId createdBy'); // populate referenced fields if needed

    return res.status(200).json(services);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Get a service by id.
 * Public endpoint.
 */
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('categoryId createdBy');
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    return res.status(200).json(service);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Update a service.
 * Only the worker who created the service can update it.
 */
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    
    // Only allow if the logged in worker is the owner of the service
    if (service.createdBy !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized to update this service.' });
    }
    
    // Update with new values
    const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json(updatedService);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * Delete a service.
 * Only the worker who created the service can delete it.
 */
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    
    // Check if the current worker is the owner
    if (service.createdBy !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized to delete this service.' });
    }
    
    await Service.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Service deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
