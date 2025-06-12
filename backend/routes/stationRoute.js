const express = require("express");
const router = express.Router();
const { 
  getStationSuggestions, 
  getStationsByCity, 
  getAllCities 
} = require("../controllers/stationController");

// Get station suggestions based on city name input
// GET /api/stations/suggestions?city=delhi
router.get('/suggestions', getStationSuggestions);

// Get all stations for a specific city
// GET /api/stations/city/DELHI
router.get('/city/:cityKey', getStationsByCity);

// Get all available cities
// GET /api/stations/cities
router.get('/cities', getAllCities);

module.exports = router;
