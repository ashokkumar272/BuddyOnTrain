# BuddyOnTrain

BuddyOnTrain is a web application that helps train travelers find companions for their journey. Users can search for trains, list themselves on specific journeys, and connect with other travelers on the same route.

## Dummy Search

**fromStation** - CSMT
**toStation** - NZM
**date** - 10/03/2025

## Features

- **Train Search**: Find trains by specifying boarding station, destination station, and travel date
- **Travel Status Management**: List yourself on a train journey with a single click
- **Buddy Finder**: Find other travelers who will be on the same train journey
- **Friend Requests**: Send connection invitations to fellow travelers
- **User Profiles**: View other travelers' profiles including profession and bio
- **Authentication System**: Secure login and registration with JWT

## Tech Stack

### Frontend
- React.js
- Tailwind CSS for styling
- Axios for API requests
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB with Mongoose for data storage
- JWT for authentication
- bcrypt for password hashing

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/BuddyOnTrain.git
cd BuddyOnTrain
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Create a .env file in the backend directory with the following variables:
```
MONGO_URI=mongodb://0.0.0.0/trains
JWT_SECRET=your-secret-key
PORT=4000
```

5. Start the backend server
```bash
cd ../backend
npm start
```

6. Start the frontend development server
```bash
cd ../frontend
npm start
```

The application should now be running at `http://localhost:3000` (frontend) and `http://localhost:4000` (backend).

## Usage Guide

### Searching for Trains
1. Enter your boarding station, destination station, and travel date
2. Click the "Search" button to view available trains

### Listing Yourself on a Train
1. Find your train in search results
2. Click the "List Yourself" button to make yourself discoverable to other travelers
3. To remove yourself from a train, click the "Unlist Yourself" button

### Finding Travel Buddies
1. Enter the same search criteria (boarding station, destination station, date)
2. Click the "Find Buddy" button
3. View a list of travelers who will be on the same journey
4. Send invitations to connect with potential travel companions

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `POST /api/users/logout` - Logout a user

### User Profile
- `GET /api/users/me` - Get current user's profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/travel-status` - Update travel status

### Train Search
- `GET /api/trains` - Search for trains

### Buddy Finder
- `GET /api/users/travel-buddies` - Find travelers on the same route

### Friend Requests
- `POST /api/friends/request` - Send a friend request
- `GET /api/friends/requests` - Get all friend requests
- `POST /api/friends/respond` - Respond to a friend request

## Database Models

### User
- Username, email, password
- Profile fields (name, age, profession, bio)
- Travel status (boarding station, destination station, travel date)
- Friends list

### FriendRequest
- Sender, receiver
- Status (pending, accepted, rejected)

### Message
- Sender, receiver
- Content
- Timestamp
- Read status

## Future Enhancements

- Real-time chat between connected travelers
- Train delay notifications
- Group creation for travelers on the same train
- Train reviews and ratings
- Integration with train booking platforms

## Contributors
- [Your Name](https://github.com/yourusername) 
