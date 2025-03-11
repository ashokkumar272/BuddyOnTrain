import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance, { isAuthenticated } from '../utils/axios';
import Navbar from '../components/Navbar';

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    fetchUserData();
  }, [userId, navigate]);

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
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-yellow-700">
                <strong>Note:</strong> Chat functionality is coming soon! This is just a placeholder for now.
              </p>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg min-h-[300px] flex items-center justify-center">
              <p className="text-gray-500 text-lg">Chat interface will be implemented in a future update.</p>
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