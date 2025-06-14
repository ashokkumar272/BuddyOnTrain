import React, { useState, useEffect, useRef } from 'react';

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
  // Fetch suggestions from API
  const fetchSuggestions = async (cityName) => {
    if (!cityName.trim() || cityName.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/stations/suggestions?city=${encodeURIComponent(cityName)}`
      );
      const data = await response.json();
      
      if (data.status && data.data.suggestions) {
        setSuggestions(data.data.suggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
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
    }    // Debounce API calls
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 200);

    // Update parent component with the input value
    onChange(newValue);
  };
  // Handle station selection
  const handleStationSelect = (stationName, stationCode, cityName) => {
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
  };

  return (
    <div className="relative" ref={suggestionRef}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`${className} ${loading ? 'pr-10' : ''}`}
        autoComplete="off"
      />
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg shadow-lg max-h-64 overflow-y-auto backdrop-saturate-150">
          {suggestions.map((cityData, cityIndex) => (
            <div key={cityIndex}>
              {/* Stations for this city */}
              {cityData.stations.map((station, stationIndex) => (
                <div
                  key={`${cityIndex}-${stationIndex}`}
                  className="px-4 py-3 hover:bg-white/30 cursor-pointer border-b border-white/20 last:border-b-0 transition-colors duration-150"
                  onClick={() => handleStationSelect(station.stationName, station.stationCode, cityData.city)}
                >
                  <div className="text-gray-900 font-medium">
                    {station.stationName} - {station.stationCode}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}{/* No suggestions message */}
      {showSuggestions && suggestions.length === 0 && !loading && inputValue.trim().length >= 1 && (
        <div className="absolute z-50 w-full mt-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg shadow-lg backdrop-saturate-150">
          <div className="px-4 py-3 text-gray-700 text-center font-medium">
            No stations found for "{inputValue}"
          </div>
        </div>
      )}
    </div>
  );
};

export default StationInput;
