import React from "react";
import Suggested from "./Suggested";

const Suggestions = ({ suggestions, setSuggestions }) => {
  return (
    <div className="w-[400px] bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-3">Suggestions</h2>
        <button
          onClick={() => setSuggestions((prev) => !prev)}
          className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-all"
        >
          X
        </button>
      </div>
      <ul className="h-[500px] overflow-scroll">

      {/* Using map render all 'Suggested' elements */}

        <Suggested name = "Ashok"/> 
        <Suggested name = "Ashok"/> 
        <Suggested name = "Ashok"/> 
        <Suggested name = "Ashok"/> 
        <Suggested name = "Ashok"/> 
        <Suggested name = "Ashok"/> 
        <Suggested name = "Ashok"/> 
        <Suggested name = "Ashok"/> 
        <Suggested name = "Ashok"/> 
        <Suggested name = "Ashok"/> 
        <Suggested name = "Ashok"/> 
        <Suggested name = "Ashok"/> 
      </ul>
    </div>
  );
};

export default Suggestions;
