import React from 'react';
import SearchForm from './SearchForm';
import TrainList from './TrainList';
import { useTrainContext } from '../../context/Context';

const TrainSearchContainer = () => {
  const { suggestions, activeView, trains, list } = useTrainContext();

  // Check if we should show results (trains are searched and results exist, or actively showing trains)
  const hasResults = list && trains && trains.length > 0 && activeView === 'trains';

  return (
    <div 
      className={`w-full lg:w-auto ${(suggestions && activeView === 'buddies') ? 'lg:block hidden' : 'block'} ${
        !hasResults ? 'flex flex-col justify-center min-h-[60vh]' : ''
      }`}
    >
      <SearchForm />
      <TrainList />
    </div>
  );
};

export default TrainSearchContainer;
