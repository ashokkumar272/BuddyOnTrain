import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance, { isAuthenticated } from '../utils/axios';
import TravelStatusForm from '../components/TravelStatusForm';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTravelForm, setShowTravelForm] = useState(false);
  const [friendRequests, setFriendRequests] = useState({ incoming: [], outgoing: [] });
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Fetch user data
    fetchUserData();
    // Fetch friend requests
    fetchFriendRequests();
    // Fetch friends list
    fetchFriends();
  }, [navigate]);
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/users/me');
      
      if (response.data.success) {
        setUserData(response.data.user);
      }
    } catch (error) {
      setError('Failed to fetch user data. Please try again.');
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFriendRequests = async () => {
    try {
      const response = await axiosInstance.get('/api/friends/requests');
      
      if (response.data.success) {
        setFriendRequests({
          incoming: response.data.data.incoming || [],
          outgoing: response.data.data.outgoing || []
        });
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const response = await axiosInstance.get('/api/users/friends');
      
      if (response.data.success) {
        setFriends(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };
  
  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await axiosInstance.post('/api/friends/respond', {
        requestId,
        status: 'accepted'
      });
      
      if (response.data.success) {
        // Refresh friend requests after accepting
        fetchFriendRequests();
        // Also refresh the friends list since we've added a new friend
        fetchFriends();
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };
  
  const handleRejectRequest = async (requestId) => {
    try {
      const response = await axiosInstance.post('/api/friends/respond', {
        requestId,
        status: 'rejected'
      });
      
      if (response.data.success) {
        // Refresh friend requests after rejecting
        fetchFriendRequests();
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };
  
  const handleCancelRequest = async (requestId) => {
    try {
      const response = await axiosInstance.post('/api/friends/respond', {
        requestId,
        status: 'rejected'
      });
      
      if (response.data.success) {
        // Refresh friend requests after cancelling
        fetchFriendRequests();
      }
    } catch (error) {
      console.error('Error cancelling friend request:', error);
    }
  };
  
  const handleTravelStatusUpdate = (updatedTravelStatus) => {
    // Update the local user data with the new travel status
    setUserData(prevData => ({
      ...prevData,
      travelStatus: updatedTravelStatus
    }));
  };
  
  // Format travel date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  // Format date functions
  const formatLastSeen = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const lastSeen = new Date(dateString);
    const now = new Date();
    const diffMs = now - lastSeen;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return lastSeen.toLocaleDateString();
  };

  const viewUserProfile = (userId) => {
    navigate(`/user-profile/${userId}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }
  
  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-gray-600">No user data found.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="text-lg text-gray-800">{userData.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg text-gray-800">{userData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-lg text-gray-800">{userData.name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="text-lg text-gray-800">{userData.age || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Profession</p>
              <p className="text-lg text-gray-800">{userData.profession || 'Not set'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Bio</p>
              <p className="text-lg text-gray-800">{userData.bio || 'Not set'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Travel Status</h2>
            <button 
              onClick={() => setShowTravelForm(!showTravelForm)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              {showTravelForm ? 'Cancel' : 'Update Travel Status'}
            </button>
          </div>
          
          {showTravelForm ? (
            <TravelStatusForm 
              onClose={() => setShowTravelForm(false)} 
              currentTravelStatus={userData.travelStatus}
              onUpdateSuccess={handleTravelStatusUpdate}
            />
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Travel Status</p>
                  <p className="text-lg text-gray-800">
                    {userData.travelStatus?.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Travel Date</p>
                  <p className="text-lg text-gray-800">
                    {userData.travelStatus?.travelDate ? formatDate(userData.travelStatus.travelDate) : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Boarding Station</p>
                  <p className="text-lg text-gray-800">
                    {userData.travelStatus?.boardingStation || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Destination Station</p>
                  <p className="text-lg text-gray-800">
                    {userData.travelStatus?.destinationStation || 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Friend Requests Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Friend Requests</h2>
          
          {/* Incoming Requests */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Incoming Requests 
              {friendRequests.incoming.length > 0 && 
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {friendRequests.incoming.length}
                </span>
              }
            </h3>
            
            {friendRequests.incoming.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {friendRequests.incoming.map(request => (
                  <div key={request._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center cursor-pointer" onClick={() => viewUserProfile(request.sender._id)}>
                      <div>
                        <p className="font-medium text-gray-800">{request.sender.name || request.sender.username}</p>
                        {request.sender.profession && (
                          <p className="text-sm text-gray-500">{request.sender.profession}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAcceptRequest(request._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleRejectRequest(request._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No incoming friend requests</p>
            )}
          </div>
          
          {/* Outgoing Requests */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Sent Requests 
              {friendRequests.outgoing.length > 0 && 
                <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {friendRequests.outgoing.length}
                </span>
              }
            </h3>
            
            {friendRequests.outgoing.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {friendRequests.outgoing.map(request => (
                  <div key={request._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center cursor-pointer" onClick={() => viewUserProfile(request.receiver._id)}>
                      <div>
                        <p className="font-medium text-gray-800">{request.receiver.name || request.receiver.username}</p>
                        {request.receiver.profession && (
                          <p className="text-sm text-gray-500">{request.receiver.profession}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          Status: <span className="capitalize">{request.status}</span>
                        </p>
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <button 
                        onClick={() => handleCancelRequest(request._id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No outgoing friend requests</p>
            )}
          </div>
        </div>
        
        {/* Friends List Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">My Friends 
            {friends.length > 0 && 
              <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {friends.length}
              </span>
            }
          </h2>
          
          {loadingFriends ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Loading friends...</p>
            </div>
          ) : friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map(friend => (
                <div 
                  key={friend._id} 
                  className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div onClick={() => viewUserProfile(friend._id)}>
                      <p className="font-medium text-gray-800">{friend.name || friend.username}</p>
                      {friend.profession && (
                        <p className="text-sm text-gray-500">{friend.profession}</p>
                      )}
                      <div className="flex items-center mt-1">
                        <span className={`w-2 h-2 rounded-full mr-1 ${friend.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <span className="text-xs text-gray-500">
                          {friend.online ? 'Online' : `Last seen: ${formatLastSeen(friend.lastSeen)}`}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/chat/${friend._id}`);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded transition-colors"
                    >
                      Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">You don't have any friends yet. Start by finding travel buddies!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 