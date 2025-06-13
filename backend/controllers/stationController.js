const fs = require('fs');
const path = require('path');

// Load railway stations data
const getStationsData = () => {
  try {
    const dataPath = path.join(__dirname, '../assets/railway_stations.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading railway stations data:', error);
    return null;
  }
};

// Get station suggestions based on city name input
const getStationSuggestions = async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({
      status: false,
      message: "City parameter is required",
    });
  }

  try {
    const stationsData = getStationsData();
    
    if (!stationsData || !stationsData.railway_stations_by_city) {
      return res.status(500).json({
        status: false,
        message: "Railway stations data not available",
      });
    }

    const suggestions = [];
    const searchTerm = city.toLowerCase().trim();
    const searchWords = searchTerm.split(/\s+/);

    // Search for cities and stations that match the input
    Object.keys(stationsData.railway_stations_by_city).forEach(cityKey => {
      const cityName = cityKey.toLowerCase().replace(/_/g, ' ');
      const stations = stationsData.railway_stations_by_city[cityKey];
      
      // Check if city name matches the search term
      const cityMatches = searchWords.every(word => 
        cityName.includes(word) || cityKey.toLowerCase().includes(word.replace(/\s+/g, '_'))
      );

      // Also check if any station name matches
      const matchingStations = stations.filter(station => {
        const stationName = station.station_name.toLowerCase();
        return searchWords.every(word => 
          stationName.includes(word) || station.station_code.toLowerCase().includes(word)
        );
      });

      if (cityMatches || matchingStations.length > 0) {
        // If city matches, include all stations
        const stationsToInclude = cityMatches ? stations : matchingStations;
        
        suggestions.push({
          city: cityKey.replace(/_/g, ' '), // Convert back to readable format
          originalCityKey: cityKey,
          matchType: cityMatches ? 'city' : 'station',
          stations: stationsToInclude.map(station => ({
            stationName: station.station_name,
            stationCode: station.station_code,
            displayText: `${station.station_name} - ${station.station_code}`
          }))
        });
      }
    });

    // Sort suggestions by relevance
    suggestions.sort((a, b) => {
      // Exact city matches first
      const aExactCity = a.originalCityKey.toLowerCase().replace(/_/g, ' ') === searchTerm;
      const bExactCity = b.originalCityKey.toLowerCase().replace(/_/g, ' ') === searchTerm;
      
      if (aExactCity && !bExactCity) return -1;
      if (!aExactCity && bExactCity) return 1;
      
      // City matches before station matches
      if (a.matchType === 'city' && b.matchType === 'station') return -1;
      if (a.matchType === 'station' && b.matchType === 'city') return 1;
      
      // Alphabetical order for same type
      return a.city.localeCompare(b.city);
    });

    // Limit results to avoid overwhelming the user
    const limitedSuggestions = suggestions.slice(0, 12);

    res.json({
      status: true,
      message: "Success",
      data: {
        searchTerm: city,
        suggestions: limitedSuggestions,
        totalFound: suggestions.length
      }
    });

  } catch (error) {
    console.error('Error getting station suggestions:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error while fetching suggestions",
      error: error.message
    });
  }
};

// Get all stations for a specific city
const getStationsByCity = async (req, res) => {
  const { cityKey } = req.params;

  if (!cityKey) {
    return res.status(400).json({
      status: false,
      message: "City key parameter is required",
    });
  }

  try {
    const stationsData = getStationsData();
    
    if (!stationsData || !stationsData.railway_stations_by_city) {
      return res.status(500).json({
        status: false,
        message: "Railway stations data not available",
      });
    }

    const cityKeyUpper = cityKey.toUpperCase().replace(/\s+/g, '_');
    const stations = stationsData.railway_stations_by_city[cityKeyUpper];

    if (!stations) {
      return res.status(404).json({
        status: false,
        message: "No stations found for the specified city",
      });
    }

    res.json({
      status: true,
      message: "Success",
      data: {
        city: cityKeyUpper.replace(/_/g, ' '),
        stations: stations.map(station => ({
          stationName: station.station_name,
          stationCode: station.station_code
        }))
      }
    });

  } catch (error) {
    console.error('Error getting stations by city:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error while fetching stations",
      error: error.message
    });
  }
};

// Get all available cities
const getAllCities = async (req, res) => {
  try {
    const stationsData = getStationsData();
    
    if (!stationsData || !stationsData.railway_stations_by_city) {
      return res.status(500).json({
        status: false,
        message: "Railway stations data not available",
      });
    }

    const cities = Object.keys(stationsData.railway_stations_by_city).map(cityKey => ({
      cityKey: cityKey,
      cityName: cityKey.replace(/_/g, ' '),
      stationCount: stationsData.railway_stations_by_city[cityKey].length
    }));

    // Sort cities alphabetically
    cities.sort((a, b) => a.cityName.localeCompare(b.cityName));

    res.json({
      status: true,
      message: "Success",
      data: {
        cities: cities,
        totalCities: cities.length
      }
    });

  } catch (error) {
    console.error('Error getting all cities:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error while fetching cities",
      error: error.message
    });
  }
};

module.exports = {
  getStationSuggestions,
  getStationsByCity,
  getAllCities
};
