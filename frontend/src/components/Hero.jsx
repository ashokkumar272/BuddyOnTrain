import React from "react";
import TrainCard from "./TrainCard";
import Suggestions from "./Suggestions";
import { useTrainContext } from "../context/Context";

const Hero = () => {
  const {
    toStation,
    setToStation,
    fromStation,
    setFromStation,
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
    error
  } = useTrainContext();

  const handleFindBuddy = (e) => {
    e.preventDefault();
    findBuddies();
  };

  return (
    <div
      className={suggestions ? "flex justify-around" : "flex justify-center"}
    >
      <div>
        <form
          className="flex gap-4 justify-center items-center p-6 bg-gray-100 rounded-lg shadow-md"
          onSubmit={(e) => {
            e.preventDefault();
            searchTrains();
          }}
        >
          <input
            onChange={(e) => setFromStation(e.target.value)}
            className="border border-gray-300 h-14 p-4 rounded-lg focus:outline-none focus:border-blue-500 transition-all w-64"
            value={fromStation}
            type="text"
            placeholder="Boarding Station"
          />
          <input
            onChange={(e) => setToStation(e.target.value)}
            className="border border-gray-300 h-14 p-4 rounded-lg focus:outline-none focus:border-blue-500 transition-all w-64"
            value={toStation}
            type="text"
            placeholder="Destination Station"
          />
          <input
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 h-14 p-4 rounded-lg focus:outline-none focus:border-blue-500 transition-all w-48"
            value={selectedDate}
            type="date"
          />
          <button
            onClick={() => setList((prev) => !prev)}
            className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-all"
            type="submit"
          >
            Search
          </button>
          {!suggestions ? (
            <button
              onClick={handleFindBuddy}
              className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-all"
              type="button"
            >
              Find Buddy
            </button>
          ) : null}
        </form>
        {error && (
          <div className="mt-2 text-red-600 text-center">
            {error}
          </div>
        )}
        {list && (
          <div className="px-4">
            {trains.length > 0 ? (
              <ul className="h-[500px] overflow-scroll shadow-y-md">
                {trains.map((train) => (
                  <TrainCard key={train.train_number} train={train} />
                ))}
                </ul>
            ) : (
              <p>No trains found.</p>
            )}
          </div>
        )}
      </div>

      <div className="w-px h-[600px] bg-gray-400 flex justify-center"></div>
      {suggestions ? (
        <div>
          <Suggestions
            suggestions={suggestions}
            setSuggestions={setSuggestions}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Hero;
