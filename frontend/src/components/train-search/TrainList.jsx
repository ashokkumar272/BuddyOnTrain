import React from 'react';
import TrainCard from './TrainCard';
import { useTrainContext } from '../../context/Context';

const TrainList = () => {
  const { trains, list, activeView } = useTrainContext();

  if (!list || (activeView !== 'trains' && window.innerWidth < 1024)) {
    return null;
  }

  return (
    <div>
      {trains.length > 0 ? (
        <ul className="max-h-[100vh] overflow-y-auto shadow-md rounded-lg">
          {trains.map((train) => (
            <TrainCard key={train.train_number} train={train} />
          ))}
        </ul>
      ) : (
        <p className="text-center py-4">No trains found.</p>
      )}
    </div>
  );
};

export default TrainList;
