import React from 'react';
import SearchForm from './SearchForm';
import TrainList from './TrainList';
import { useTrainContext } from '../../context/Context';

const TrainSearchContainer = () => {
  const { suggestions, activeView } = useTrainContext();

  return (
    <div className={`w-full lg:w-auto ${(suggestions && activeView === 'buddies') ? 'lg:block hidden' : 'block'}`}>
      <SearchForm />
      <TrainList />
    </div>
  );
};

export default TrainSearchContainer;
