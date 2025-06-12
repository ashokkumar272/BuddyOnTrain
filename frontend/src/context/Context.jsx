import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const TrainContext = createContext();

export const TrainProvider = ({ children }) => {
  const [toStation, setToStation] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [toStationCode, setToStationCode] = useState('');
  const [fromStationCode, setFromStationCode] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [trains, setTrains] = useState([]);
  const [list, setList] = useState(false);
  const [suggestions, setSuggestions] = useState(false);
  const [buddies, setBuddies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('trains'); // 'trains' or 'buddies'

  // Toggle between trains and buddies view for mobile
  const toggleView = (view) => {
    if (view === 'trains') {
      setActiveView('trains');
    } else if (view === 'buddies') {
      setActiveView('buddies');
    } else {
      // Toggle if no specific view provided
      setActiveView(prev => prev === 'trains' ? 'buddies' : 'trains');
    }
  };

  // Automatically switch views when actions are performed
  useEffect(() => {
    if (list && !suggestions) {
      setActiveView('trains');
    } else if (suggestions) {
      setActiveView('buddies');
    }
  }, [list, suggestions]);
  const searchTrains = async () => {
    if (!fromStationCode || !toStationCode || !selectedDate) {
      setError('Please select valid stations and date');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const formattedDate = selectedDate.split("-").reverse().join("-");
    const url = `http://localhost:4000/api/trains?from=${fromStationCode}&to=${toStationCode}&train_date=${formattedDate}`;
    
    try {
      const response = await fetch(url);
      const result = await response.json();
      console.log(result);
      if (result.status) {
        setTrains(result.data);
      } else {
        setError(result.message || 'Failed to fetch trains');
        setTrains([]);
      }
    } catch (error) {
      console.error("Error fetching trains:", error);
      setError('Failed to fetch trains. Please try again.');
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };
  const findBuddies = async () => {
    if (!fromStationCode || !toStationCode || !selectedDate) {
      setError('Please select valid stations and date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format date for API request - using same format as searchTrains
      // The backend will handle date parsing from this format
      const formattedDate = selectedDate.split("-").reverse().join("-");
      
      console.log("Finding buddies with params:", {
        from: fromStationCode,
        to: toStationCode,
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
          from: fromStationCode,
          to: toStationCode,
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
        toStationCode,
        setToStationCode,
        fromStationCode,
        setFromStationCode,
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
        error,
        setError,
        activeView,
        toggleView
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
