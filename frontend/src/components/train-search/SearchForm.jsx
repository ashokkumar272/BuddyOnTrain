import React, { useState, useEffect } from "react";
import StationInput from "./StationInput";
import { useTrainContext } from "../../context/Context";

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
    trains,
  } = useTrainContext();

  // Check if search results are showing
  const hasSearchResults = list && trains.length > 0;
    // State to control form visibility on small screens
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-collapse form on small screens when search results appear
  useEffect(() => {
    if (hasSearchResults && isSmallScreen) {
      setIsFormCollapsed(true);
    } else {
      setIsFormCollapsed(false);
    }
  }, [hasSearchResults, isSmallScreen]);  const handleFindBuddy = (e) => {
    e.preventDefault();
    findBuddies();
  };

  // Show collapsed bar on small screens when there are search results
  const shouldShowCollapsedBar = hasSearchResults && isSmallScreen;
  // Render collapsed search bar for small screens with results
  if (shouldShowCollapsedBar && isFormCollapsed) {
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    };

    return (
      <div className="w-full lg:w-auto">
        <button
          onClick={() => setIsFormCollapsed(false)}
          className="w-full p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-300/50 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 text-gray-700">
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-medium text-sm">
                {fromStation && toStation 
                  ? `${fromStation} → ${toStation}` 
                  : "Search Trains"
                }
              </div>
              {selectedDate && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {formatDate(selectedDate)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:block">Tap to modify</span>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        {error && (
          <div className="mt-4 text-red-600 text-center bg-red-50 border border-red-200 rounded-lg p-3">
            <svg
              className="w-5 h-5 inline mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full lg:w-auto">      {/* Collapse button for small screens with results */}
      {shouldShowCollapsedBar && !isFormCollapsed && (
        <div className="flex justify-end mb-2 lg:hidden">
          <button
            onClick={() => setIsFormCollapsed(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            aria-label="Collapse search form"
            title="Minimize search form"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      )}
      <form
        className={`flex flex-col lg:flex-row gap-4 justify-center items-center ${
          hasSearchResults ? "p-3 md:p-4" : "p-4 md:p-6 lg:p-8"
        } bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-300/50 hover:shadow-md transition-all`}
        onSubmit={(e) => {
          e.preventDefault();
          searchTrains();
        }}
      >
        {/* Input fields in column layout for small screens, row for larger screens */}
        <div className="flex flex-col md:flex-row lg:flex-row gap-3 md:gap-4 w-full lg:w-auto max-w-4xl lg:max-w-none">          <StationInput
            value={fromStation}
            onChange={setFromStation}
            onStationSelect={(code, name, city) => {
              setFromStationCode(code);
              setFromStation(name);
              setError(null);
            }}
            placeholder="Boarding Station"
            className={`border border-gray-300/50 bg-white/60 backdrop-blur-sm ${
              hasSearchResults ? "h-12" : "h-16 lg:h-16"
            } p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full lg:w-64 shadow-sm placeholder-gray-500`}
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
            className={`border border-gray-300/50 bg-white/60 backdrop-blur-sm ${
              hasSearchResults ? "h-12" : "h-16 lg:h-16"
            } p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full lg:w-64 shadow-sm placeholder-gray-500`}
          />
          <input
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`border border-gray-300/50 bg-white/60 backdrop-blur-sm ${
              hasSearchResults ? "h-12" : "h-16 lg:h-16"
            } p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full lg:w-52 shadow-sm`}
            value={selectedDate}
            type="date"
          />
        </div>
        {/* Buttons in column layout for small screens, row for larger screens */}
        <div
          className={`flex flex-col sm:flex-row gap-3 w-full lg:w-auto max-w-lg lg:max-w-none justify-center ${
            hasSearchResults ? "mt-1 lg:mt-0" : "mt-2 lg:mt-0"
          }`}
        >          <button
            onClick={() => {
              setList(true);
              toggleView("trains");
            }}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 sm:px-10 ${
              hasSearchResults ? "h-12 py-0" : "py-4 lg:h-16 lg:py-0"
            } rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 w-full sm:w-auto flex items-center justify-center`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search Trains"}
          </button>
          <button
            onClick={(e) => {
              handleFindBuddy(e);
              toggleView("buddies");
            }}
            className={`bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold px-6 sm:px-10 ${
              hasSearchResults ? "h-12 py-0" : "py-4 lg:h-16 lg:py-0"
            } rounded-xl hover:from-green-700 hover:to-green-800 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 w-full sm:w-auto flex items-center justify-center`}
            type="button"
            disabled={loading}
          >
            {loading ? "Finding..." : "Find Buddy"}
          </button>
        </div>
      </form>
      {error && (
        <div className="mt-4 text-red-600 text-center bg-red-50 border border-red-200 rounded-lg p-3">
          <svg
            className="w-5 h-5 inline mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default SearchForm;
