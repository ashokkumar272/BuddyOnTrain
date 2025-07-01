import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

const Suggested = ({ id, name, profession, bio, isFriend: initialIsFriend, travelDetails }) => {
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(false);
  const [isFriend, setIsFriend] = useState(initialIsFriend || false);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isFriend) {
      checkExistingRequest();
      checkFriendshipStatus();
    }
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const checkExistingRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axiosInstance.get('/api/friends/requests');

      if (response.data.success) {
        const { outgoing, incoming } = response.data.data;

        const outgoingPendingRequest = outgoing.find(
          req => req.receiver._id === id && req.status === 'pending'
        );

        if (outgoingPendingRequest) {
          setInvited(true);
          setRequestId(outgoingPendingRequest._id);
        }

        const outgoingAcceptedRequest = outgoing.find(
          req => req.receiver._id === id && req.status === 'accepted'
        );
        const incomingAcceptedRequest = incoming.find(
          req => req.sender._id === id && req.status === 'accepted'
        );

        if (outgoingAcceptedRequest || incomingAcceptedRequest) {
          setIsFriend(true);
        }
      }
    } catch (error) {
      console.error('Error checking existing request:', error);
    }
  };

  const checkFriendshipStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axiosInstance.get('/api/users/me');

      if (response.data.success && response.data.user.friends) {
        const isFriendFound = response.data.user.friends.some(
          friendId => friendId.toString() === id.toString()
        );

        if (isFriendFound) {
          setIsFriend(true);
        }
      }
    } catch (error) {
      console.error('Error checking friendship status:', error);
    }
  };

  const handleInvite = async () => {
    if (invited && requestId) return handleDeleteRequest();

    setInviting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please login to send an invitation");
        setInviting(false);
        return;
      }

      const response = await axiosInstance.post('/api/friends/request', { receiverId: id });

      if (response.data.success) {
        setInvited(true);
        setRequestId(response.data.data._id);
        setSuccessMessage('Invitation sent successfully!');
      } else {
        setError(response.data.message || 'Failed to send invitation');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
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
        requestId,
        status: 'rejected',
      });

      if (response.data.success) {
        setInvited(false);
        setRequestId(null);
        setSuccessMessage('Invitation deleted successfully!');
      } else {
        setError(response.data.message || 'Failed to delete invitation');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your friends?`)) {
      return;
    }

    setInviting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please login to remove friend");
        setInviting(false);
        return;
      }

      const response = await axiosInstance.delete('/api/friends/remove', {
        data: { friendId: id }
      });

      if (response.data.success) {
        setIsFriend(false);
        setSuccessMessage('Friend removed successfully!');
      } else {
        setError(response.data.message || 'Failed to remove friend');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const viewProfile = () => navigate(`/user-profile/${id}`);

  const goToChat = (e) => {
    e.stopPropagation();
    navigate(`/chat/${id}`);
  };

  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden' onClick={viewProfile}>
      <div className='p-4 border-b border-gray-100'>
        <div className='flex justify-between items-start gap-3'>
          <div className='flex-1 min-w-0'>
            <h3 className='font-semibold text-base text-gray-900 mb-0.5 truncate'>{name}</h3>
            {profession && <p className='text-gray-600 text-xs mb-1'>{profession}</p>}
            {bio && <p className='text-gray-700 text-xs italic line-clamp-2'>{bio}</p>}
          </div>
          <div className='flex-shrink-0'>
            {isFriend ? (
              <div className="flex gap-2">
                <button
                  onClick={goToChat}
                  className='bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1.5 rounded-md shadow-sm'
                >
                  Chat
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFriend();
                  }}
                  disabled={inviting}
                  className='bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-md shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed'
                >
                  {inviting ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInvite();
                }}
                disabled={inviting}
                className={`${
                  invited
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white text-sm px-4 py-1.5 rounded-md shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {inviting ? (invited ? 'Deleting...' : 'Sending...') : invited ? 'Delete Invite' : 'Invite'}
              </button>
            )}
          </div>
        </div>
      </div>

      {travelDetails && (travelDetails.trainNumber || travelDetails.preferredClass || travelDetails.boardingStation || travelDetails.destinationStation) && (
        <div className='px-4 pb-4'>
          <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200 shadow-sm'>
            {/* Train Header */}
            {(travelDetails.trainNumber || travelDetails.trainName) && (
              <div className='flex items-center justify-between mb-3 pb-2 border-b border-blue-200'>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                  <span className='text-blue-800 text-sm font-semibold'>
                    {travelDetails.trainNumber && `${travelDetails.trainNumber}`}
                    {travelDetails.trainName && ` - ${travelDetails.trainName}`}
                  </span>
                </div>
                {travelDetails.preferredClass && (
                  <span className='bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium'>
                    {travelDetails.preferredClass}
                  </span>
                )}
              </div>
            )}
            
            {/* Route Information */}
            <div className='flex items-center justify-between'>
              {/* From Station */}
              <div className='flex-1'>
                <div className='text-sm font-semibold text-gray-800'>
                  {travelDetails.boardingStationName || travelDetails.boardingStation}
                </div>
                {travelDetails.boardingStationName && travelDetails.boardingStation && (
                  <div className='text-xs text-gray-500'>{travelDetails.boardingStation}</div>
                )}
              </div>
              
              {/* Arrow */}
              <div className='flex-shrink-0 mx-3'>
                <div className='flex items-center'>
                  <div className='w-6 h-0.5 bg-blue-400'></div>
                  <div className='w-2 h-2 border-r-2 border-t-2 border-blue-400 transform rotate-45 -ml-1'></div>
                </div>
              </div>
              
              {/* To Station */}
              <div className='flex-1 text-right'>
                <div className='text-sm font-semibold text-gray-800'>
                  {travelDetails.destinationStationName || travelDetails.destinationStation}
                </div>
                {travelDetails.destinationStationName && travelDetails.destinationStation && (
                  <div className='text-xs text-gray-500'>{travelDetails.destinationStation}</div>
                )}
              </div>
            </div>
            
            {/* Travel Date */}
            {travelDetails.travelDate && (
              <div className='mt-3 pt-2 border-t border-blue-200'>
                <div className='flex items-center justify-center gap-2'>
                  <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                  </svg>
                  <span className='text-sm text-blue-700 font-medium'>
                    {new Date(travelDetails.travelDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {(error || successMessage) && (
        <div className='px-4 pb-3'>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-md'>
              {error}
            </div>
          )}
          {successMessage && (
            <div className='bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2 rounded-md'>
              {successMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Suggested;
