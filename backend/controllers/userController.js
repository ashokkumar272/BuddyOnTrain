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
          lastSeen: user.lastSeen,
          friends: user.friends || []
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

    console.log('Update Travel Status - Request body:', req.body);
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update travel status
    // Check if we're setting it to inactive/empty (unlisting)
    if (isActive === false && boardingStation === "" && destinationStation === "" && travelDate === null) {
      // Complete reset of travel status
      user.travelStatus = {
        boardingStation: "",
        destinationStation: "",
        travelDate: null,
        isActive: false
      };
      
      console.log('Update Travel Status - Resetting travel status to empty');
    } else {
      // Process the date to ensure it's stored consistently
      let processedDate = travelDate;
      
      if (travelDate) {
        try {
          // If it's a string date, convert to proper Date object
          if (typeof travelDate === 'string') {
            processedDate = new Date(travelDate);
            
            // If invalid date, try parsing from DD-MM-YYYY format
            if (isNaN(processedDate.getTime())) {
              const dateParts = travelDate.split('-');
              if (dateParts.length === 3) {
                processedDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
              }
            }
            
            console.log('Update Travel Status - Processed date:', {
              original: travelDate,
              processed: processedDate,
              iso: processedDate.toISOString()
            });
          }
        } catch (error) {
          console.error('Error processing date:', error);
          // Keep original date if processing fails
          processedDate = travelDate;
        }
      }
      
      // Normal update preserving existing values when not provided
      user.travelStatus = {
        boardingStation: boardingStation !== undefined ? boardingStation.trim() : user.travelStatus.boardingStation,
        destinationStation: destinationStation !== undefined ? destinationStation.trim() : user.travelStatus.destinationStation,
        travelDate: processedDate !== undefined ? processedDate : user.travelStatus.travelDate,
        isActive: isActive !== undefined ? isActive : user.travelStatus.isActive
      };
      
      console.log('Update Travel Status - New travel status:', user.travelStatus);
    }
    
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

// Find travel buddies with matching travel status
const findTravelBuddies = async (req, res) => {
  try {
    // Get the search parameters from query string
    const { from, to, date } = req.query;
    
    console.log('Find Travel Buddies - Request params:', { from, to, date });

    if (!from || !to || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: from, to, and date are required'
      });
    }

    // Find users with matching travel status
    // Exclude the current user from results if authenticated
    let excludeUserId = null;
    let currentUser = null;
    if (req.user) {
      excludeUserId = req.user.id;
      console.log('Find Travel Buddies - Excluding user:', excludeUserId);
      
      // Get current user for friendship check
      currentUser = await User.findById(excludeUserId);
    }

    // Parse date from input format (e.g., "25-05-2023")
    console.log('Find Travel Buddies - Input date:', date);
    
    // First, try to create a date object directly
    let dateObj = new Date(date);
    console.log('Find Travel Buddies - Direct parsing result:', dateObj);
    
    // If direct parsing gives invalid date, try to parse from DD-MM-YYYY format
    if (isNaN(dateObj.getTime())) {
      const dateParts = date.split('-');
      if (dateParts.length === 3) {
        // Convert from DD-MM-YYYY to YYYY-MM-DD for proper Date parsing
        dateObj = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
        console.log('Find Travel Buddies - Parsed from DD-MM-YYYY:', dateObj);
      }
    }
    
    // Set time to beginning of day
    dateObj.setHours(0, 0, 0, 0);
    const nextDay = new Date(dateObj);
    nextDay.setHours(23, 59, 59, 999);
    
    console.log('Find Travel Buddies - Final date range:', {
      start: dateObj,
      end: nextDay,
      startISO: dateObj.toISOString(),
      endISO: nextDay.toISOString()
    });

    // Log actual travel status data in the database
    const sampleUsers = await User.find({ 'travelStatus.isActive': true })
      .limit(5)
      .select('username travelStatus');
    
    console.log('Find Travel Buddies - Sample user travel data:', 
      sampleUsers.map(u => ({
        username: u.username,
        boardingStation: u.travelStatus.boardingStation,
        destinationStation: u.travelStatus.destinationStation,
        travelDate: u.travelStatus.travelDate,
        isActive: u.travelStatus.isActive
      }))
    );

    // Create case-insensitive regex for station names
    const fromRegex = new RegExp(`^${from}$`, 'i');
    const toRegex = new RegExp(`^${to}$`, 'i');

    // Build the query
    const query = {
      _id: excludeUserId ? { $ne: excludeUserId } : { $exists: true },
      'travelStatus.isActive': true
    };

    // Use regex for case-insensitive station matching
    query['travelStatus.boardingStation'] = fromRegex;
    query['travelStatus.destinationStation'] = toRegex;

    // Handle date comparison
    // First find all users with active status
    const activeUsers = await User.find(query).select('name username profession bio travelStatus friends');
    
    console.log(`Find Travel Buddies - Found ${activeUsers.length} users with matching stations`);

    // Then filter by date manually to ensure exact date comparison (ignoring time)
    const matchingUsers = activeUsers.filter(user => {
      if (!user.travelStatus || !user.travelStatus.travelDate) return false;
      
      const userTravelDate = new Date(user.travelStatus.travelDate);
      // Compare only year, month, and day
      return userTravelDate.getFullYear() === dateObj.getFullYear() &&
             userTravelDate.getMonth() === dateObj.getMonth() &&
             userTravelDate.getDate() === dateObj.getDate();
    });
    
    console.log(`Find Travel Buddies - After date filtering: ${matchingUsers.length} users match`);

    // Return only necessary fields and add isFriend flag
    const result = matchingUsers.map(user => {
      // Check if this user is a friend of the current user
      let isFriend = false;
      
      if (currentUser && currentUser.friends && currentUser.friends.length > 0) {
        // Convert all IDs to strings for reliable comparison
        const currentUserFriendIds = currentUser.friends.map(id => id.toString());
        isFriend = currentUserFriendIds.includes(user._id.toString());
      }
      
      return {
        _id: user._id,
        username: user.username,
        name: user.name,
        profession: user.profession,
        bio: user.bio,
        isFriend // Include friendship status
      };
    });

    res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Error in findTravelBuddies:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user by ID and exclude password
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user's friends with details
const getUserFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user and get their friends array
    const user = await User.findById(userId).select('friends');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.friends || user.friends.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Fetch details for each friend
    const friends = await User.find({
      _id: { $in: user.friends }
    }).select('-password');

    // Return friends with relevant fields
    const friendsData = friends.map(friend => ({
      _id: friend._id,
      username: friend.username,
      name: friend.name,
      profession: friend.profession,
      online: friend.online,
      lastSeen: friend.lastSeen
    }));

    res.json({
      success: true,
      data: friendsData
    });
  } catch (error) {
    console.error('Error in getUserFriends:', error);
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
  updateTravelStatus,
  findTravelBuddies,
  getUserById,
  getUserFriends
};
