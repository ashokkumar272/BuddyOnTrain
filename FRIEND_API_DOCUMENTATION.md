# Friend System API Documentation

## Overview
The friend system allows users to send friend requests, accept/reject them, view their friends list, and remove friends.

## Endpoints

### 1. Send Friend Request
**POST** `/api/friends/request`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "receiverId": "user_id_to_send_request_to"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Friend request sent successfully",
  "data": {
    "_id": "request_id",
    "sender": "sender_user_id",
    "receiver": "receiver_user_id",
    "status": "pending",
    "createdAt": "2025-07-01T00:00:00.000Z"
  }
}
```

### 2. Get Friend Requests
**GET** `/api/friends/requests`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "incoming": [
      {
        "_id": "request_id",
        "sender": {
          "_id": "sender_id",
          "username": "sender_username",
          "name": "Sender Name",
          "profession": "Software Developer"
        },
        "status": "pending",
        "createdAt": "2025-07-01T00:00:00.000Z"
      }
    ],
    "outgoing": [
      {
        "_id": "request_id",
        "receiver": {
          "_id": "receiver_id",
          "username": "receiver_username",
          "name": "Receiver Name",
          "profession": "Designer"
        },
        "status": "pending",
        "createdAt": "2025-07-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 3. Respond to Friend Request
**POST** `/api/friends/respond`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "requestId": "friend_request_id",
  "status": "accepted" // or "rejected"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Friend request accepted successfully"
}
```

### 4. Get Friends List
**GET** `/api/friends/list`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "friends": [
      {
        "_id": "friend_user_id",
        "username": "friend_username",
        "name": "Friend Name",
        "profession": "Software Engineer",
        "bio": "Love to travel and code!",
        "online": true,
        "lastSeen": "2025-07-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 5. Remove Friend (NEW FEATURE)
**DELETE** `/api/friends/remove`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "friendId": "user_id_of_friend_to_remove"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Friend removed successfully"
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (for friend requests)
- `400` - Bad Request (missing parameters, invalid data)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized for this action)
- `404` - Not Found (user/request not found)
- `500` - Internal Server Error

## How the Remove Friend Feature Works

1. **Authentication**: User must be authenticated with a valid JWT token
2. **Validation**: 
   - Checks if `friendId` is provided
   - Verifies both users exist
   - Confirms they are actually friends
3. **Removal Process**:
   - Removes each user from the other's friends list
   - Cleans up any existing friend requests between them
   - Saves both user documents
4. **Response**: Returns success confirmation

## Usage Example in Frontend

```javascript
// Remove a friend
const removeFriend = async (friendId) => {
  try {
    const response = await fetch('/api/friends/remove', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ friendId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Friend removed successfully!');
      // Update UI - remove friend from friends list
    } else {
      console.error('Error:', data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```
