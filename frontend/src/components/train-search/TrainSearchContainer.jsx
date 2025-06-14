import React from 'react';
import SearchForm from './SearchForm';
import TrainList from './TrainList';
import { useTrainContext } from '../../context/Context';

const TrainSearchContainer = () => {
  const { trains, list } = useTrainContext();

  // Check if we should show results (trains are searched and results exist)
  const hasResults = list && trains && trains.length > 0;

  return (
    <div 
      className={`w-full lg:w-auto ${
        !hasResults ? 'flex flex-col justify-center min-h-[60vh]' : ''
      }`}
    >
      <SearchForm />
      <TrainList />
    </div>
  );
};

export default TrainSearchContainer;
