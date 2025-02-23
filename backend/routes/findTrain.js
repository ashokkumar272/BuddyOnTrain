const express = require("express");
const router = express.Router();
const trains = require('../assets/trainData');


const app = express();

// Middleware to parse JSON
app.use(express.json());


// Helper function to get day abbreviation
function getDayAbbreviation(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
}


router.get('/trains', (req, res) => {
    const { from, to, train_date } = req.query;
    
    // Check if required query parameters are provided
    if (!from || !to || !train_date) {
      return res.status(400).json({
        status: false,
        message: "Missing required parameters: from, to, train_date"
      });
    }
  
    
    const filteredTrains = trains.filter(train => 
      train.train_date === train_date &&
      (train.from.toLowerCase() === from.toLowerCase() ||
       train.from_station_name.toLowerCase() === from.toLowerCase()) &&
      (train.to.toLowerCase() === to.toLowerCase() ||
       train.to_station_name.toLowerCase() === to.toLowerCase())
    );
  
    // Build the response object
    const response = {
      status: true,
      message: "Success",
      timestamp: Date.now(),
      data: filteredTrains
    };
  
    res.json(response);
  });




module.exports = router