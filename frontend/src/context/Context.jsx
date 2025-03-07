import React, { createContext, useContext, useState } from 'react';

const TrainContext = createContext();

export const TrainProvider = ({ children }) => {
  const [toStation, setToStation] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [trains, setTrains] = useState([]);
  const [list, setList] = useState(false);
  const [suggestions, setSuggestions] = useState(false);

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
