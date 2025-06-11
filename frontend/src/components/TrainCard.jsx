import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "../utils/axios";
import ClassInfo from "./ClassInfo";

const TrainCard = ({ train }) => {
  const [isListing, setIsListing] = useState(false);
  const [listingError, setListingError] = useState(null);
  const [listingSuccess, setListingSuccess] = useState(false);
  const [isListed, setIsListed] = useState(false);
  const [userData, setUserData] = useState(null);
  const [unlistSuccess, setUnlistSuccess] = useState(false);  const [selectedClass, setSelectedClass] = useState("");

  // Check if user is already listed on this train
  useEffect(() => {
    const checkUserListing = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) return;

        // Get user data to check current travel status
        const response = await axiosInstance.get('/api/users/me');
        
        if (response.data.success) {
          setUserData(response.data.user);
          
          const travelStatus = response.data.user.travelStatus;
            // Check if user is listed on this train
          if (travelStatus && 
              travelStatus.isActive && 
              travelStatus.boardingStation === train.fromStation?.code && 
              travelStatus.destinationStation === train.toStation?.code && 
              travelStatus.trainNumber === train.trainNumber) {
            
            // Compare dates (only compare the date part)
            const trainDate = new Date(train.train_date);
            const userDate = new Date(travelStatus.travelDate);
            
            if (trainDate.toDateString() === userDate.toDateString()) {
              setIsListed(true);
              setListingSuccess(true);
              // Set the selected class from user data
              if (travelStatus.preferredClass) {
                setSelectedClass(travelStatus.preferredClass);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking user listing:", error);
      }
    };

    checkUserListing();
  }, [train]);

  const handleClassSelect = (classType) => {
    setSelectedClass(classType);
  };
  const handleStartListing = () => {
    // No longer needed - user selects class directly from displayed classes
    // Just proceed with listing if class is selected
    if (!selectedClass) {
      setListingError("Please select a travel class first");
      return;
    }
    handleListYourself();
  };

  const handleListYourself = async () => {
    // For unlisting, proceed directly
    if (isListed) {
      await performListingAction();
      return;
    }
    
    // For listing, validate class selection first
    if (!selectedClass) {
      setListingError("Please select a travel class before listing yourself");
      return;
    }
    
    // Proceed with listing action
    await performListingAction();
  };
  
  const performListingAction = async () => {
    setIsListing(true);
    setListingError(null);
    setUnlistSuccess(false);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setListingError("Please login to list yourself on this train");
        setIsListing(false);
        return;
      }

      // If already listed, unlist
      if (isListed) {
        // Create travel status data with all fields blank/empty
        const travelStatusData = {
          boardingStation: "",
          destinationStation: "",
          travelDate: null,
          trainNumber: "",
          preferredClass: "",
          isActive: false
        };

        // Make API request to update travel status (unlist)
        const response = await axiosInstance.put(
          '/api/users/travel-status',
          travelStatusData
        );        if (response.data.success) {
          setIsListed(false);
          setListingSuccess(false);
          setUnlistSuccess(true);
          // Clear the unlist success message after 3 seconds
          setTimeout(() => {
            setUnlistSuccess(false);
          }, 3000);} else {
          setListingError("Failed to unlist from this train");
        }
      } else {
        // Format the train date correctly - to ensure it matches the format expected when searching
        let trainDate;
        
        try {
          // For the new API response, we expect train_date to be in the correct format already
          trainDate = new Date(train.train_date || new Date().toISOString().split('T')[0]);
          
          console.log('Listing user with date:', {
            original: train.train_date,
            parsed: trainDate,
            isoString: trainDate.toISOString()
          });
        } catch (error) {
          console.error('Error parsing train date:', error);
          trainDate = new Date(); // Default to current date on error
        }

        // Create travel status data to list on train
        const travelStatusData = {
          boardingStation: train.fromStation?.code || train.from,
          destinationStation: train.toStation?.code || train.to,
          travelDate: trainDate,
          trainNumber: train.trainNumber || train.train_number,
          preferredClass: selectedClass,
          isActive: true
        };

        console.log('Updating travel status with:', travelStatusData);

        // Make API request to update travel status (list)
        const response = await axiosInstance.put(
          '/api/users/travel-status',
          travelStatusData
        );        if (response.data.success) {
          setIsListed(true);
          setListingSuccess(true);
          console.log('Successfully listed on train:', response.data);
        } else {
          setListingError("Failed to list yourself on this train");
        }
      }
    } catch (error) {
      console.error('Error updating travel status:', error);
      setListingError(
        error.response?.data?.message || 
        "An error occurred. Please try again."
      );
    } finally {
      setIsListing(false);
    }
  };

  return (    <li
      key={train.trainNumber || train.train_number}
      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {train.trainName || train.train_name}
            <span className="text-blue-600 font-medium">
              ({train.trainNumber || train.train_number})
            </span>
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
              {train.duration ? `${Math.floor(train.duration / 60)}h ${train.duration % 60}m` : 'N/A'}
            </span>
            <span>{train.train_date}</span>
            {train.trainType && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {train.trainType}
              </span>
            )}
          </div>        </div>
      </div>

      <div className="flex justify-between">
        <div className="space-y-2">
          <p className="font-medium text-gray-900">
            {train.fromStation?.name || train.from_station_name} ({train.fromStation?.code || train.from})
          </p>
          <div className="text-sm text-gray-600">
            <p>Departure: {train.departureTime || train.from_std}</p>
            {train.fromStation?.city && (
              <p className="text-xs text-gray-500">{train.fromStation.city}</p>
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="w-8 h-px bg-gray-300 mt-3"></div>
          {train.distance && (
            <div className="text-xs text-gray-500 mt-1">{train.distance} km</div>
          )}
        </div>

        <div className="space-y-2 text-right">
          <p className="font-medium text-gray-900">
            {train.toStation?.name || train.to_station_name} ({train.toStation?.code || train.to})
          </p>          <div className="text-sm text-gray-600">
            <p>Arrival: {train.arrivalTime || train.to_sta}</p>
            {train.toStation?.city && (
              <p className="text-xs text-gray-500">{train.toStation.city}</p>
            )}
          </div>
        </div>
      </div>      {/* Available Classes Section */}
      <ClassInfo 
        train={train}
        selectedClass={selectedClass}
        onClassSelect={handleClassSelect}
      />

      {/* List/Unlist Button and Status */}
      <div className="mt-4 flex justify-center">
        {isListed && listingSuccess ? (
          <div className="flex flex-col items-center">
            <div className="text-green-600 font-medium mb-2">
              You are listed on this train in <span className="font-bold">{selectedClass}</span> class! Fellow travelers can find you.
            </div>
            <button
              onClick={handleListYourself}
              disabled={isListing}
              className="bg-red-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-red-700 transition-all disabled:bg-red-300"
            >
              {isListing ? "Processing..." : "Unlist Yourself"}
            </button>
          </div>
        ) : unlistSuccess ? (
          <div className="text-blue-600 font-medium">
            You have been unlisted from this train successfully!
          </div>
        ) : (
          <button
            onClick={handleStartListing}
            disabled={isListing}
            className={`text-white font-semibold px-8 py-3 rounded-lg transition-all ${
              selectedClass ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            {isListing ? "Processing..." : selectedClass ? "List Yourself" : "Select a Class First"}
          </button>
        )}
      </div>
      
      {/* Error message */}
      {listingError && (
        <div className="mt-2 text-red-600 text-center">
          {listingError}
        </div>
      )}
    </li>
  );
};

export default TrainCard;
