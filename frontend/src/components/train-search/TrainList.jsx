import React, { useState, useEffect } from 'react';
import TrainCard from './TrainCard';
import { useTrainContext } from '../../context/Context';

const TrainList = () => {
  const { trains, showTrainResults } = useTrainContext();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  if (!showTrainResults) {
    return null;
  }

  // Check if collapsed search box might be visible (when there are search results on small screen)
  const hasCollapsedSearchBox = isSmallScreen && trains && trains.length > 0;
  
  return (
    <div className="h-[100vh]">      {trains.length > 0 ? (
        <ul className={`h-[100%] pt-32 lg:pt-36 overflow-y-auto shadow-md rounded-lg`}>
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
