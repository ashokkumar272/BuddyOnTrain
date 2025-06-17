import { TrainSearchContainer } from "./train-search";
import { BuddySystemContainer } from "./buddy-system";
import { ContentDivider, ViewSwitcher } from "./common";

const Hero = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-around items-center lg:items-start relative w-full max-w-6xl mx-auto px-4 gap-4 lg:gap-0">
      {/* <ViewSwitcher /> */}
      <TrainSearchContainer />
      <ContentDivider />
      <BuddySystemContainer />
    </div>
  );
};

export default Hero;
