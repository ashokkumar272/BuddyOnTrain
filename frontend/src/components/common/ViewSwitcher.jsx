import React from 'react';
import { useTrainContext } from '../../context/Context';

const ViewSwitcher = () => {
  const { list, suggestions, activeView, toggleView } = useTrainContext();

  if (!list && !suggestions) {
    return null;
  }

  return (
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
  );
};

export default ViewSwitcher;
