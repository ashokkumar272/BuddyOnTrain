import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import Navbar from '../components/Navbar';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    checkFriendRequestStatus();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axiosInstance.get(`/api/users/profile/${userId}`);
      
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setError('Failed to load user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('An error occurred while loading the profile');
    } finally {
      setLoading(false);
    }
  };

  const checkFriendRequestStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // First, check if the user is already a friend
      const meResponse = await axiosInstance.get('/api/users/me');
      
      if (meResponse.data.success && meResponse.data.user.friends) {
        // Convert ObjectIds to strings for comparison
        const friends = meResponse.data.user.friends;
        const isFriend = friends.some(friendId => 
          friendId.toString() === userId.toString() || 
          friendId === userId
        );
        
        if (isFriend) {
          setRequestStatus('friends');
          return;
        }
      }

      // If not a friend, check friend requests
      const response = await axiosInstance.get('/api/friends/requests');
      
      if (response.data.success) {
        // Check outgoing requests (both pending and accepted)
        const outgoingRequest = response.data.data.outgoing.find(
          req => req.receiver._id === userId
        );
        
        if (outgoingRequest) {
          if (outgoingRequest.status === 'accepted') {
            setRequestStatus('friends');
          } else {
            setRequestStatus('outgoing');
            setRequestId(outgoingRequest._id);
          }
          return;
        }

        // Check incoming requests (both pending and accepted)
        const incomingRequest = response.data.data.incoming.find(
          req => req.sender._id === userId
        );
        
        if (incomingRequest) {
          if (incomingRequest.status === 'accepted') {
            setRequestStatus('friends');
          } else {
            setRequestStatus('incoming');
            setRequestId(incomingRequest._id);
          }
          return;
        }

        setRequestStatus('none');
      }
    } catch (error) {
      console.error('Error checking friend request status:', error);
    }
  };

  const handleFriendRequest = async (action) => {
    setProcessingRequest(true);
    
    try {
      let response;
      
      if (action === 'send') {
        // Send a new friend request
        response = await axiosInstance.post('/api/friends/request', {
          receiverId: userId
        });
        
        if (response.data.success) {
          setRequestStatus('outgoing');
          setRequestId(response.data.data._id);
        }
      } else if (action === 'cancel' || action === 'reject') {
        // Cancel an outgoing request or reject an incoming request
        response = await axiosInstance.post('/api/friends/respond', {
          requestId: requestId,
          status: 'rejected'
        });
        
        if (response.data.success) {
          setRequestStatus('none');
          setRequestId(null);
        }
      } else if (action === 'accept') {
        // Accept an incoming request
        response = await axiosInstance.post('/api/friends/respond', {
          requestId: requestId,
          status: 'accepted'
        });
        
        if (response.data.success) {
          setRequestStatus('friends');
          setRequestId(null);
          
          // Refresh user data to update friends list
          setTimeout(() => {
            checkFriendRequestStatus();
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
    } finally {
      setProcessingRequest(false);
    }
  };

  const navigateToChat = () => {
    navigate(`/chat/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-2xl text-gray-600">Loading profile...</div>
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
            <h1 className="text-3xl font-bold">{user.name}</h1>
            {user.profession && (
              <p className="text-blue-100 mt-2">{user.profession}</p>
            )}
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
              </div>
              
              {/* Friend Request Button Section */}
              {requestStatus === 'none' && (
                <button
                  onClick={() => handleFriendRequest('send')}
                  disabled={processingRequest}
                  className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {processingRequest ? 'Processing...' : 'Send Friend Request'}
                </button>
              )}
              
              {requestStatus === 'outgoing' && (
                <button
                  onClick={() => handleFriendRequest('cancel')}
                  disabled={processingRequest}
                  className="mt-4 md:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                >
                  {processingRequest ? 'Processing...' : 'Cancel Request'}
                </button>
              )}
              
              {requestStatus === 'incoming' && (
                <div className="mt-4 md:mt-0 flex gap-2">
                  <button
                    onClick={() => handleFriendRequest('accept')}
                    disabled={processingRequest}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                  >
                    {processingRequest ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleFriendRequest('reject')}
                    disabled={processingRequest}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                  >
                    {processingRequest ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              )}
              
              {requestStatus === 'friends' && (
                <div className="mt-4 md:mt-0 flex items-center gap-3">
                  <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                    Friends
                  </span>
                  <button
                    onClick={navigateToChat}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Chat
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-gray-500 text-sm mb-1">Username</h3>
                <p className="text-gray-800">{user.username}</p>
              </div>
              
              {user.age && (
                <div>
                  <h3 className="text-gray-500 text-sm mb-1">Age</h3>
                  <p className="text-gray-800">{user.age}</p>
                </div>
              )}
              
              {user.email && (
                <div>
                  <h3 className="text-gray-500 text-sm mb-1">Email</h3>
                  <p className="text-gray-800">{user.email}</p>
                </div>
              )}
              
              {user.phone && (
                <div>
                  <h3 className="text-gray-500 text-sm mb-1">Phone</h3>
                  <p className="text-gray-800">{user.phone}</p>
                </div>
              )}
            </div>
            
            {user.bio && (
              <div className="mt-6">
                <h3 className="text-gray-500 text-sm mb-1">Bio</h3>
                <p className="text-gray-800 whitespace-pre-line">{user.bio}</p>
              </div>
            )}
            
            {user.travelStatus && user.travelStatus.fromStation && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Travel Status</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-gray-500 text-sm mb-1">From Station</h4>
                      <p className="text-gray-800">{user.travelStatus.fromStation}</p>
                    </div>
                    <div>
                      <h4 className="text-gray-500 text-sm mb-1">To Station</h4>
                      <p className="text-gray-800">{user.travelStatus.toStation}</p>
                    </div>
                    <div>
                      <h4 className="text-gray-500 text-sm mb-1">Date</h4>
                      <p className="text-gray-800">{new Date(user.travelStatus.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 