const validator = require('validator');

exports.validateRegistration = (req, res, next) => {
    const { name, email, phone, password, role } = req.body;
    const errors = [];

    // Validate name
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    // Validate email
    if (!email || !validator.isEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    // Validate phone (basic validation, you might want to use a more specific pattern)
    if (!phone || !validator.isMobilePhone(phone)) {
        errors.push('Please provide a valid phone number');
    }

    // Validate password
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    // Validate role
    if (role && !['customer', 'worker', 'admin'].includes(role)) {
        errors.push('Invalid role specified');
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }

    next();
};

exports.validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || !validator.isEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    if (!password) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }

    next();
};
