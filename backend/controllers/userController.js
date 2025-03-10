const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'buddyontrain-secret', {
    expiresIn: '30d',
  });
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password,
      name,
      age,
      profession,
      bio,
      travelStatus
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }]
    });

    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      name,
      age,
      profession,
      bio,
      travelStatus: travelStatus || {
        boardingStation: '',
        destinationStation: '',
        travelDate: null,
        isActive: false
      },
      online: true,
      lastSeen: new Date()
    });

    if (user) {
      // Generate token
      const token = generateToken(user._id);
      
      res.status(201).json({
        success: true,
        token,
        userId: user._id
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid user data' 
      });
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Update online status
      user.online = true;
      user.lastSeen = new Date();
      await user.save();
      
      // Generate token
      const token = generateToken(user._id);
      
      res.json({
        success: true,
        token,
        userId: user._id
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Logout user
const logoutUser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Update user online status and last seen
    const user = await User.findById(userId);
    
    if (user) {
      user.online = false;
      user.lastSeen = new Date();
      await user.save();
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error('Error in logoutUser:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          age: user.age,
          profession: user.profession,
          bio: user.bio,
          travelStatus: user.travelStatus,
          online: user.online,
          lastSeen: user.lastSeen
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, age, profession, bio, travelStatus, profileCompleted } = req.body;

    // Validate required fields
    if (!name || !age || !profession || !bio) {
      return res.status(400).json({
        success: false,
        message: 'All profile fields are required'
      });
    }

    // Find user and update profile
    const user = await User.findById(req.user.id);
    
    if (user) {
      user.name = name;
      user.age = age;
      user.profession = profession;
      user.bio = bio;
      
      // Handle travelStatus if provided (now as an object)
      if (travelStatus) {
        user.travelStatus = travelStatus;
      }
      
      user.profileCompleted = profileCompleted || true;
      
      await user.save();
      
      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update travel status
const updateTravelStatus = async (req, res) => {
  try {
    const { boardingStation, destinationStation, travelDate, isActive } = req.body;

    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update travel status
    user.travelStatus = {
      boardingStation: boardingStation || user.travelStatus.boardingStation,
      destinationStation: destinationStation || user.travelStatus.destinationStation,
      travelDate: travelDate || user.travelStatus.travelDate,
      isActive: isActive !== undefined ? isActive : user.travelStatus.isActive
    };
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Travel status updated successfully',
      travelStatus: user.travelStatus
    });
  } catch (error) {
    console.error('Error in updateTravelStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateProfile,
  updateTravelStatus
};
