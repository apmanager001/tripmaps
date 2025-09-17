# Email Setup for TripMaps

This document explains how to set up email functionality for TripMaps, including password reset and email verification features.

## Environment Variables

Add the following environment variables to your `.env` file in the backend:

```env
# Email Configuration (Zoho Mail)
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

## Features

### 1. Email Verification

- Automatically sent when users register
- 24-hour expiration time
- Users can resend verification emails from settings
- Required for full account functionality

### 2. Password Reset

- Users can request password reset from login page
- 1-hour expiration time
- Secure token-based reset process

## Gmail Setup

### 1. Enable 2-Factor Authentication

- Go to your Google Account settings
- Enable 2-Factor Authentication if not already enabled

### 2. Generate App Password

- Go to Google Account settings
- Navigate to Security > 2-Step Verification
- Click on "App passwords"
- Generate a new app password for "Mail"
- Use this password as `EMAIL_PASS` in your environment variables

### 3. Alternative Email Services

If you prefer to use other email services, you can modify the transporter configuration in `backend/controllers/authcontroller.js`:

#### For Zoho Mail:

```javascript
const transporter = nodemailer.createTransporter({
  host: "smtp.zoho.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

**Zoho Setup Steps:**

1. Log into your Zoho Mail account
2. Go to Settings → Mail Accounts → Security
3. Enable "Two-Factor Authentication" if not already enabled
4. Generate an "App Password" for your application
5. Use this app password as `EMAIL_PASS` in your environment variables

#### For Outlook/Hotmail:

```javascript
const transporter = nodemailer.createTransporter({
  service: "outlook",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

#### For Custom SMTP:

```javascript
const transporter = nodemailer.createTransporter({
  host: "your-smtp-host.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## Testing

1. Start your backend server
2. Navigate to `/forgot-password` on your frontend
3. Enter a valid email address
4. Check the email inbox for the reset link
5. Click the link to test the password reset functionality

## Security Notes

- Reset tokens expire after 1 hour
- Tokens are hashed before storing in the database
- Tokens are cleared after successful password reset
- The reset link contains a secure random token

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**: Make sure you're using an app password, not your regular Gmail password
2. **"Connection timeout"**: Check your internet connection and firewall settings
3. **"Authentication failed"**: Verify your email and app password are correct
4. **Emails not received**: Check spam folder and verify the email address is correct

### Debug Mode:

To enable debug mode for nodemailer, add this to your transporter configuration:

```javascript
const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true, // Enable debug output
  logger: true, // Log to console
});
```
