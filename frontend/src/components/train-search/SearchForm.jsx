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
    toggleView,
    list,
    trains
  } = useTrainContext();

  // Check if search results are showing
  const hasSearchResults = list && trains.length > 0;

  const handleFindBuddy = (e) => {
    e.preventDefault();
    findBuddies();
  };
  return (
    <div className="w-full lg:w-auto">
      {/* Header text when form is centered */}        <form
        className={`flex flex-col md:flex-row gap-4 justify-center items-center ${hasSearchResults ? 'p-3 md:p-4' : 'p-6 md:p-8'} bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-300/50 hover:shadow-md transition-all`}
        onSubmit={(e) => {
          e.preventDefault();
          searchTrains();
        }}
      >        <StationInput
          value={fromStation}
          onChange={setFromStation}
          onStationSelect={(code, name, city) => {
            setFromStationCode(code);
            setFromStation(name);
            setError(null);
          }}
          placeholder="Boarding Station"
          className={`border border-gray-300/50 bg-white/60 backdrop-blur-sm ${hasSearchResults ? 'h-12' : 'h-16'} p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full md:w-64 shadow-sm placeholder-gray-500`}
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
          className={`border border-gray-300/50 bg-white/60 backdrop-blur-sm ${hasSearchResults ? 'h-12' : 'h-16'} p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full md:w-64 shadow-sm placeholder-gray-500`}
        />
        <input
          onChange={(e) => setSelectedDate(e.target.value)}
          className={`border border-gray-300/50 bg-white/60 backdrop-blur-sm ${hasSearchResults ? 'h-12' : 'h-16'} p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full md:w-52 shadow-sm`}
          value={selectedDate}
          type="date"/><div className={`flex gap-3 w-full justify-center ${hasSearchResults ? 'mt-1' : 'mt-2'}`}>
          <button
            onClick={() => {
              setList(true);
              toggleView('trains');
            }}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-10 ${hasSearchResults ? 'py-3' : 'py-4'} rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg transform hover:scale-105`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Trains'}
          </button>
          <button
            onClick={(e) => {
              handleFindBuddy(e);
              toggleView('buddies');
            }}
            className={`bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold px-10 ${hasSearchResults ? 'py-3' : 'py-4'} rounded-xl hover:from-green-700 hover:to-green-800 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg transform hover:scale-105`}
            type="button"
            disabled={loading}
          >
            {loading ? 'Finding...' : 'Find Buddy'}
          </button>
        </div>
      </form>
      {error && (
        <div className="mt-4 text-red-600 text-center bg-red-50 border border-red-200 rounded-lg p-3">
          <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default SearchForm;
