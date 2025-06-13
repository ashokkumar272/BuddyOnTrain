import React from 'react';
import StationInput from './StationInput';
import { useTrainContext } from '../../context/Context';

const SearchForm = () => {
  const {
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
    searchTrains,
    findBuddies,
    loading,
    error,
    setError,
    setList,
    toggleView
  } = useTrainContext();

  const handleFindBuddy = (e) => {
    e.preventDefault();
    findBuddies();
  };

  return (
    <div className="w-full lg:w-auto">
      <form
        className="flex flex-col md:flex-row gap-4 justify-center items-center p-4 md:p-6 bg-gray-100 rounded-lg shadow-md"
        onSubmit={(e) => {
          e.preventDefault();
          searchTrains();
        }}
      >
        <StationInput
          value={fromStation}
          onChange={setFromStation}
          onStationSelect={(code, name, city) => {
            setFromStationCode(code);
            setFromStation(name);
            setError(null);
          }}
          placeholder="Boarding Station"
          className="border border-gray-300 h-14 p-4 rounded-lg focus:outline-none focus:border-blue-500 transition-all w-full md:w-64"
        />
        <StationInput
          value={toStation}
          onChange={setToStation}
          onStationSelect={(code, name, city) => {
            setToStationCode(code);
            setToStation(name);
            setError(null);
          }}
          placeholder="Destination Station"
          className="border border-gray-300 h-14 p-4 rounded-lg focus:outline-none focus:border-blue-500 transition-all w-full md:w-64"
        />
        <input
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 h-14 p-4 rounded-lg focus:outline-none focus:border-blue-500 transition-all w-full md:w-48"
          value={selectedDate}
          type="date"
        />
        <div className="flex gap-2 w-full justify-center">
          <button
            onClick={() => {
              setList(true);
              toggleView('trains');
            }}
            className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={(e) => {
              handleFindBuddy(e);
              toggleView('buddies');
            }}
            className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            type="button"
            disabled={loading}
          >
            {loading ? 'Finding...' : 'Find Buddy'}
          </button>
        </div>
      </form>
      {error && (
        <div className="mt-2 text-red-600 text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default SearchForm;
