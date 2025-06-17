import React from "react";

const ClassInfo = ({ 
  train, 
  selectedClass, 
  onClassSelect 
}) => {
  const handleClassSelect = (classType) => {
    onClassSelect(classType);
  };

  return (
    <div className="mt-2 ">
        {train.classesInfo && train.classesInfo.length > 0 ? (
        <div className="flex gap-2 sm:gap-4 overflow-x-auto">
          {train.classesInfo.map((classInfo) => (
            <ClassCard
              key={classInfo.class}
              classInfo={classInfo}
              isSelected={selectedClass === classInfo.class}
              onSelect={() => handleClassSelect(classInfo.class)}
            />
          ))}
        </div>
      ) : (
        <LegacyClassDisplay
          train={train}
          selectedClass={selectedClass}
          onClassSelect={handleClassSelect}
        />
      )}
    </div>
  );
};

// Individual class card component for better organization
const ClassCard = ({ classInfo, isSelected, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={`border rounded-lg p-2 sm:p-3 min-w-[120px] sm:min-w-[160px] flex-shrink-0 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-300 hover:border-blue-300 bg-white"
      }`}
    >
      <div className="flex flex-col space-y-1 sm:space-y-2">
        {/* Top row: Class Badge and Fare */}
        <div className="flex items-center justify-between">          <span className={`font-bold text-xs sm:text-sm px-1 sm:px-2 py-1 rounded-full ${
            isSelected
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}>
            {classInfo.class}
          </span>
          {classInfo.fare && (
            <div className="text-green-700 font-bold text-xs sm:text-sm">
              ₹{classInfo.fare}
            </div>
          )}
        </div>
            {/* Bottom row: Availability and Prediction */}
        <div className="flex items-center justify-between text-xs">
          <div className={`font-bold text-xs ${
            classInfo.availability && classInfo.availability.includes('WL')
              ? 'text-red-600'
              : classInfo.availability && classInfo.availability.includes('AVL')
              ? 'text-green-600'
              : 'text-gray-600'
          }`}>
            {classInfo.availability || 'N/A'}
          </div>
          
          {classInfo.prediction && (
            <div className="text-blue-600 font-semibold text-xs">
              {classInfo.predictionPercentage ? `${classInfo.predictionPercentage}%` : classInfo.prediction}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

// Legacy fallback component for backward compatibility
const LegacyClassDisplay = ({ train, selectedClass, onClassSelect }) => {
  return (
    <div className="text-center">
      <div className="flex justify-center space-x-2 mb-2">        {(train.availableClasses || train.class_type || []).map((cls) => (
          <button
            key={cls}
            onClick={() => onClassSelect(cls)}
            className={`px-1 sm:px-2 py-1 rounded text-xs transition-all ${
              selectedClass === cls
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cls}
          </button>
        ))}</div>
    </div>
  );
};

export default ClassInfo;
