const express = require('express')
const dotenv = require('dotenv')
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const trainRoute = require('./routes/findTrainRoute');
const userRoute = require('./routes/userRoute');
const friendRoute = require('./routes/friendRoute');
const messageRoute = require('./routes/messageRoute');
const connectToDB = require('./config/db')
const Message = require('./models/Message');

dotenv.config()
connectToDB()
const PORT = process.env.PORT || 5000;

const app = express()
// Configure CORS with specific options
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(express.json()) // For parsing application/json
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs')


app.get('/', (req, res)=>{
    res.send("server running")
})

app.use('/api', trainRoute)
app.use('/api/users', userRoute)
app.use('/api/friends', friendRoute)
app.use('/api/messages', messageRoute)

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity
    methods: ["GET", "POST"]
  }
});

// Online users map to track which users are connected
const onlineUsers = new Map();

// Handle socket connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle user joining
  socket.on('joinChat', (userId) => {
    console.log(`User ${userId} joined chat with socket ID: ${socket.id}`);
    onlineUsers.set(userId, socket.id);
    
    // Notify friends that this user is online
    socket.broadcast.emit('userOnline', userId);
  });
  
  // Handle sending messages
  socket.on('sendMessage', async (message) => {
    console.log('Message received:', message);
    try {
      // Save message to database
      const newMessage = new Message({
        sender: message.sender,
        receiver: message.receiver,
        content: message.content,
        timestamp: new Date()
      });
      
      await newMessage.save();
      
      // Get receiver's socket id
      const receiverSocketId = onlineUsers.get(message.receiver);
      
      // If receiver is online, send the message to them
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', newMessage);
      }
      
      // Also send back to sender for confirmation
      socket.emit('messageSent', newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });
  
  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Find and remove the user from the online users map
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        // Notify others this user is offline
        socket.broadcast.emit('userOffline', userId);
        break;
      }
    }
  });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

