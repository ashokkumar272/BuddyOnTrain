import React from 'react';
import { useTrainContext } from '../../context/Context';

const ContentDivider = () => {
  const { suggestions } = useTrainContext();

  if (!suggestions) {
    return null;
  }

  return (
    <div className="hidden lg:flex w-px h-[600px] bg-gray-400 justify-center"></div>
  );
};

export default ContentDivider;
