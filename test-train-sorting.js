// Test for train sorting logic with priority levels
// This file can be run with Node.js to test the sorting function

const testTrains = [
  {
    trainNumber: "12345",
    trainName: "No Match Train",
    fromStation: { code: "CHN", name: "Chennai" },
    toStation: { code: "BLR", name: "Bangalore" }
  },
  {
    trainNumber: "67890",
    trainName: "Departure Only Match",
    fromStation: { code: "DEL", name: "New Delhi" },
    toStation: { code: "PUN", name: "Pune" }
  },
  {
    trainNumber: "11111",
    trainName: "Both Stations Match 1",
    fromStation: { code: "DEL", name: "New Delhi" },
    toStation: { code: "BOM", name: "Mumbai" }
  },
  {
    trainNumber: "22222",
    trainName: "Destination Only Match",
    fromStation: { code: "AGR", name: "Agra" },
    toStation: { code: "BOM", name: "Mumbai" }
  },
  {
    trainNumber: "33333",
    trainName: "Both Stations Match 2",
    fromStation: { code: "DEL", name: "New Delhi" },
    toStation: { code: "BOM", name: "Mumbai" }
  },
  {
    trainNumber: "44444",
    trainName: "Another Departure Only",
    fromStation: { code: "DEL", name: "New Delhi" },
    toStation: { code: "JAI", name: "Jaipur" }
  },
  {
    trainNumber: "55555",
    trainName: "Another Destination Only",
    fromStation: { code: "LKO", name: "Lucknow" },
    toStation: { code: "BOM", name: "Mumbai" }
  }
];

// Updated sorting function with priority levels
const sortTrainsByStationMatch = (trains, fromCode, toCode) => {
  if (!trains || !Array.isArray(trains)) return [];
  
  console.log('Sorting trains with priority levels:', { fromCode, toCode });
  
  const sorted = trains.sort((a, b) => {
    // Check matches for train 'a'
    const aFromMatch = a.fromStation?.code === fromCode;
    const aToMatch = a.toStation?.code === toCode;
    
    // Check matches for train 'b'
    const bFromMatch = b.fromStation?.code === fromCode;
    const bToMatch = b.toStation?.code === toCode;
    
    // Calculate priority levels (lower number = higher priority)
    // Priority 1: Both departure and destination match
    // Priority 2: Only departure matches
    // Priority 3: Only destination matches
    // Priority 4: No matches
    const getPriority = (fromMatch, toMatch) => {
      if (fromMatch && toMatch) return 1; // Both match - highest priority
      if (fromMatch && !toMatch) return 2; // Only departure matches
      if (!fromMatch && toMatch) return 3; // Only destination matches
      return 4; // No matches - lowest priority
    };
    
    const aPriority = getPriority(aFromMatch, aToMatch);
    const bPriority = getPriority(bFromMatch, bToMatch);
    
    // Sort by priority (lower number comes first)
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // If same priority, maintain original order
    return 0;
  });
  
  // Log summary of matches by priority
  const priorityGroups = {
    1: sorted.filter(train => train.fromStation?.code === fromCode && train.toStation?.code === toCode),
    2: sorted.filter(train => train.fromStation?.code === fromCode && train.toStation?.code !== toCode),
    3: sorted.filter(train => train.fromStation?.code !== fromCode && train.toStation?.code === toCode),
    4: sorted.filter(train => train.fromStation?.code !== fromCode && train.toStation?.code !== toCode)
  };
  
  console.log('Train sorting summary:');
  console.log(`Priority 1 (Both stations match): ${priorityGroups[1].length} trains`);
  console.log(`Priority 2 (Only departure matches): ${priorityGroups[2].length} trains`);
  console.log(`Priority 3 (Only destination matches): ${priorityGroups[3].length} trains`);
  console.log(`Priority 4 (No matches): ${priorityGroups[4].length} trains`);
  
  return sorted;
};

// Test the sorting
console.log("Original train order:");
testTrains.forEach((train, index) => {
  console.log(`${index + 1}. ${train.trainName} (${train.trainNumber}) - ${train.fromStation.code} to ${train.toStation.code}`);
});

console.log("\n" + "=".repeat(100) + "\n");

const sortedTrains = sortTrainsByStationMatch(testTrains, "DEL", "BOM");

console.log("\nSorted train order (DEL to BOM with priority system):");
sortedTrains.forEach((train, index) => {
  const fromMatch = train.fromStation.code === "DEL";
  const toMatch = train.toStation.code === "BOM";
  let priority = "Priority 4 (No matches)";
  
  if (fromMatch && toMatch) priority = "Priority 1 (Both match)";
  else if (fromMatch && !toMatch) priority = "Priority 2 (Departure only)";
  else if (!fromMatch && toMatch) priority = "Priority 3 (Destination only)";
  
  console.log(`${index + 1}. ${train.trainName} (${train.trainNumber}) - ${train.fromStation.code} to ${train.toStation.code} [${priority}]`);
});
