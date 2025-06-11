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
    <div className="mt-4 border-t border-gray-100 pt-4">
      <span className="text-sm font-medium text-gray-700 block mb-3">Available Classes</span>
      
      {train.classesInfo && train.classesInfo.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
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

      {selectedClass && (
        <div className="text-center text-sm text-gray-600 mt-3">
          Selected class: <span className="font-semibold text-blue-600">{selectedClass}</span>
        </div>
      )}
    </div>
  );
};

// Individual class card component for better organization
const ClassCard = ({ classInfo, isSelected, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={`border rounded-lg p-3 min-w-[110px] flex-shrink-0 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-300 hover:border-blue-300 bg-white"
      }`}
    >
      <div className="flex flex-col items-center">
        {/* Class Badge */}
        <span className={`font-bold text-sm px-3 py-1 rounded-full mb-2 ${
          isSelected
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-800"
        }`}>
          {classInfo.class}
        </span>
          {/* Fare */}
        {classInfo.fare && (
          <div className="text-center mb-2">
            <div className="text-green-700 font-bold text-sm">
              ₹{classInfo.fare}
            </div>
          </div>
        )}
          {/* Availability */}
        <div className="text-center">
          <div className={`font-bold text-sm ${
            classInfo.availability && classInfo.availability.includes('WL')
              ? 'text-red-600'
              : classInfo.availability && classInfo.availability.includes('AVL')
              ? 'text-green-600'
              : 'text-gray-600'
          }`}>
            {classInfo.availability || 'N/A'}
          </div>
        </div>
        
        {/* Prediction */}
        {classInfo.prediction && (
          <div className="text-center mt-2">
            <div className="text-blue-600 font-semibold text-sm">
              {classInfo.predictionPercentage ? `${classInfo.predictionPercentage}%` : classInfo.prediction} Chance
            </div>
          </div>
        )}
      </div>
    </button>
  );
};

// Legacy fallback component for backward compatibility
const LegacyClassDisplay = ({ train, selectedClass, onClassSelect }) => {
  return (
    <div className="text-center">
      <div className="flex justify-center space-x-2 mb-2">
        {(train.availableClasses || train.class_type || []).map((cls) => (
          <button
            key={cls}
            onClick={() => onClassSelect(cls)}
            className={`px-2 py-1 rounded text-xs transition-all ${
              selectedClass === cls
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cls}
          </button>
        ))}      </div>
    </div>
  );
};

export default ClassInfo;
