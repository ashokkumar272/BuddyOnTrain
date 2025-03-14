import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "../utils/axios";

const TrainCard = ({ train }) => {
  const [isListing, setIsListing] = useState(false);
  const [listingError, setListingError] = useState(null);
  const [listingSuccess, setListingSuccess] = useState(false);
  const [isListed, setIsListed] = useState(false);
  const [userData, setUserData] = useState(null);
  const [unlistSuccess, setUnlistSuccess] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [showClassSelection, setShowClassSelection] = useState(false);

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
              travelStatus.boardingStation === train.from && 
              travelStatus.destinationStation === train.to && 
              travelStatus.trainNumber === train.train_number) {
            
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
    // Show class selection before proceeding with listing
    setShowClassSelection(true);
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
        );

        if (response.data.success) {
          setIsListed(false);
          setListingSuccess(false);
          setUnlistSuccess(true);
          setShowClassSelection(false);
          // Clear the unlist success message after 3 seconds
          setTimeout(() => {
            setUnlistSuccess(false);
          }, 3000);
        } else {
          setListingError("Failed to unlist from this train");
        }
      } else {
        // Format the train date correctly - to ensure it matches the format expected when searching
        let trainDate;
        
        try {
          // Parse the train date string to ensure consistent format
          // First, handle common formats like "DD-MM-YYYY" or "YYYY-MM-DD"
          if (typeof train.train_date === 'string') {
            // Check if it's already a valid date string
            const directDate = new Date(train.train_date);
            
            if (!isNaN(directDate.getTime())) {
              // Valid date object
              trainDate = directDate;
            } else {
              // Try to parse from DD-MM-YYYY format
              const dateParts = train.train_date.split('-');
              if (dateParts.length === 3) {
                // If in DD-MM-YYYY format, convert to YYYY-MM-DD for proper storing
                trainDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
              } else {
                // Default to current date if parsing fails
                trainDate = new Date();
              }
            }
          } else {
            // Default to current date if not a string
            trainDate = new Date();
          }
          
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
          boardingStation: train.from,
          destinationStation: train.to,
          travelDate: trainDate,
          trainNumber: train.train_number,
          preferredClass: selectedClass,
          isActive: true
        };

        console.log('Updating travel status with:', travelStatusData);

        // Make API request to update travel status (list)
        const response = await axiosInstance.put(
          '/api/users/travel-status',
          travelStatusData
        );

        if (response.data.success) {
          setIsListed(true);
          setListingSuccess(true);
          setShowClassSelection(false);
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

  return (
    <li
      key={train.train_number}
      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {train.train_name}
            <span className="text-blue-600 font-medium">
              ({train.train_number})
            </span>
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
              {train.duration}
            </span>
            <span>{train.train_date}</span>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className="text-sm font-medium text-gray-700">Class</span>
          <div className="flex space-x-1">
            {train.class_type?.map((cls) => (
              <span
                key={cls}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {cls}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="space-y-2">
          <p className="font-medium text-gray-900">
            {train.from_station_name} ({train.from})
          </p>
          <div className="text-sm text-gray-600">
            <p>Scheduled Departure: {train.from_std}</p>
            <p>Actual Departure: {train.from_sta}</p>
          </div>
        </div>

        <div className="text-center">
          <div className="w-8 h-px bg-gray-300 mt-3"></div>
        </div>

        <div className="space-y-2 text-right">
          <p className="font-medium text-gray-900">
            {train.to_station_name} ({train.to})
          </p>
          <div className="text-sm text-gray-600">
            <p>Scheduled Arrival: {train.to_sta}</p>
            <p>Actual Arrival: {train.to_std}</p>
          </div>
        </div>
      </div>

      {/* Class Selection UI */}
      {showClassSelection && !isListed && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Select your preferred class:</h4>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {train.class_type?.map((cls) => (
              <button
                key={cls}
                className={`px-4 py-2 rounded text-sm ${
                  selectedClass === cls
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handleClassSelect(cls)}
              >
                {cls}
              </button>
            ))}
          </div>
          {selectedClass && (
            <div className="text-center text-sm text-gray-600 mb-3">
              Selected class: <span className="font-semibold">{selectedClass}</span>
            </div>
          )}
        </div>
      )}

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
        ) : showClassSelection ? (
          <button
            onClick={handleListYourself}
            disabled={isListing || !selectedClass}
            className={`text-white font-semibold px-8 py-3 rounded-lg transition-all ${
              !selectedClass ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isListing ? "Processing..." : "Confirm Listing"}
          </button>
        ) : (
          <button
            onClick={handleStartListing}
            disabled={isListing}
            className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-all disabled:bg-blue-300"
          >
            {isListing ? "Processing..." : "List Yourself"}
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
