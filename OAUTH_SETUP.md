# OAuth Setup Guide

This guide will help you set up Google and Facebook OAuth authentication for your TripMaps application.

## Environment Variables

Add the following environment variables to your `.env` file:

### Google OAuth

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
```

### Facebook OAuth

```
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:5000/auth/facebook/callback
```

### Frontend URL

```
FRONTEND_URL=http://localhost:3000
```

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create a new OAuth 2.0 Client ID
5. Set the authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)
6. Copy the Client ID and Client Secret to your environment variables

## Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add Facebook Login product to your app
4. Go to "Settings" > "Basic" and copy the App ID and App Secret
5. Go to "Facebook Login" > "Settings" and add valid OAuth redirect URIs:
   - `http://localhost:5000/auth/facebook/callback` (for development)
   - `https://yourdomain.com/auth/facebook/callback` (for production)
6. Copy the App ID and App Secret to your environment variables

## Production Setup

For production deployment, update the redirect URIs to use your actual domain:

### Google

- Redirect URI: `https://yourdomain.com/auth/google/callback`

### Facebook

- Redirect URI: `https://yourdomain.com/auth/facebook/callback`
- App Domains: `yourdomain.com`
- Privacy Policy URL: `https://yourdomain.com/privacy`
- Terms of Service URL: `https://yourdomain.com/terms`

## Security Considerations

1. **HTTPS Required**: OAuth requires HTTPS in production
2. **State Parameter**: Consider adding a state parameter to prevent CSRF attacks
3. **Token Storage**: JWT tokens are stored in HTTP-only cookies for security
4. **User Validation**: Always validate user data received from OAuth providers

## Testing

1. Start your backend server
2. Start your frontend application
3. Try logging in with Google or Facebook
4. Check that users are created in your database
5. Verify that JWT tokens are set correctly

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**: Ensure the redirect URI in your OAuth app settings matches exactly
2. **CORS Issues**: Make sure your frontend URL is properly configured
3. **Environment Variables**: Verify all environment variables are set correctly
4. **HTTPS**: OAuth requires HTTPS in production environments

### Error Handling

The application includes error handling for:

- Failed OAuth authentication
- Missing authorization codes
- Invalid tokens
- User creation failures

Users are redirected back to the login page with appropriate error messages if authentication fails.
