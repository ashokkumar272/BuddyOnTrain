import React from "react";
import Suggested from "./Suggested";
import { useTrainContext } from "../context/Context";

const Suggestions = ({ suggestions, setSuggestions }) => {
  const { buddies, loading, toggleView } = useTrainContext();

  console.log("Rendering Suggestions with buddies:", buddies);

  return (
    <div className="w-full lg:w-[400px] bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between p-4 md:p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold">Suggestions</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => toggleView('trains')}
            className="lg:hidden bg-blue-600 text-white font-semibold px-3 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Trains
          </button>
          <button
            onClick={() => setSuggestions(false)}
            className="bg-red-600 text-white font-semibold px-3 py-2 rounded-lg hover:bg-red-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
      <ul className="max-h-[500px] overflow-y-auto mt-4">
        {loading ? (
          <div className="text-center py-4">Loading travel buddies...</div>
        ) : buddies.length > 0 ? (
          buddies.map((buddy) => (
            <Suggested 
              key={buddy._id} 
              id={buddy._id}
              name={buddy.name || buddy.username} 
              profession={buddy.profession}
              isFriend={buddy.isFriend} 
              travelDetails={buddy.travelDetails}
            />
          ))
        ) : (
          <div className="text-center py-4">
            No travel buddies found for this route and date.
          </div>
        )}
      </ul>
    </div>
  );
};

export default Suggestions;
