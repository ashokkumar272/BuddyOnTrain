import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const TrainContext = createContext();

export const TrainProvider = ({ children }) => {
  const [toStation, setToStation] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [toStationCode, setToStationCode] = useState('');
  const [fromStationCode, setFromStationCode] = useState('');
  const [selectedDate, setSelectedDate] = useState('');  const [trains, setTrains] = useState([]);
  const [list, setList] = useState(false);
  const [showTrainResults, setShowTrainResults] = useState(false); // Separate state for train results
  const [suggestions, setSuggestions] = useState(false);
  const [buddies, setBuddies] = useState([]);  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('trains'); // 'trains' or 'buddies'
  const [searchInitiated, setSearchInitiated] = useState(false); // Track if any search has been initiated

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
  };  // Automatically switch views when actions are performed
  useEffect(() => {
    if (showTrainResults && !suggestions) {
      setActiveView('trains');
    } else if (suggestions && !showTrainResults) {
      setActiveView('buddies');
    } else if (suggestions && showTrainResults) {
      // Both available, keep current view or default to trains if none set
      if (activeView !== 'trains' && activeView !== 'buddies') {
        setActiveView('trains');
      }
    }
  }, [showTrainResults, suggestions, activeView]);// Function to sort trains by exact station code matches with priority levels
  
  const sortTrainsByStationMatch = (trains, fromCode, toCode) => {
  if (!Array.isArray(trains)) return [];

  console.log('Sorting trains by station match:', { fromCode, toCode });

  // Preprocess trains with priority
  const trainsWithPriority = trains.map(train => {
    const fromMatch = train.fromStation?.code === fromCode;
    const toMatch = train.toStation?.code === toCode;
    
    let priority = 4;
    if (fromMatch && toMatch) priority = 1;
    else if (fromMatch) priority = 2;
    else if (toMatch) priority = 3;

    return { ...train, priority };
  });

  // Sort by priority
  trainsWithPriority.sort((a, b) => a.priority - b.priority);

  // Group by priority for logging
  const grouped = [1, 2, 3, 4].reduce((acc, p) => {
    acc[p] = trainsWithPriority
      .filter(t => t.priority === p)
      .map(t => ({
        number: t.trainNumber,
        name: t.trainName,
        from: t.fromStation?.code,
        to: t.toStation?.code
      }));
    return acc;
  }, {});

  // Log grouped summary
  [1, 2, 3, 4].forEach(p => {
    if (grouped[p].length > 0) {
      console.log(`Priority ${p} (${[
        '',
        'Both stations match',
        'Only departure matches',
        'Only destination matches',
        'No matches'
      ][p]}): ${grouped[p].length} trains`);
      console.log(grouped[p]);
    }
  });

  return trainsWithPriority;
};
  const searchTrains = async () => {
    if (!fromStationCode || !toStationCode || !selectedDate) {
      setError('Please select valid stations and date');
      return;
    }
    
    setSearchInitiated(true); // Mark that a search has been initiated
    setLoading(true);
    setError(null);
    
    const formattedDate = selectedDate.split("-").reverse().join("-");
    
    try {
      const response = await axiosInstance.get(`/api/trains?from=${fromStationCode}&to=${toStationCode}&train_date=${formattedDate}`);
      const result = response.data;
      console.log(result);
      if (result.status) {
        // Sort trains to prioritize exact station code matches
        const sortedTrains = sortTrainsByStationMatch(result.data, fromStationCode, toStationCode);
        setTrains(sortedTrains);
        setShowTrainResults(true); // Show train results
      } else {
        setError(result.message || 'Failed to fetch trains');
        setTrains([]);
        setShowTrainResults(false);
      }
    } catch (error) {
      console.error("Error fetching trains:", error);
      setError('Failed to fetch trains. Please try again.');
      setTrains([]);
      setShowTrainResults(false);
    } finally {
      setLoading(false);
    }
  };  
  const findBuddies = async () => {
    if (!fromStationCode || !toStationCode || !selectedDate) {
      setError('Please select valid stations and date');
      return;
    }

    setSearchInitiated(true); // Mark that a search has been initiated
    setLoading(true);
    setError(null);

    try {
      const formattedDate = selectedDate; // Keep original YYYY-MM-DD format
      
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
        isValidDate: !isNaN(new Date(formattedDate).getTime())
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
  };  return (
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
        showTrainResults,
        setShowTrainResults,
        suggestions,
        setSuggestions,
        searchTrains,
        buddies,
        setBuddies,
        findBuddies,        loading,
        error,
        setError,
        activeView,
        toggleView,
        searchInitiated,
        setSearchInitiated
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
