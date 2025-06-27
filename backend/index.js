const express = require('express')
const dotenv = require('dotenv')
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const trainRoute = require('./routes/findTrainRoute');
const stationRoute = require('./routes/stationRoute');
const userRoute = require('./routes/userRoute');
const friendRoute = require('./routes/friendRoute');
const messageRoute = require('./routes/messageRoute');
const connectToDB = require('./config/db')
const Message = require('./models/Message');

dotenv.config()
connectToDB()

// Initialize railway stations data at startup
try {
  const { loadRailwayStations } = require('./utils/railwayStations');
  const stationData = loadRailwayStations();
} catch (error) {
  console.error('Failed to load railway stations data at startup:', error);
}

const PORT = process.env.PORT || 5000;

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}))

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs')

app.use('/api', trainRoute)
app.use('/api/stations', stationRoute)
app.use('/api/users', userRoute)
app.use('/api/friends', friendRoute)
app.use('/api/messages', messageRoute)

//-------------------deployement-----------------------

const __dirname1 = path.resolve();
if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname1, "frontend/dist")));
  app.get('*',(req,res)=>{
    res.sendFile(path.resolve(__dirname1, "frontend", "dist", "index.html"));
  });
} else {
  app.get("/", (req,res)=>{
    res.send("API is running successfully");
  });
}

//-------------------deployement-----------------------

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  // Handle user joining
  socket.on('joinChat', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit('userOnline', userId);
  });
  
  // Handle sending messages
  socket.on('sendMessage', async (message) => {
    try {
      const newMessage = new Message({
        sender: message.sender,
        receiver: message.receiver,
        content: message.content,
        timestamp: new Date()
      });
      await newMessage.save();
      const receiverSocketId = onlineUsers.get(message.receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', newMessage);
      }
      socket.emit('messageSent', newMessage);
    } catch (error) {
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });
  
  // Handle user disconnection
  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        socket.broadcast.emit('userOffline', userId);
        break;
      }
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
});

