import React from 'react';
import Suggestions from './Suggestions';
import { useTrainContext } from '../../context/Context';

const BuddySystemContainer = () => {
  const { suggestions, activeView, setSuggestions } = useTrainContext();

  if (!suggestions || (activeView !== 'buddies' && window.innerWidth < 1024)) {
    return null;
  }

  return (
    <div className="w-full lg:w-auto mt-4 lg:mt-0">
      <Suggestions
        suggestions={suggestions}
        setSuggestions={setSuggestions}
      />
    </div>
  );
};

export default BuddySystemContainer;
