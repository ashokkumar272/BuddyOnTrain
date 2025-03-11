const trains = require("../assets/trainData");
// import axios from 'axios';

const findTrains = async (req, res) => {
  const { from, to, train_date } = req.query;

  
  if (!from || !to || !train_date) {
    return res.status(400).json({
      status: false,
      message: "Missing required parameters: from, to, train_date",
    });
  }


// const options = {
//   method: 'GET',
//   url: 'https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations',
//   params: {
//     fromStationCode: 'BVI',
//     toStationCode: 'NDLS',
//     dateOfJourney: '2025-03-13'
//   },
//   headers: {
//     'x-rapidapi-key': '9f433ad860msh107f7a78693edd4p100c87jsn0cc310348312',
//     'x-rapidapi-host': 'irctc1.p.rapidapi.com'
//   }
// };

// try {
// 	const response = await axios.request(options);
// 	console.log(response.data);
// } catch (error) {
// 	console.error(error);
// }



  // Check if required query parameters are provided
  
  
  
  const filteredTrains = trains.filter(
    (train) =>
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
    data: filteredTrains,
  };

  res.json(response);
};

module.exports = { findTrains };
