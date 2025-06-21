const {
  getAllStationCodesForMatchingCities,
  findCityByStationCode,
  getStationDetails,
  searchStations
} = require('./utils/railwayStations');

// Test function to demonstrate the new functionality
function testCityBasedMatching() {
  console.log('=== Testing City-Based Station Matching ===\n');

  // Test case 1: Find all stations in Delhi city when user searches for NDLS
  console.log('1. Testing Delhi stations:');
  const delhiStations = getAllStationCodesForMatchingCities('NDLS');
  console.log(`NDLS belongs to city with stations:`, delhiStations);
  
  // Test case 2: Find city for a station code
  console.log('\n2. Finding city for station codes:');
  console.log(`NDLS belongs to city:`, findCityByStationCode('NDLS'));
  console.log(`MMCT belongs to city:`, findCityByStationCode('MMCT'));
  console.log(`SBC belongs to city:`, findCityByStationCode('SBC'));

  // Test case 3: Get station details
  console.log('\n3. Station details:');
  console.log(`NDLS details:`, getStationDetails('NDLS'));
  console.log(`MMCT details:`, getStationDetails('MMCT'));

  // Test case 4: Search functionality
  console.log('\n4. Search results for "mumbai":');
  const mumbaiResults = searchStations('mumbai', 5);
  mumbaiResults.forEach(station => {
    console.log(`  ${station.station_name} (${station.station_code}) in ${station.city}`);
  });

  console.log('\n5. Search results for "delhi":');
  const delhiResults = searchStations('delhi', 5);
  delhiResults.forEach(station => {
    console.log(`  ${station.station_name} (${station.station_code}) in ${station.city}`);
  });

  // Test case 5: Demonstrate buddy matching scenario
  console.log('\n6. Buddy Matching Example:');
  console.log('If User A is traveling from NDLS to MMCT, they can find buddies traveling from:');
  const fromCityStations = getAllStationCodesForMatchingCities('NDLS');
  const toCityStations = getAllStationCodesForMatchingCities('MMCT');
  console.log(`  From Delhi (any of): ${fromCityStations.join(', ')}`);
  console.log(`  To Mumbai (any of): ${toCityStations.join(', ')}`);
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCityBasedMatching();
}

module.exports = { testCityBasedMatching };
