import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance, { isAuthenticated } from '../utils/axios';
import TravelStatusForm from '../components/TravelStatusForm';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTravelForm, setShowTravelForm] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Fetch user data
    fetchUserData();
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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }
  
  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">No user data found.</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
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
      </div>
    </div>
  );
};

export default Dashboard; 