const trains = require("../assets/trainData");

const findTrains = async (req, res) => {
  const { from, to, train_date } = req.query;

  // Check if required query parameters are provided
  if (!from || !to || !train_date) {
    return res.status(400).json({
      status: false,
      message: "Missing required parameters: from, to, train_date",
    });
  }

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
