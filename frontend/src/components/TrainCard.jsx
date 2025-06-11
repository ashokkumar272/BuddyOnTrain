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
  const [unlistSuccess, setUnlistSuccess] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    const checkUserListing = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axiosInstance.get('/api/users/me');
        
        if (response.data.success) {
          setUserData(response.data.user);
          
          const travelStatus = response.data.user.travelStatus;
          if (travelStatus && 
              travelStatus.isActive && 
              travelStatus.boardingStation === train.fromStation?.code && 
              travelStatus.destinationStation === train.toStation?.code && 
              travelStatus.trainNumber === train.trainNumber) {
            
            const trainDate = new Date(train.train_date);
            const userDate = new Date(travelStatus.travelDate);
            
            if (trainDate.toDateString() === userDate.toDateString()) {
              setIsListed(true);
              setListingSuccess(true);
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

  const handleListYourself = async () => {
    if (isListed) {
      await performListingAction();
      return;
    }
    
    if (!selectedClass) {
      setListingError("Please select a travel class before listing yourself");
      return;
    }
    
    await performListingAction();
  };
  
  const performListingAction = async () => {
    setIsListing(true);
    setListingError(null);
    setUnlistSuccess(false);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setListingError("Please login to list yourself on this train");
        setIsListing(false);
        return;
      }

      if (isListed) {
        const travelStatusData = {
          boardingStation: "",
          destinationStation: "",
          travelDate: null,
          trainNumber: "",
          preferredClass: "",
          isActive: false
        };

        const response = await axiosInstance.put(
          '/api/users/travel-status',
          travelStatusData
        );
        if (response.data.success) {
          setIsListed(false);
          setListingSuccess(false);
          setUnlistSuccess(true);
          setTimeout(() => {
            setUnlistSuccess(false);
          }, 3000);
        } else {
          setListingError("Failed to unlist from this train");
        }
      } else {
        let trainDate;
        try {
          trainDate = new Date(train.train_date || new Date().toISOString().split('T')[0]);
        } catch (error) {
          console.error('Error parsing train date:', error);
          trainDate = new Date();
        }

        const travelStatusData = {
          boardingStation: train.fromStation?.code || train.from,
          destinationStation: train.toStation?.code || train.to,
          travelDate: trainDate,
          trainNumber: train.trainNumber || train.train_number,
          preferredClass: selectedClass,
          isActive: true
        };

        const response = await axiosInstance.put(
          '/api/users/travel-status',
          travelStatusData
        );
        if (response.data.success) {
          setIsListed(true);
          setListingSuccess(true);
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
      key={train.trainNumber || train.train_number}
      className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm hover:shadow-md transition-all mb-6 relative"
    >
      {/* Ribbon for listed status */}
      {isListed && listingSuccess && (
        <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg font-medium text-sm z-10">
          You're Listed
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex justify-between">
          <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center">
            <span className="mr-2">{train.trainName || train.train_name}</span>
            <span className="text-blue-600 font-medium text-base">
              ({train.trainNumber || train.train_number})
            </span>
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {train.train_date}
            </span>
            {train.trainType && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {train.trainType}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <p className="font-bold text-gray-900 text-lg">
            {train.fromStation?.name || train.from_station_name} 
            <span className="text-gray-600 ml-1">({train.fromStation?.code || train.from})</span>
          </p>
          <div className="text-sm text-gray-600">
            <p className="font-medium">Departure: {train.departureTime || train.from_std}</p>
            {train.fromStation?.city && (
              <p className="text-xs text-gray-500">{train.fromStation.city}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded">
              {train.duration ? `${Math.floor(train.duration / 60)}h ${train.duration % 60}m` : 'N/A'}
            </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <div className="w-24 h-0.5 bg-blue-300"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          </div>
          {train.distance && (
            <div className="text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded">
              {train.distance} km
            </div>
          )}
        </div>

        <div className="space-y-1 text-right">
          <p className="font-bold text-gray-900 text-lg">
            {train.toStation?.name || train.to_station_name} 
            <span className="text-gray-600 ml-1">({train.toStation?.code || train.to})</span>
          </p>
          <div className="text-sm text-gray-600">
            <p className="font-medium">Arrival: {train.arrivalTime || train.to_sta}</p>
            {train.toStation?.city && (
              <p className="text-xs text-gray-500">{train.toStation.city}</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <ClassInfo 
          train={train}
          selectedClass={selectedClass}
          onClassSelect={handleClassSelect}
        />
      </div>      <div className="mt-3 pt-3 flex justify-center">
        {isListed && listingSuccess ? (
          <div className="flex flex-col items-center w-full">
            <div className="text-green-600 font-medium mb-3 text-center">
              You are listed on this train in 
              <span className="font-bold text-green-700"> {selectedClass} </span> 
              class! Fellow travelers can find you.
            </div>
            <button
              onClick={handleListYourself}
              disabled={isListing}
              className="bg-red-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-red-700 transition-all disabled:bg-red-300 w-full max-w-xs"
            >
              {isListing ? "Processing..." : "Unlist Yourself"}
            </button>
          </div>
        ) : unlistSuccess ? (
          <div className="text-blue-600 font-medium py-3 px-4 bg-blue-50 rounded-lg border border-blue-200">
            You have been unlisted from this train successfully!
          </div>
        ) : selectedClass ? (
          <button
            onClick={handleListYourself}
            disabled={isListing}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-md font-semibold px-8 py-3 rounded-lg transition-all w-full max-w-xs"
          >
            {isListing ? "Processing..." : "List Yourself on This Train"}
          </button>
        ) : null}
      </div>
      
      {listingError && (
        <div className="mt-3 text-red-600 text-center bg-red-50 py-2 px-4 rounded-lg border border-red-200">
          {listingError}
        </div>
      )}
    </li>
  );
};

export default TrainCard;