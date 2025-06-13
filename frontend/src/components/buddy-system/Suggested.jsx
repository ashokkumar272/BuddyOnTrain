import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

const Suggested = ({ id, name, profession, isFriend: initialIsFriend, travelDetails }) => {
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(false);
  const [isFriend, setIsFriend] = useState(initialIsFriend || false);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  // Check if an invitation already exists or if the user is already a friend on component mount
  useEffect(() => {
    // If isFriend is already true from props, skip checking
    if (!isFriend) {
      checkExistingRequest();
      checkFriendshipStatus();
    }
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const checkExistingRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axiosInstance.get('/api/friends/requests');
      
      if (response.data.success) {
        // Check outgoing requests for pending
        const outgoingPendingRequest = response.data.data.outgoing.find(
          req => req.receiver._id === id && req.status === 'pending'
        );
        
        if (outgoingPendingRequest) {
          setInvited(true);
          setRequestId(outgoingPendingRequest._id);
        }
        
        // Check both outgoing and incoming requests for accepted status (they're now friends)
        const outgoingAcceptedRequest = response.data.data.outgoing.find(
          req => req.receiver._id === id && req.status === 'accepted'
        );
        
        const incomingAcceptedRequest = response.data.data.incoming.find(
          req => req.sender._id === id && req.status === 'accepted'
        );
        
        if (outgoingAcceptedRequest || incomingAcceptedRequest) {
          setIsFriend(true);
          console.log(`Friend request found for user ${id} - setting isFriend to true`);
        }
      }
    } catch (error) {
      console.error('Error checking existing request:', error);
    }
  };

  // Check if the user is in the current user's friends list
  const checkFriendshipStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axiosInstance.get('/api/users/me');
      
      if (response.data.success && response.data.user.friends) {
        // Convert MongoDB ObjectIds to strings for comparison
        const userFriends = response.data.user.friends;
        
        // Check if any of the friend IDs matches the current suggested user ID
        const isFriendFound = userFriends.some(friendId => 
          friendId.toString() === id.toString() || 
          friendId === id
        );
        
        if (isFriendFound) {
          setIsFriend(true);
          console.log(`User ${id} is a friend`);
        }
      }
    } catch (error) {
      console.error('Error checking friendship status:', error);
    }
  };

  const handleInvite = async () => {
    // If already invited, delete the request
    if (invited && requestId) {
      return handleDeleteRequest();
    }

    setInviting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please login to send an invitation");
        setInviting(false);
        return;
      }

      // Send friend request
      const response = await axiosInstance.post('/api/friends/request', {
        receiverId: id
      });

      if (response.data.success) {
        setInvited(true);
        setRequestId(response.data.data._id);
        setSuccessMessage('Invitation sent successfully!');
      } else {
        setError(response.data.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      setError(
        error.response?.data?.message || 
        'An error occurred. Please try again.'
      );
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteRequest = async () => {
    setInviting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axiosInstance.post('/api/friends/respond', {
        requestId: requestId,
        status: 'rejected'  // Using reject to cancel the request
      });

      if (response.data.success) {
        setInvited(false);
        setRequestId(null);
        setSuccessMessage('Invitation deleted successfully!');
      } else {
        setError(response.data.message || 'Failed to delete invitation');
      }
    } catch (error) {
      console.error('Error deleting invitation:', error);
      setError(
        error.response?.data?.message || 
        'An error occurred. Please try again.'
      );
    } finally {
      setInviting(false);
    }
  };

  const viewProfile = () => {
    navigate(`/user-profile/${id}`);
  };

  const goToChat = (e) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    navigate(`/chat/${id}`);
  };

  return (
    <div className='flex flex-col gap-2 my-4 p-4 shadow-md rounded-lg hover:shadow-lg transition-shadow cursor-pointer' onClick={viewProfile}>
      <div className='flex justify-between items-center'>
        <div className='font-medium text-lg'>{name}</div>
        {isFriend ? (
          <button 
            onClick={goToChat}
            className='bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-all'
          >
            Chat
          </button>
        ) : (
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the parent onClick
              handleInvite();
            }}
            disabled={inviting}
            className={`${
              invited 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-semibold px-4 py-2 rounded-lg transition-all disabled:bg-gray-400`}
          >
            {inviting 
              ? (invited ? 'Deleting...' : 'Sending...') 
              : invited 
                ? 'Delete Invite' 
                : 'Invite'
            }
          </button>
        )}
      </div>
      
      {profession && (
        <div className='text-gray-600 text-sm'>{profession}</div>
      )}
      
      {/* Display train details if available */}
      {travelDetails && (travelDetails.trainNumber || travelDetails.preferredClass) && (
        <div className='mt-2 p-2 bg-blue-50 rounded-md'>
          {travelDetails.trainNumber && (
            <div className='text-sm'>
              <span className='text-gray-600'>Train No:</span> 
              <span className='ml-1 text-blue-700 font-medium'>
                {travelDetails.trainNumber}
              </span>
            </div>
          )}
          {travelDetails.preferredClass && (
            <div className='text-sm'>
              <span className='text-gray-600'>Class:</span> 
              <span className='ml-1 text-blue-700 font-medium'>
                {travelDetails.preferredClass}
              </span>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className='text-red-600 text-sm mt-1'>{error}</div>
      )}
      
      {successMessage && (
        <div className='text-green-600 text-sm mt-1'>{successMessage}</div>
      )}
    </div>
  );
};

export default Suggested;