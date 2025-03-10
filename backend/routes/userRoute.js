const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  logoutUser,
  getCurrentUser,
  updateProfile,
  updateTravelStatus
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Route to register a new user
router.post('/register', registerUser);

// Route to login a user
router.post('/login', loginUser);

// Route to logout a user
router.post('/logout', logoutUser);

// Get current user (protected route)
router.get('/me', protect, getCurrentUser);

// Update user profile (protected route)
router.put('/profile', protect, updateProfile);

// Update travel status (protected route)
router.put('/travel-status', protect, updateTravelStatus);

module.exports = router;

