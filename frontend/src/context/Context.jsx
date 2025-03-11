import React, { createContext, useContext, useState } from 'react';
import axiosInstance from '../utils/axios';

const TrainContext = createContext();

export const TrainProvider = ({ children }) => {
  const [toStation, setToStation] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [trains, setTrains] = useState([]);
  const [list, setList] = useState(false);
  const [suggestions, setSuggestions] = useState(false);
  const [buddies, setBuddies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchTrains = async () => {
    if (!fromStation || !toStation || !selectedDate) {
      return;
    }
    const formattedDate = selectedDate.split("-").reverse().join("-");
    const url = `http://localhost:4000/api/trains?from=${fromStation}&to=${toStation}&train_date=${formattedDate}`;
    try {
      const response = await fetch(url);
      const result = await response.json();
      console.log(result);
      setTrains(result.data);
    } catch (error) {
      console.error("Error fetching trains:", error);
      setTrains([]);
    }
  };

  const findBuddies = async () => {
    if (!fromStation || !toStation || !selectedDate) {
      setError('Please fill in all search fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format date for API request - using same format as searchTrains
      // The backend will handle date parsing from this format
      const formattedDate = selectedDate.split("-").reverse().join("-");
      
      console.log("Finding buddies with params:", {
        from: fromStation,
        to: toStation,
        date: formattedDate,
        originalDate: selectedDate
      });
      
      // Log the date objects for debugging
      console.log("Date objects:", {
        originalDate: new Date(selectedDate),
        formattedDate: new Date(formattedDate),
        formattedDateParts: formattedDate.split('-')
      });
      
      // Make API request to find travel buddies
      const response = await axiosInstance.get('/api/users/travel-buddies', {
        params: {
          from: fromStation,
          to: toStation,
          date: formattedDate
        }
      });

      console.log("Buddies response:", response.data);

      if (response.data.success) {
        if (response.data.data && Array.isArray(response.data.data)) {
          // Get current user ID from localStorage
          const currentUserId = localStorage.getItem('userId');
          
          // Filter out the current user from the buddies list
          const filteredBuddies = response.data.data.filter(buddy => buddy._id !== currentUserId);
          
          setBuddies(filteredBuddies);
          console.log("Setting buddies (filtered):", filteredBuddies);
        } else {
          setBuddies([]);
          console.log("No buddies data in response or invalid format");
        }
        // Show suggestions panel
        setSuggestions(true);
      } else {
        setError(response.data.message || 'Failed to find travel buddies');
      }
    } catch (error) {
      console.error('Error finding travel buddies:', error);
      setError(
        error.response?.data?.message || 
        'An error occurred. Please try again.'
      );
      setBuddies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TrainContext.Provider
      value={{
        toStation,
        setToStation,
        fromStation,
        setFromStation,
        selectedDate,
        setSelectedDate,
        trains,
        setTrains,
        list,
        setList,
        suggestions,
        setSuggestions,
        searchTrains,
        buddies,
        setBuddies,
        findBuddies,
        loading,
        error
      }}
    >
      {children}
    </TrainContext.Provider>
  );
};

export const useTrainContext = () => {
  const context = useContext(TrainContext);
  if (!context) {
    throw new Error('useTrainContext must be used within a TrainProvider');
  }
  return context;
};
