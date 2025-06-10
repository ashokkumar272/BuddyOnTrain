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
    // Make API call to the train search endpoint
    const apiUrl = `https://cttrainsapi.confirmtkt.com/api/v1/trains/search?sourceStationCode=${from}&destinationStationCode=${to}&dateOfJourney=${train_date}`;
    
    const response = await axios.get(apiUrl);
    
    // Extract useful train data from the API response
    const trainList = response.data?.data?.trainList || [];
      // Map the API response to a simplified format with only useful data
    const formattedTrains = trainList.map(train => {
      // Get the best available class with lowest fare
      const bestClass = train.avlClassesSorted?.[0];
      const classInfo = train.availabilityCache?.[bestClass];
      
      return {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        trainType: train.trainType,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        duration: train.duration,
        distance: train.distance,
        train_date: train_date, // Include the original train_date from request
        fromStation: {
          code: train.fromStnCode,
          name: train.fromStnName,
          city: train.fromCityName
        },
        toStation: {
          code: train.toStnCode,
          name: train.toStnName,
          city: train.toCityName
        },
        availableClasses: train.avlClassesSorted || [],
        hasPantry: train.hasPantry,
        trainRating: train.trainRating,
        runningDays: train.runningDays,
        // Include fare and availability info for the best available class
        bestClassInfo: classInfo ? {
          class: bestClass,
          fare: classInfo.fare,
          availability: classInfo.availabilityDisplayName,
          prediction: classInfo.predictionDisplayName,
          predictionPercentage: classInfo.predictionPercentage
        } : null
      };
    });

    // Build the response object
    const responseData = {
      status: true,
      message: "Success",
      timestamp: Date.now(),
      data: formattedTrains,
    };    res.json(responseData);
    
  } catch (error) {
    console.error('Error fetching train data:', error.message);
    console.error('Error details:', error.response?.data || error.message);
    console.error('API URL used:', `https://cttrainsapi.confirmtkt.com/api/v1/trains/search?sourceStationCode=${from}&destinationStationCode=${to}&dateOfJourney=${train_date}`);
    
  

    // Return mock data with a warning message
    return res.json({
      status: true,
      message: "Using sample data - External API temporarily unavailable",
      timestamp: Date.now(),
      data: mockTrains,      warning: "This is sample data. External train API is currently unavailable."
    });
  }
};

module.exports = { findTrains };
