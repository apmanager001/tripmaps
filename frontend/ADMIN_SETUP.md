# Admin Functionality Setup

This document describes the admin functionality for managing flagged photos in the TripMaps application.

## Overview

The admin functionality allows users with the "admin" role to:

- View all flagged photos
- Filter flags by status (pending, reviewed, resolved, dismissed)
- Update flag status with admin notes
- Manage the moderation workflow

## Backend Changes

### 1. User Model

The user model already includes a `role` field with possible values:

- `"member"` (default)
- `"admin"`
- `"moderator"`

### 2. Authentication Updates

- Updated `verifyUser` endpoint to include `role` in the response
- Created `adminAuth` middleware for role-based access control

### 3. Flag Management

- Enhanced flag controller with proper admin checks
- Updated routes to use admin middleware for protected endpoints

## Frontend Changes

### 1. Dashboard Updates

- Added conditional admin tab that only appears for admin users
- Integrated admin component into the dashboard navigation

### 2. Admin Component

- Modern UI with status filtering
- Real-time status updates
- Pagination support
- Admin notes functionality

## API Endpoints

### Admin-Protected Endpoints

- `GET /flags` - Get all flags (admin only)
- `PUT /flags/:flagId/status` - Update flag status (admin only)

### Public Flag Endpoints

- `POST /flags` - Create a new flag
- `GET /flags/user` - Get user's own flags
- `GET /flags/check/:photoId` - Check if user has flagged a photo

## Flag Status Values

- `pending` - Flag is awaiting review
- `reviewed` - Flag has been reviewed but not yet resolved
- `resolved` - Flag has been resolved (photo approved/removed)
- `dismissed` - Flag has been dismissed (false report)

## Setting Up Admin Users

To make a user an admin, update their role in the database:

```javascript
// In MongoDB
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
```

Or use the MongoDB shell:

```bash
mongo
use your_database_name
db.users.updateOne({email: "admin@example.com"}, {$set: {role: "admin"}})
```

## Usage

1. **Login as an admin user**
2. **Navigate to the dashboard**
3. **Click on the "Admin" tab** (only visible to admin users)
4. **Review flagged photos** and take appropriate action:
   - Resolve: Mark the flag as resolved (photo approved)
   - Dismiss: Mark the flag as dismissed (false report)
   - Add notes: Provide additional context for the decision

## Security

- Admin middleware ensures only users with admin role can access protected endpoints
- Frontend conditionally shows admin tab based on user role
- All admin actions are logged with the admin's user ID

## Testing

To test the admin functionality:

1. Create a test user and make them an admin
2. Create some test flags (or use existing ones)
3. Login as the admin user
4. Navigate to the admin dashboard
5. Test filtering and status updates

## Future Enhancements

- Bulk actions for multiple flags
- Email notifications for flag status changes
- Advanced filtering and search
- Flag analytics and reporting
- Integration with photo deletion/restoration
