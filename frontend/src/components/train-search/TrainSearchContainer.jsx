import React from 'react';
import SearchForm from './SearchForm';
import TrainList from './TrainList';
import { useTrainContext } from '../../context/Context';

const TrainSearchContainer = () => {
  const { trains, showTrainResults, activeView, suggestions } = useTrainContext();

  // Check if we should show results (trains are searched and results exist)
  const hasResults = showTrainResults && trains && trains.length > 0;
  const bothVisible = hasResults && suggestions;

  return (
    <div 
      className={`w-full ${
        !hasResults ? 'flex flex-col justify-center' : ''
      } ${
        hasResults && activeView !== 'trains' ? 'hidden lg:block' : 'block'
      }`}
    >
      <SearchForm />
      <TrainList />
    </div>
  );
};

export default TrainSearchContainer;
