import { TrainSearchContainer } from "./train-search";
import { BuddySystemContainer } from "./buddy-system";
import { ViewSwitcher, ContentDivider } from "./common";

const Hero = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-around relative">
      <ViewSwitcher />
      <TrainSearchContainer />
      <ContentDivider />
      <BuddySystemContainer />
    </div>
  );
};

export default Hero;
