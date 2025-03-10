const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');

// Send a friend request
const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id; // From auth middleware
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Check if a request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A friend request already exists between these users'
      });
    }

    // Create friend request
    const friendRequest = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      data: friendRequest
    });
  } catch (error) {
    console.error('Error in sendFriendRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all friend requests for a user
const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all friend requests where user is the receiver
    const incomingRequests = await FriendRequest.find({
      receiver: userId,
      status: 'pending'
    }).populate('sender', 'username name profession');

    // Find all friend requests where user is the sender
    const outgoingRequests = await FriendRequest.find({
      sender: userId
    }).populate('receiver', 'username name profession');

    res.json({
      success: true,
      data: {
        incoming: incomingRequests,
        outgoing: outgoingRequests
      }
    });
  } catch (error) {
    console.error('Error in getFriendRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Respond to a friend request (accept or reject)
const respondToFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId, status } = req.body;

    if (!requestId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Request ID and status are required'
      });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either accepted or rejected'
      });
    }

    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    // Check if the user is the receiver of the request
    if (friendRequest.receiver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this request'
      });
    }

    // Update request status
    friendRequest.status = status;
    await friendRequest.save();

    // If accepted, add each user to the other's friends list
    if (status === 'accepted') {
      const sender = await User.findById(friendRequest.sender);
      const receiver = await User.findById(friendRequest.receiver);

      if (!sender.friends.includes(receiver._id)) {
        sender.friends.push(receiver._id);
        await sender.save();
      }

      if (!receiver.friends.includes(sender._id)) {
        receiver.friends.push(sender._id);
        await receiver.save();
      }
    }

    res.json({
      success: true,
      message: `Friend request ${status}`,
      data: friendRequest
    });
  } catch (error) {
    console.error('Error in respondToFriendRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  sendFriendRequest,
  getFriendRequests,
  respondToFriendRequest
}; 