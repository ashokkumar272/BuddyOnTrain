const fs = require("fs");
const path = require("path");

// Load railway stations data
let railwayStationsData = null;

const loadRailwayStations = () => {
  if (!railwayStationsData) {
    try {
      const filePath = path.join(__dirname, "../assets/railway_stations.json");
      const data = fs.readFileSync(filePath, "utf8");
      railwayStationsData = JSON.parse(data);
    } catch (error) {
      console.error("Error loading railway stations data:", error);
      railwayStationsData = { railway_stations_by_city: {} };
    }
  }
  return railwayStationsData;
};

// Helper function to find city by station code
const findCityByStationCode = (stationCode) => {
  const data = loadRailwayStations();
  const cities = data.railway_stations_by_city;
  
  for (const city in cities) {
    const stations = cities[city];
    const found = stations.find(station => 
      station.station_code.toLowerCase() === stationCode.toLowerCase()
    );
    if (found) {
      return city;
    }
  }
  return null;
};

// Helper function to get all station codes for a city
const getStationCodesForCity = (cityName) => {
  const data = loadRailwayStations();
  const cities = data.railway_stations_by_city;
  
  if (cities[cityName]) {
    return cities[cityName].map(station => station.station_code);
  }
  return [];
};

// Helper function to get all station codes for cities that match a station code
const getAllStationCodesForMatchingCities = (stationCode) => {
  const city = findCityByStationCode(stationCode);
  if (city) {
    return getStationCodesForCity(city);
  }
  return [stationCode]; // Return original if city not found
};

// Helper function to get station details by code
const getStationDetails = (stationCode) => {
  const data = loadRailwayStations();
  const cities = data.railway_stations_by_city;
  
  for (const city in cities) {
    const stations = cities[city];
    const found = stations.find(station => 
      station.station_code.toLowerCase() === stationCode.toLowerCase()
    );
    if (found) {
      return {
        ...found,
        city: city
      };
    }
  }
  return null;
};

// Helper function to search stations by name or code
const searchStations = (query, limit = 10) => {
  const data = loadRailwayStations();
  const cities = data.railway_stations_by_city;
  const results = [];
  
  const queryLower = query.toLowerCase();
  
  for (const city in cities) {
    const stations = cities[city];
    for (const station of stations) {
      const nameMatch = station.station_name.toLowerCase().includes(queryLower);
      const codeMatch = station.station_code.toLowerCase().includes(queryLower);
      const cityMatch = city.toLowerCase().includes(queryLower);
      
      if (nameMatch || codeMatch || cityMatch) {
        results.push({
          ...station,
          city: city
        });
        
        if (results.length >= limit) {
          return results;
        }
      }
    }
  }
  
  return results;
};

// Get all cities
const getAllCities = () => {
  const data = loadRailwayStations();
  return Object.keys(data.railway_stations_by_city);
};

module.exports = {
  loadRailwayStations,
  findCityByStationCode,
  getStationCodesForCity,
  getAllStationCodesForMatchingCities,
  getStationDetails,
  searchStations,
  getAllCities
};
