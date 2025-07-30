# Google Maps API Setup

## Overview

The map functionality in the POI creation interface requires a Google Maps API key to work properly. This guide will help you set up the necessary API key.

## Prerequisites

- A Google Cloud account
- A Google Cloud project

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "MyTripMaps")
5. Click "Create"

### 2. Enable Required APIs

1. In your Google Cloud project, go to the [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search for and enable the following APIs:
   - **Maps JavaScript API** - Required for displaying maps
   - **Places API** - Required for location search functionality

### 3. Create API Credentials

1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

### 4. Restrict the API Key (Recommended)

1. Click on the API key you just created
2. Under "Application restrictions", select "HTTP referrers (web sites)"
3. Add your domain(s):
   - For development: `http://localhost:3000/*`
   - For production: `https://yourdomain.com/*`
4. Under "API restrictions", select "Restrict key"
5. Select the APIs you enabled (Maps JavaScript API and Places API)
6. Click "Save"

### 5. Add to Environment Variables

1. Create or edit your `.env.local` file in the root directory
2. Add the following line:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with the actual API key you copied

### 6. Restart Your Development Server

After adding the environment variable, restart your Next.js development server:

```bash
npm run dev
```

## Troubleshooting

### Map Not Displaying

If the map is not displaying:

1. **Check Console Errors**: Open browser developer tools and check for any JavaScript errors
2. **Verify API Key**: Make sure the API key is correctly set in your `.env.local` file
3. **Check API Restrictions**: Ensure your domain is allowed in the API key restrictions
4. **Verify API Enablement**: Make sure both Maps JavaScript API and Places API are enabled

### Common Error Messages

- **"Google Maps API error: RefererNotAllowedMapError"**: Your domain is not in the allowed referrers list
- **"Google Maps API error: ApiNotActivatedMapError"**: The Maps JavaScript API is not enabled
- **"Google Maps API error: InvalidKeyMapError"**: The API key is invalid or malformed

### Billing Setup

Google Maps API has a generous free tier, but you may need to set up billing:

1. Go to [Billing](https://console.cloud.google.com/billing) in your Google Cloud Console
2. Link a billing account to your project
3. The free tier includes:
   - 28,500 map loads per month
   - 1,000 Places API requests per day

## Security Notes

- Never commit your API key to version control
- Always restrict your API key to specific domains
- Monitor your API usage to avoid unexpected charges
- Consider using different API keys for development and production

## Support

If you continue to have issues:

1. Check the [Google Maps JavaScript API documentation](https://developers.google.com/maps/documentation/javascript/overview)
2. Verify your setup against the [Google Cloud Console](https://console.cloud.google.com/)
3. Check the browser console for specific error messages
