const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Mock trains data
const mockTrains = [
    {
        "train_number": "222221",
        "train_name": "MUNBAT_CSNT - HAZRAT NIZAMUDDIN Rajdhand Express",
        "run_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "train_src": "CSNT",
        "train_dstn": "NZN",
        "from_std": "16:00",
        "from_sta": "16:00",
        "to_sta": "09:55",
        "to_std": "09:55",
        "from_day": 0,
        "to_day": 1,
        "d_day": 0,
        "from": "CSNT",
        "to": "NZN",
        "from_station_name": "MUNBAT_CSNT",
        "to_station_name": "DELHI HAZRAT NIZAMUDDIN",
        "duration": "17:55",
        "special_train": false,
        "train_type": "RAJ",
        "class_type": ["3A", "2A", "1A"],
        "local_train_from_sta": 960
    },
    // Add more trains as needed
];

// Helper function to get day abbreviation
function getDayAbbreviation(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
}

// Train search endpoint
app.get('/api/trains', (req, res) => {
    const { from, to, date, class: classFilter } = req.query;
    
    // Validate required parameters
    if (!from || !to || !date) {
        return res.status(400).json({
            status: false,
            message: "Missing required parameters: from, to, or date",
            timestamp: Date.now(),
            data: []
        });
    }

    let travelDate;
    try {
        travelDate = new Date(date);
        if (isNaN(travelDate)) {
            throw new Error('Invalid date');
        }
    } catch (error) {
        return res.status(400).json({
            status: false,
            message: "Invalid date format. Use YYYY-MM-DD",
            timestamp: Date.now(),
            data: []
        });
    }

    const dayOfWeek = getDayAbbreviation(travelDate);
    const formattedDate = travelDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '-');

    const filteredTrains = mockTrains.filter(train => {
        // Basic filtering
        const stationMatch = train.train_src === from && train.train_dstn === to;
        const dayMatch = train.run_days.includes(dayOfWeek);
        
        // Class filtering
        let classMatch = true;
        if (classFilter) {
            classMatch = train.class_type.includes(classFilter);
        }

        return stationMatch && dayMatch && classMatch;
    });

    // Add train_date to response
    const responseData = filteredTrains.map(train => ({
        ...train,
        train_date: formattedDate
    }));

    res.json({
        status: true,
        message: "Success",
        timestamp: Date.now(),
        data: responseData
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});