import { TrainSearchContainer } from "./train-search";
import { BuddySystemContainer } from "./buddy-system";
import { ContentDivider, ViewSwitcher } from "./common";
import { useTrainContext } from "../context/Context";

const Hero = () => {
  const { showTrainResults, suggestions, trains } = useTrainContext();
  
  // Check if both trains and buddies are available/visible
  const hasTrainResults = showTrainResults && trains && trains.length > 0;
  const hasBuddyResults = suggestions;
  const bothVisible = hasTrainResults && hasBuddyResults;
  const onlyBuddies = hasBuddyResults && !hasTrainResults;
  
  return (
    <div className={`flex flex-col items-center relative w-full ${
      bothVisible ? 'lg:max-w-none' : 'max-w-6xl'
    } mx-auto px-4 gap-4`}>
      {onlyBuddies ? (
        // When only buddy suggestions are visible, show SearchForm at top and suggestions full width below
        <>
          <div className="w-full">
            <TrainSearchContainer />
          </div>
          <div className="w-full">
            <BuddySystemContainer />
          </div>
        </>
      ) : (
        // Normal layout for train results or both visible
        <div className={`flex flex-col lg:flex-row items-center m-auto lg:items-start w-full ${
          bothVisible ? 'lg:gap-6' : 'lg:gap-0'
        } ${
          bothVisible ? 'lg:justify-center' : 'lg:justify-around'
        }`}>
          <div className={`w-full ${bothVisible ? 'lg:w-1/2 lg:flex-1' : 'lg:w-auto'}`}>
            <TrainSearchContainer />
          </div>
          {bothVisible && <ContentDivider />}
          <div className={`w-full ${bothVisible ? 'lg:w-1/2 lg:flex-1' : 'lg:w-auto'}`}>
            <BuddySystemContainer />
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero;
