const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser,
  logoutUser, 
  getUsers, 
  getUserProfile 
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// Public routes
router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/logout', auth, logoutUser);

// Protected routes
router.get('/profile', auth, getUserProfile);
router.get('/all', auth, getUsers);

module.exports = router;