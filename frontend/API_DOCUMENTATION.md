# My Trip Maps API Documentation

## Base URL

```
http://localhost:5000
```

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in cookies (handled automatically by the frontend).

## Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "data": any,
  "message": "string (optional)",
  "error": "string (optional)"
}
```

---

## 🔐 Authentication Endpoints

### POST /register

Register a new user account.

**Request Body:**

```json
{
  "username": "string (3-20 chars)",
  "email": "valid email",
  "password": "string (min 6 chars)"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "role": "member",
    "createdAt": "date"
  }
}
```

### POST /login

Authenticate user and get JWT token.

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string"
  }
}
```

### POST /logout

Logout user (clears JWT token).

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /verifyUser

Verify current user's authentication status.

**Response:**

```json
{
  "success": true,
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string"
  }
}
```

---

## 👤 User Endpoints

### GET /users/profile/:id

Get user profile with stats.

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "bio": "string",
      "role": "member"
    },
    "maps": [
      {
        "_id": "string",
        "mapName": "string",
        "likes": 0,
        "views": 0,
        "isPrivate": false
      }
    ],
    "stats": {
      "followers": 0,
      "following": 0,
      "totalMaps": 0
    }
  }
}
```

### PUT /users/profile/:id

Update user profile (requires authentication).

**Request Body:**

```json
{
  "username": "string (optional)",
  "bio": "string (optional)",
  "emailPrivate": "boolean (optional)"
}
```

### GET /users/dashboard/:id

Get user dashboard data (requires authentication, own dashboard only).

**Response:**

```json
{
  "success": true,
  "data": {
    "user": "User object",
    "maps": "Array of MapData",
    "friends": "Array of Friend objects",
    "bookmarks": "Array of Bookmark objects"
  }
}
```

### GET /users/search

Search users by username or email.

**Query Parameters:**

- `q`: Search query (min 2 chars)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

### GET /users/top

Get top users by map count.

**Query Parameters:**

- `limit`: Number of users (default: 10)

### DELETE /users/:id

Delete user account (requires authentication, own account only).

---

## 🗺️ Map Endpoints

### POST /maps

Create a new map (requires authentication).

**Request Body:**

```json
{
  "mapName": "string",
  "coordArray": [
    {
      "lat": "number",
      "lng": "number",
      "name": "string (optional)"
    }
  ],
  "isPrivate": "boolean (optional, default: false)"
}
```

### GET /maps/:id

Get individual map with POIs and comments.

**Response:**

```json
{
  "success": true,
  "data": {
    "map": "MapData object",
    "pois": "Array of POI objects",
    "comments": "Array of MapComment objects",
    "isBookmarked": "boolean"
  }
}
```

### GET /users/:userId/maps

Get user's maps with pagination.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

### PUT /maps/:id

Update map (requires authentication, own map only).

**Request Body:**

```json
{
  "mapName": "string (optional)",
  "isPrivate": "boolean (optional)"
}
```

### DELETE /maps/:id

Delete map (requires authentication, own map only).

### PATCH /maps/:id/privacy

Toggle map privacy (requires authentication, own map only).

### GET /maps/search

Search maps by name.

**Query Parameters:**

- `q`: Search query (min 2 chars)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

### GET /maps/popular

Get popular maps.

**Query Parameters:**

- `limit`: Number of maps (default: 10)

### POST /maps/:id/like

Like a map (requires authentication).

---

## 📍 POI Endpoints

### POST /pois

Create a new POI (requires authentication).

**Request Body:**

```json
{
  "map_id": "string",
  "lat": "number",
  "lng": "number",
  "locationName": "string (optional)",
  "date_visited": "date (optional)",
  "tags": ["string"] (optional)
}
```

### GET /pois/:id

Get POI with tags.

**Response:**

```json
{
  "success": true,
  "data": {
    "poi": "POI object",
    "tags": "Array of Tag objects"
  }
}
```

### PUT /pois/:id

Update POI (requires authentication, own POI only).

**Request Body:**

```json
{
  "lat": "number (optional)",
  "lng": "number (optional)",
  "locationName": "string (optional)",
  "date_visited": "date (optional)",
  "tags": ["string"] (optional)
}
```

### DELETE /pois/:id

Delete POI (requires authentication, own POI only).

### GET /maps/:mapId/pois

Get all POIs for a specific map.

### GET /pois/search/location

Search POIs by location.

**Query Parameters:**

- `lat`: Latitude (required)
- `lng`: Longitude (required)
- `radius`: Search radius in km (default: 10)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

### POST /pois/:id/like

Like a POI (requires authentication).

---

## 👥 Social Endpoints

### POST /users/:userId/follow

Follow a user (requires authentication).

### DELETE /users/:userId/follow

Unfollow a user (requires authentication).

### GET /users/:userId/followers

Get user's followers.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

### GET /users/:userId/following

Get users that the user is following.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

### POST /maps/:mapId/bookmark

Bookmark a map (requires authentication).

### DELETE /maps/:mapId/bookmark

Remove bookmark (requires authentication).

### GET /users/:userId/bookmarks

Get user's bookmarks (requires authentication, own bookmarks only).

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

### POST /maps/:mapId/comments

Add comment to map (requires authentication).

**Request Body:**

```json
{
  "comment": "string"
}
```

### GET /maps/:mapId/comments

Get map comments.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

### DELETE /comments/:commentId

Delete comment (requires authentication, own comment only).

### POST /comments/:commentId/like

Like a comment (requires authentication).

### DELETE /comments/:commentId/like

Unlike a comment (requires authentication).

---

## 🔄 Legacy Endpoints (Backward Compatibility)

These endpoints maintain compatibility with existing frontend code:

- `GET /profile/:id` → `GET /users/profile/:id`
- `GET /dashboard/:id` → `GET /users/dashboard/:id`
- `POST /mymaps` → `POST /maps`
- `GET /map/:id` → `GET /maps/:id`
- `PATCH /mapPrivacy/:id/privacy` → `PATCH /maps/:id/privacy`

---

## 📊 Data Models

### User

```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "emailPrivate": "boolean",
  "password": "string (hashed)",
  "role": "member|admin|moderator",
  "bio": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Map

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: User)",
  "mapName": "string",
  "likes": "number",
  "views": "number",
  "isPrivate": "boolean",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### POI

