import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance, { isAuthenticated } from '../utils/axios';
import { Navbar } from '../components/layout';
import io from 'socket.io-client';

// Function to get the socket URL
const getSocketURL = () => {
  // Use environment variable or fallback to deployed backend URL
  return import.meta.env.VITE_SOCKET_URL || 'https://trainbuddy.onrender.com';
};

// Initialize WebSocket connection
const socket = io(getSocketURL());

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Get current user's ID
    const loggedInUserId = localStorage.getItem('userId');
    if (loggedInUserId) {
      setCurrentUserId(loggedInUserId);
      
      // Join the chat room
      socket.emit('joinChat', loggedInUserId);
    }
    
    fetchUserData();
    fetchChatHistory();
    
    // Setup socket event listeners
    socket.on('receiveMessage', (message) => {
      // Only add the message if it's from the current chat user
      if (message.sender === userId || message.receiver === userId) {
        setMessages(prevMessages => [...prevMessages, message]);
        
        // Mark the message as read
        markMessagesAsRead();
      }
    });
    
    socket.on('messageSent', (message) => {
      // Add the sent message to the messages list
      setMessages(prevMessages => [...prevMessages, message]);
    });
    
    socket.on('messageError', (error) => {
      console.error('Message error:', error);
    });
    
    // Clean up socket connection on unmount
    return () => {
      socket.off('receiveMessage');
      socket.off('messageSent');
      socket.off('messageError');
    };
  }, [userId, navigate]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get(`/api/users/profile/${userId}`);
      
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setError('Failed to load user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('An error occurred while loading user data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchChatHistory = async () => {
    try {
      const response = await axiosInstance.get(`/api/messages/${userId}`);
      
      if (response.data.success) {
        setMessages(response.data.data || []);
        
        // Mark messages as read when chat is opened
        markMessagesAsRead();
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };
  
  const markMessagesAsRead = async () => {
    try {
      await axiosInstance.put(`/api/messages/${userId}/read`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Function to send a message
  const sendMessage = () => {
    if (!newMessage.trim() || !currentUserId || !user) return;
    
    setSending(true);
    
    const message = {
      sender: currentUserId,
      receiver: userId,
      content: newMessage,
      timestamp: new Date()
    };
    
    socket.emit('sendMessage', message);
    setNewMessage('');
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-2xl text-gray-600">Loading chat...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-2xl text-red-600">{error || 'User not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
          <div className="bg-blue-600 p-6 text-white">
            <h1 className="text-3xl font-bold">Chat with {user.name || user.username}</h1>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-100 p-4 rounded-lg min-h-[300px] max-h-[500px] overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`mb-2 p-3 rounded-lg max-w-[80%] ${
                      msg.sender === currentUserId 
                        ? 'bg-blue-500 text-white ml-auto' 
                        : 'bg-gray-300 text-black'
                    }`}
                  >
                    <p className="break-words">{msg.content}</p>
                    <span className={`text-xs ${msg.sender === currentUserId ? 'text-blue-100' : 'text-gray-600'} block mt-1`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="mt-4">
              <div className="flex">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-grow border border-gray-300 p-2 rounded-l-lg focus:outline-none resize-none"
                  placeholder="Type a message..."
                  rows={2}
                  disabled={sending}
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Press Enter to send, Shift+Enter for new line</p>
            </div>
            
            <div className="mt-4 flex justify-between">
              <button 
                onClick={() => navigate(`/user-profile/${userId}`)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                View Profile
              </button>
              
              <button 
                onClick={() => navigate(-1)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 