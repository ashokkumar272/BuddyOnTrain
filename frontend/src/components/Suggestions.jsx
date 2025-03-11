import React from "react";
import Suggested from "./Suggested";
import { useTrainContext } from "../context/Context";

const Suggestions = ({ suggestions, setSuggestions }) => {
  const { buddies, loading } = useTrainContext();

  console.log("Rendering Suggestions with buddies:", buddies);

  return (
    <div className="w-[400px] bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-3">Suggestions</h2>
        <button
          onClick={() => setSuggestions((prev) => !prev)}
          className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-all"
        >
          Close
        </button>
      </div>
      <ul className="h-[500px] overflow-scroll">
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
