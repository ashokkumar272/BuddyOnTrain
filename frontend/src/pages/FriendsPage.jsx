import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance, { isAuthenticated } from '../utils/axios';
import { Navbar } from '../components/layout';

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [removingFriend, setRemovingFriend] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchFriends();
  }, [navigate]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/users/friends');
      
      if (response.data.success) {
        setFriends(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId, friendName) => {
    if (!window.confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
      return;
    }

    setRemovingFriend(friendId);

    try {
      const response = await axiosInstance.delete('/api/friends/remove', {
        data: { friendId }
      });
      
      if (response.data.success) {
        setFriends(friends.filter(friend => friend._id !== friendId));
        alert('Friend removed successfully!');
      } else {
        alert('Failed to remove friend. Please try again.');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('An error occurred while removing friend. Please try again.');
    } finally {
      setRemovingFriend(null);
    }
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredFriends = friends.filter(friend =>
    (friend.name && friend.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (friend.username && friend.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (friend.profession && friend.profession.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-2xl text-gray-600">Loading friends...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">My Friends</h1>
                <p className="text-blue-100 mt-2">
                  {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search friends by name, username, or profession..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Friends List */}
          <div className="p-6">
            {filteredFriends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFriends.map(friend => (
                  <div 
                    key={friend._id} 
                    className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                  >
                    {/* Friend Info */}
                    <div 
                      className="cursor-pointer mb-4"
                      onClick={() => navigate(`/user-profile/${friend._id}`)}
                    >
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {friend.name || friend.username}
                      </h3>
                      {friend.profession && (
                        <p className="text-gray-600 text-sm mb-2">{friend.profession}</p>
                      )}
                      {friend.bio && (
                        <p className="text-gray-700 text-sm italic line-clamp-2 mb-3">{friend.bio}</p>
                      )}
                      
                      {/* Online Status */}
                      <div className="flex items-center mb-3">
                        <span className={`w-3 h-3 rounded-full mr-2 ${friend.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <span className="text-sm text-gray-500">
                          {friend.online ? 'Online' : `Last seen: ${formatLastSeen(friend.lastSeen)}`}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigate(`/chat/${friend._id}`)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-4 rounded-lg transition-colors"
                      >
                        💬 Chat
                      </button>
                      <button 
                        onClick={() => handleRemoveFriend(friend._id, friend.name || friend.username)}
                        disabled={removingFriend === friend._id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {removingFriend === friend._id ? '⏳ Removing...' : '🗑️ Remove'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                {searchTerm ? (
                  <div>
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <p className="text-gray-500 text-lg">No friends found matching "{searchTerm}"</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-400 text-6xl mb-4">👥</div>
                    <p className="text-gray-500 text-lg mb-4">You don't have any friends yet.</p>
                    <p className="text-gray-400 mb-6">Start by finding travel buddies and sending friend requests!</p>
                    <button
                      onClick={() => navigate('/')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Find Travel Buddies
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
