# My Trip Maps

[https://mytripmaps.com](https://mytripmaps.com)

A creative platform that transforms photo memories into interactive travel maps. Users can upload images, automatically extract metadata like timestamps and GPS coordinates, pin them to custom maps, and enrich each location with names, notes, and contextual links.

## 🚀 Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind CSS
- **Lucide React** - Beautiful icons
- **TanStack Query** - Data fetching and caching
- **Zustand** - Lightweight state management
- **MapLibre GL** - Open-source mapping library

### Backend

- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📋 Prerequisites

- Node.js 18+
- MongoDB instance
- RapidAPI account (for POI data)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd mytripmaps
```

### 2. Install dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup

#### Google Maps API Key Setup

To use the map functionality, you'll need a Google Maps API key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 4. Database Setup

Ensure MongoDB is running and accessible at the URL specified in your environment variables.

### 5. Start Development Servers

```bash
# Start backend server (from backend directory)
cd backend
npm run test

# Start frontend server (from root directory)
npm run dev
```

## 🏗️ Project Structure

```
mytripmaps/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utility functions and API clients
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   └── hooks/              # Custom React hooks
├── backend/
│   ├── controllers/        # Route controllers
│   │   ├── authcontroller.js
│   │   ├── userController.js
│   │   ├── mapController.js
│   │   ├── poiController.js
│   │   └── socialController.js
│   ├── middleware/         # Express middleware
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── model/             # Mongoose models
│   ├── router/            # Express routes
│   └── helpers/           # Utility functions
└── public/                # Static assets
```

## 🔧 Key Features

### Frontend Improvements

- ✅ **TypeScript Integration** - Full type safety across the application
- ✅ **Centralized API Client** - Consistent error handling and request management
- ✅ **Error Boundaries** - Graceful error handling with fallback UI
- ✅ **Loading States** - Consistent loading indicators
- ✅ **Custom Hooks** - Reusable logic for localStorage and other utilities
- ✅ **Security Headers** - Enhanced security with proper HTTP headers

### Backend Improvements

- ✅ **Comprehensive Controllers** - Full CRUD operations for all models
- ✅ **Input Validation** - Comprehensive request validation
- ✅ **Error Handling** - Centralized error handling middleware
- ✅ **Security Enhancements** - CORS configuration, request logging
- ✅ **Environment Validation** - Required environment variable checking
- ✅ **Graceful Shutdown** - Proper cleanup on server termination
- ✅ **Social Features** - Friends, bookmarks, comments, likes
- ✅ **POI Management** - Points of interest with tags and location search
- ✅ **User Management** - Profiles, search, top users
- ✅ **Map Features** - Privacy controls, search, popular maps

## 📊 Database Models

### Core Models

- **User** - User accounts with roles and profiles
- **Map** - Trip maps with privacy controls
- **POI** - Points of interest on maps
- **Tag** - Categorization for POIs
- **POITag** - Many-to-many relationship between POIs and tags

### Social Models

- **Friend** - User following relationships
- **Bookmark** - User bookmarks for maps
- **MapComment** - Comments on maps
- **CommentLike** - Likes on comments

### Utility Models

- **EditHistory** - Track changes to maps and POIs

## 🚀 API Endpoints

### Authentication

- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /verifyUser` - Verify user token

### User Management

- `GET /users/profile/:id` - Get user profile
- `PUT /users/profile/:id` - Update user profile
- `GET /users/dashboard/:id` - Get user dashboard
- `GET /users/search` - Search users
- `GET /users/top` - Get top users
- `DELETE /users/:id` - Delete user account

### Map Management

- `POST /maps` - Create new map
- `GET /maps/:id` - Get individual map
- `GET /users/:userId/maps` - Get user's maps
- `PUT /maps/:id` - Update map
- `DELETE /maps/:id` - Delete map
- `PATCH /maps/:id/privacy` - Toggle map privacy
- `GET /maps/search` - Search maps
- `GET /maps/popular` - Get popular maps
- `POST /maps/:id/like` - Like map

### POI Management

- `POST /pois` - Create new POI
- `GET /pois/:id` - Get POI with tags
- `PUT /pois/:id` - Update POI
- `DELETE /pois/:id` - Delete POI
- `GET /maps/:mapId/pois` - Get POIs by map
- `GET /pois/search/location` - Search POIs by location
- `POST /pois/:id/like` - Like POI

### Social Features

- `POST /users/:userId/follow` - Follow user
- `DELETE /users/:userId/follow` - Unfollow user
- `GET /users/:userId/followers` - Get followers
- `GET /users/:userId/following` - Get following
- `POST /maps/:mapId/bookmark` - Bookmark map
- `DELETE /maps/:mapId/bookmark` - Remove bookmark
- `GET /users/:userId/bookmarks` - Get user bookmarks
- `POST /maps/:mapId/comments` - Add comment
- `GET /maps/:mapId/comments` - Get map comments
- `DELETE /comments/:commentId` - Delete comment
- `POST /comments/:commentId/like` - Like comment
- `DELETE /comments/:commentId/like` - Unlike comment

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🚀 Deployment

### Frontend (Personal Server)

### Backend (Personal Server)


## 📝 API Documentation

Complete API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) including:

- All endpoint details
- Request/response formats
- Data models
- Error codes
- Usage examples

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
[MIT](LICENSE)

## 🆘 Support

If you encounter any issues or have questions, please:

1. Check the existing issues
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

Created by [@apmanager001](https://github.com/apmanager001)  
Contact: contact@robertfoley.us