```json
{
  "_id": "ObjectId",
  "map_id": "ObjectId (ref: Map)",
  "lat": "number",
  "lng": "number",
  "locationName": "string",
  "date_visited": "date",
  "likes": "number",
  "user_id": "ObjectId (ref: User)",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Friend

```json
{
  "_id": "ObjectId",
  "following_user_id": "ObjectId (ref: User)",
  "followed_user_id": "ObjectId (ref: User)",
  "createdAt": "date"
}
```

### Bookmark

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: User)",
  "map_id": "ObjectId (ref: Map)"
}
```

### MapComment

```json
{
  "_id": "ObjectId",
  "map_id": "ObjectId (ref: Map)",
  "user_id": "ObjectId (ref: User)",
  "comment": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### CommentLike

```json
{
  "_id": "ObjectId",
  "comment_id": "ObjectId (ref: MapComment)",
  "user_id": "ObjectId (ref: User)",
  "createdAt": "date"
}
```

### Tag

```json
{
  "_id": "ObjectId",
  "name": "string"
}
```

### POITag

```json
{
  "_id": "ObjectId",
  "poi_id": "ObjectId (ref: POI)",
  "tag_id": "ObjectId (ref: Tag)"
}
```

### EditHistory

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: User)",
  "target_type": "map|poi",
  "target_id": "ObjectId",
  "change_summary": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

---

## 🚨 Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## 🔧 Usage Examples

### Frontend API Client Usage

```typescript
import { authApi, userApi, mapApi, poiApi, socialApi } from "@/lib/api";

// Login
const loginResult = await authApi.login("user@example.com", "password");

// Create map
const newMap = await mapApi.createMap({
  mapName: "My Trip",
  coordArray: [{ lat: 40.7128, lng: -74.006, name: "New York" }],
  isPrivate: false,
});

// Follow user
await socialApi.followUser("userId");

// Add comment
await socialApi.addComment("mapId", "Great map!");
```

### Error Handling

```typescript
try {
  const result = await mapApi.getMap("mapId");
  // Handle success
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.message}`);
  }
  // Handle error
}
```
