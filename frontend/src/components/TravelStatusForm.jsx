import React, { useState, useEffect } from 'react';
import axiosInstance, { isAuthenticated } from '../utils/axios';

const TravelStatusForm = ({ onClose, currentTravelStatus, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    boardingStation: '',
    destinationStation: '',
    travelDate: '',
    isActive: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Initialize form with current travel status if available
    if (currentTravelStatus) {
      const formattedDate = currentTravelStatus.travelDate 
        ? new Date(currentTravelStatus.travelDate).toISOString().split('T')[0]
        : '';
        
      setFormData({
        boardingStation: currentTravelStatus.boardingStation || '',
        destinationStation: currentTravelStatus.destinationStation || '',
        travelDate: formattedDate,
        isActive: currentTravelStatus.isActive || false
      });
    }
  }, [currentTravelStatus]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' 
      ? e.target.checked 
      : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate boarding and destination stations if user is setting travel as active
      if (formData.isActive) {
        if (!formData.boardingStation) {
          throw new Error('Boarding station is required when travel status is active');
        }
        if (!formData.destinationStation) {
          throw new Error('Destination station is required when travel status is active');
        }
        if (!formData.travelDate) {
          throw new Error('Travel date is required when travel status is active');
        }
      }

      // Send request to update travel status
      const response = await axiosInstance.put('/api/users/travel-status', formData);
      
      if (response.data.success) {
        setSuccess('Travel status updated successfully');
        // Call the success callback if provided
        if (onUpdateSuccess) {
          onUpdateSuccess(response.data.travelStatus);
        }
        
        // Close the form after a short delay if onClose is provided
        if (onClose) {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 
        error.message || 
        'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const clearTravelStatus = () => {
    setFormData({
      boardingStation: '',
      destinationStation: '',
      travelDate: '',
      isActive: false
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {formData.isActive ? 'Update Travel Status' : 'Set Travel Status'}
        </h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="boardingStation">
            Boarding Station
          </label>
          <input
            type="text"
            name="boardingStation"
            id="boardingStation"
            value={formData.boardingStation}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter boarding station"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destinationStation">
            Destination Station
          </label>
          <input
            type="text"
            name="destinationStation"
            id="destinationStation"
            value={formData.destinationStation}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter destination station"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="travelDate">
            Travel Date
          </label>
          <input
            type="date"
            name="travelDate"
            id="travelDate"
            value={formData.travelDate}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="mr-2 leading-tight"
            />
            <span className="text-sm font-medium text-gray-700">
              I am currently traveling (activate travel status)
            </span>
          </label>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={clearTravelStatus}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Updating...' : 'Save Travel Status'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TravelStatusForm; 