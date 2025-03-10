import React, { useState } from 'react';
import axiosInstance from '../utils/axios';

const Suggested = ({ id, name, profession }) => {
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(false);
  const [error, setError] = useState(null);

  const handleInvite = async () => {
    setInviting(true);
    setError(null);

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

  return (
    <div className='flex flex-col gap-2 my-4 p-4 shadow-md rounded-lg hover:shadow-lg transition-shadow'>
      <div className='flex justify-between items-center'>
        <div className='font-medium text-lg'>{name}</div>
        {invited ? (
          <span className='text-green-600 font-medium'>Invited</span>
        ) : (
          <button 
            onClick={handleInvite}
            disabled={inviting}
            className='bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-all disabled:bg-blue-300'
          >
            {inviting ? 'Sending...' : 'Invite'}
          </button>
        )}
      </div>
      
      {profession && (
        <div className='text-gray-600 text-sm'>{profession}</div>
      )}
      
      {error && (
        <div className='text-red-600 text-sm mt-1'>{error}</div>
      )}
    </div>
  );
};

export default Suggested;