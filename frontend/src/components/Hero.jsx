import React from "react";
import TrainCard from "./TrainCard";
import Suggestions from "./Suggestions";
import StationInput from "./StationInput";
import { useTrainContext } from "../context/Context";

const Hero = () => {  const {
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
    list,
    setList,
    suggestions,
    setSuggestions,
    searchTrains,
    findBuddies,
    loading,
    error,
    setError,
    activeView,
    toggleView
  } = useTrainContext();

  const handleFindBuddy = (e) => {
    e.preventDefault();
    findBuddies();
  };

  return (
    <div className="flex flex-col lg:flex-row lg:justify-around relative">
      {/* Mobile View Switcher */}
      {(list || suggestions) && (
        <div className="lg:hidden flex justify-center mb-4 mt-2">
          <div className="bg-gray-200 rounded-lg p-1 inline-flex">
            <button 
              onClick={() => toggleView('trains')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeView === 'trains' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-300'
              }`}
            >
              Trains
            </button>
            <button 
              onClick={() => toggleView('buddies')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeView === 'buddies' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-300'
              }`}
              disabled={!suggestions}
            >
              Buddies
            </button>
          </div>
        </div>
      )}

      <div className={`w-full lg:w-auto ${(suggestions && activeView === 'buddies') ? 'lg:block hidden' : 'block'}`}>        <form
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
            </button>            <button
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
        {list && (activeView === 'trains' || window.innerWidth >= 1024) && (
          <div className="px-4 mt-4">
            {trains.length > 0 ? (
              <ul className="max-h-[500px] overflow-y-auto shadow-md rounded-lg">
                {trains.map((train) => (
                  <TrainCard key={train.train_number} train={train} />
                ))}
              </ul>
            ) : (
              <p className="text-center py-4">No trains found.</p>
            )}
          </div>
        )}
      </div>

      {/* Divider - only visible on larger screens */}
      {suggestions && (
        <div className="hidden lg:flex w-px h-[600px] bg-gray-400 justify-center mx-4"></div>
      )}
      
      {/* Suggestions container */}
      {suggestions && (activeView === 'buddies' || window.innerWidth >= 1024) && (
        <div className="w-full lg:w-auto mt-4 lg:mt-0">
          <Suggestions
            suggestions={suggestions}
            setSuggestions={setSuggestions}
          />
        </div>
      )}
    </div>
  );
};

export default Hero;
