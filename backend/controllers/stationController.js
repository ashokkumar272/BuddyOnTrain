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
    const searchTerm = city.toLowerCase().replace(/\s+/g, '_');

    // Search for cities that match the input (case-insensitive, partial matching)
    Object.keys(stationsData.railway_stations_by_city).forEach(cityKey => {
      const cityName = cityKey.toLowerCase();
      
      // Check if the city name contains the search term
      if (cityName.includes(searchTerm)) {
        const stations = stationsData.railway_stations_by_city[cityKey];
        
        suggestions.push({
          city: cityKey.replace(/_/g, ' '), // Convert back to readable format
          originalCityKey: cityKey,
          stations: stations.map(station => ({
            stationName: station.station_name,
            stationCode: station.station_code
          }))
        });
      }
    });

    // Sort suggestions by relevance (exact matches first, then partial matches)
    suggestions.sort((a, b) => {
      const aExact = a.originalCityKey.toLowerCase() === searchTerm;
      const bExact = b.originalCityKey.toLowerCase() === searchTerm;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // If both are partial matches, sort alphabetically
      return a.city.localeCompare(b.city);
    });

    // Limit results to avoid overwhelming the user
    const limitedSuggestions = suggestions.slice(0, 10);

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
