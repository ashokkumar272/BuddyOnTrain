import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../utils/axios';

const StationInput = ({ 
  value, 
  onChange, 
  placeholder, 
  className = "",
  onStationSelect 
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedStationCode, setSelectedStationCode] = useState('');
  const suggestionRef = useRef(null);
  const debounceRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Fetch suggestions from API using axios instance
  const fetchSuggestions = async (cityName) => {
    if (!cityName.trim() || cityName.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    console.log('Fetching suggestions for:', cityName); // Debug log
    
    try {
      const response = await axiosInstance.get(
        `/api/stations/suggestions?city=${encodeURIComponent(cityName)}`
      );
      
      console.log('API Response:', response.data); // Debug log
      
      if (response.data.status && response.data.data.suggestions) {
        setSuggestions(response.data.data.suggestions);
        setShowSuggestions(true);
        console.log('Set suggestions:', response.data.data.suggestions); // Debug log
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        console.log('No suggestions received'); // Debug log
      }
    } catch (error) {
      console.error('Error fetching station suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };
  // Handle input changes with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // If input is cleared, reset everything
    if (!newValue.trim()) {
      setSelectedStationCode('');
      setSuggestions([]);
      setShowSuggestions(false);
      onChange('');
      if (onStationSelect) {
        onStationSelect('', '');
      }
      return;
    }

    // Debounce API calls - shorter delay for mobile
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 150); // Reduced from 200ms to 150ms for better mobile experience

    // Update parent component with the input value
    onChange(newValue);
  };

  // Handle station selection with both mouse and touch events
  const handleStationSelect = (stationName, stationCode, cityName, event) => {
    // Prevent event propagation to avoid conflicts
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const displayText = `${stationName} - ${stationCode}`;
    setInputValue(displayText);
    setSelectedStationCode(stationCode);
    setShowSuggestions(false);
    
    // Update parent component with station code
    onChange(stationCode);
    if (onStationSelect) {
      onStationSelect(stationCode, stationName, cityName);
    }
  };

  // Handle focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
    // On mobile, also trigger search if there's already text
    if (inputValue.trim() && inputValue.length >= 1) {
      fetchSuggestions(inputValue);
    }
  };

  // Handle blur with delay to allow selection
  const handleBlur = () => {
    // Increased delay to ensure click events can complete
    setTimeout(() => {
      setShowSuggestions(false);
    }, 300);
  };

  return (    <div className="relative" ref={suggestionRef}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${className} ${loading ? 'pr-10' : ''}`}
        autoComplete="off"
        autoCapitalize="words"
        autoCorrect="off"
        spellCheck="false"
        inputMode="text"
      />
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-white backdrop-blur-sm border border-gray-300/50 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((cityData, cityIndex) => (
            <div key={cityIndex}>
              {/* Stations for this city */}
              {cityData.stations.map((station, stationIndex) => (
                <div
                  key={`${cityIndex}-${stationIndex}`}
                  className="px-4 py-4 hover:bg-blue-50 active:bg-blue-100 cursor-pointer border-b border-gray-200/50 last:border-b-0 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
                  onMouseDown={(e) => handleStationSelect(station.stationName, station.stationCode, cityData.city, e)}
                  onTouchStart={(e) => handleStationSelect(station.stationName, station.stationCode, cityData.city, e)}
                  style={{ 
                    minHeight: '48px', // Ensure minimum touch target size for mobile
                    WebkitTapHighlightColor: 'rgba(59, 130, 246, 0.1)' // Better tap feedback on iOS
                  }}
                >
                  <div className="text-gray-900 font-medium text-sm md:text-base">
                    {station.stationName} - {station.stationCode}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}{/* No suggestions message */}
      {showSuggestions && suggestions.length === 0 && !loading && inputValue.trim().length >= 1 && (
        <div className="absolute z-[9999] w-full mt-1 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-xl shadow-lg">
          <div className="px-4 py-4 text-gray-700 text-center font-medium text-sm md:text-base">
            No stations found for "{inputValue}"
          </div>
        </div>
      )}
    </div>
  );
};

export default StationInput;
