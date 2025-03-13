const trains = require("../assets/trainData");
const axios = require('axios');

const findTrains = async (req, res) => {
  const { from, to, train_date } = req.query;

  
  if (!from || !to || !train_date) {
    return res.status(400).json({
      status: false,
      message: "Missing required parameters: from, to, train_date",
    });
  }

  try {
    // Format date: from DD-MM-YYYY to YYYY-MM-DD
    const dateParts = train_date.split('-');
    const formattedDate = dateParts.length === 3 ? 
      `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : 
      train_date;

    const options = {
      method: 'GET',
      url: 'https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations',
      params: {
        fromStationCode: from,
        toStationCode: to,
        dateOfJourney: formattedDate
      },
      headers: {
        'x-rapidapi-key': '5bb66f245bmsh348b7a7d395f822p1ce7a2jsnfdeb32f82eb0',
        'x-rapidapi-host': 'irctc1.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    console.log('API Response:', response.data);
    
    // Map API response to the expected format if needed
    const apiData = response.data.data || [];
    
    // Return the API response
    res.json({
      status: true,
      message: "Success",
      timestamp: Date.now(),
      data: apiData
    });
  } catch (error) {
    console.error("Error calling train API:", error);
    
    // Fallback to mock data if the API fails
    console.log("Falling back to mock data");
    const filteredTrains = trains.filter(
      (train) =>
        train.train_date === train_date &&
        (train.from.toLowerCase() === from.toLowerCase() ||
          train.from_station_name.toLowerCase() === from.toLowerCase()) &&
        (train.to.toLowerCase() === to.toLowerCase() ||
          train.to_station_name.toLowerCase() === to.toLowerCase())
    );

    res.json({
      status: true,
      message: "Success (using fallback data)",
      timestamp: Date.now(),
      data: filteredTrains,
    });
  }
};

module.exports = { findTrains };
