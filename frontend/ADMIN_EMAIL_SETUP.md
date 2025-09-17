# Admin Email System Setup

This document explains how to set up and use the new admin email system that allows administrators to send emails to all users.

## Features

- **HTML Support**: Write emails using HTML with inline styles
- **Live Preview**: See how your email will look before sending
- **User Targeting**: Automatically sends to all verified users
- **Admin Protection**: Only users with admin role can access
- **Email Templates**: Professional-looking email templates
- **User Statistics**: See how many users will receive the email

## Backend Setup

### 1. New Files Created

- `backend/controllers/adminController.js` - Admin controller with email functionality
- `backend/router/routes.js` - Updated with admin routes

### 2. New Routes Added

```javascript
// Admin routes (protected with adminAuth middleware)
GET    /admin/users/stats          - Get user statistics
POST   /admin/send-email          - Send email to all users
GET    /admin/users               - Get all users (paginated)
PUT    /admin/users/:userId/role  - Update user role
```

### 3. Email Service Updates

The `backend/services/emailService.js` has been updated to handle admin broadcast emails with a new email type: `admin_broadcast`.

## Frontend Setup

### 1. New Files Created

- `src/app/dashboard/comp/AdminEmailComponent.jsx` - Email composition component
- `src/lib/api.ts` - Updated with admin API functions

### 2. Integration

The email component is automatically added to the admin dashboard (`src/app/dashboard/comp/admin.jsx`) and appears below the flags management section.

## Usage

### 1. Accessing the Email System

1. Log in as an admin user
2. Navigate to `/dashboard`
3. Click on the "Admin" tab
4. Scroll down to the "Email Management" section

### 2. Composing an Email

1. **Subject**: Enter a clear, concise subject line (max 100 characters)
2. **Content**: Write your email content using HTML with inline styles
3. **Preview**: Click "Show Preview" to see how the email will look
4. **Send**: Click "Send to X Users" to broadcast the email

### 3. HTML Support

The system supports the following HTML syntax with inline styles:

#### Basic Text Formatting

```html
<h1 style="color: #1f2937; font-size: 2rem; margin-bottom: 1rem;">
  Main Heading
</h1>

<h2 style="color: #374151; font-size: 1.5rem; margin-bottom: 0.75rem;">
  Sub Heading
</h2>

<h3 style="color: #4b5563; font-size: 1.25rem; margin-bottom: 0.5rem;">
  Section Heading
</h3>

<strong>Bold text</strong>
<em>Italic text</em>
<code
  style="background-color: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem;"
  >code snippets</code
>

<del style="text-decoration: line-through;">Strikethrough text</del>

<blockquote
  style="border-left: 4px solid #3b82f6; padding-left: 1rem; font-style: italic; margin: 1rem 0;"
>
  Blockquote text<br />Multiple lines supported
</blockquote>
```

#### Lists

```html
<ul style="margin: 1rem 0; padding-left: 1.5rem;">
  <li>Bullet lists</li>
  <li>Multiple items</li>
  <li>
    Nested items
    <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
      <li>Sub-item 1</li>
      <li>Sub-item 2</li>
    </ul>
  </li>
</ul>

<ol style="margin: 1rem 0; padding-left: 1.5rem;">
  <li>Numbered lists</li>
  <li>Multiple items</li>
  <li>Auto-incrementing</li>
</ol>
```

#### Links and References

```html
<a
  href="https://example.com"
  style="color: #3b82f6; text-decoration: underline;"
  >Link text</a
>

<a
  href="https://example.com"
  style="color: #3b82f6; text-decoration: underline;"
  title="Optional title"
  >Reference link</a
>
```

#### Code Blocks

```html
<code
  style="background-color: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace;"
  >inline code</code
>

<pre
  style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; font-family: monospace; overflow-x: auto;"
><code>// Code block with syntax highlighting
function hello() {
  console.log("Hello, World!");
}</code></pre>
```

````

#### Tables
```html
<table style="border-collapse: collapse; width: 100%; margin: 1rem 0;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: left;">Header 1</th>
      <th style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: left;">Header 2</th>
      <th style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: left;">Header 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem;">Cell 1</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem;">Cell 2</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem;">Cell 3</td>
    </tr>
    <tr>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem;">Cell 4</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem;">Cell 5</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem;">Cell 6</td>
    </tr>
  </tbody>
</table>

<table style="border-collapse: collapse; width: 100%; margin: 1rem 0;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: left;">Left Align</th>
      <th style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: center;">Center Align</th>
      <th style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: right;">Right Align</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: left;">Left</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: center;">Center</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: right;">Right</td>
    </tr>
    <tr>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: left;">Data</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: center;">Data</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: right;">Data</td>
    </tr>
  </tbody>
</table>
````

#### Images

```html
<img
  src="https://example.com/image.jpg"
  alt="Alt text"
  style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0;"
/>

<img
  src="https://example.com/image.jpg"
  alt="Alt text"
  title="Optional title"
  style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0;"
/>
```

#### Horizontal Rules

```html
<hr style="border: none; border-top: 1px solid #d1d5db; margin: 1rem 0;" />

<hr style="border: none; border-top: 2px solid #9ca3af; margin: 1rem 0;" />

<hr style="border: none; border-top: 3px solid #6b7280; margin: 1rem 0;" />
```

#### Emphasis and Highlighting

```html
<strong>Strong emphasis</strong>
<em>Light emphasis</em>
<strong><em>Very strong emphasis</em></strong>

<span
  style="background-color: #fef3c7; padding: 0.125rem 0.25rem; border-radius: 0.25rem;"
  >Highlighted text</span
>

<mark
  style="background-color: #fef3c7; padding: 0.125rem 0.25rem; border-radius: 0.25rem;"
  >Marked text</mark
>
```

#### Task Lists

```html
<ul style="margin: 1rem 0; padding-left: 1.5rem; list-style: none;">
  <li style="margin: 0.5rem 0;">
    ✅ <span style="text-decoration: line-through;">Completed task</span>
  </li>
  <li style="margin: 0.5rem 0;">⭕ Pending task</li>
  <li style="margin: 0.5rem 0;">⭕ Another pending task</li>
</ul>
```

#### Footnotes

```html
<p>
  Here's a sentence with a footnote<sup
    style="color: #3b82f6; font-size: 0.75rem;"
    >1</sup
  >.
</p>

<div
  style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; font-size: 0.875rem; color: #6b7280;"
>
  <sup style="color: #3b82f6;">1</sup> This is the footnote content.
</div>
```

#### Escaping Characters

```html
<!-- For HTML, you can use HTML entities or comments -->
&lt;strong&gt;This text is not bold&lt;/strong&gt;

<!-- Or use HTML comments to show literal text -->
<!-- <strong>This text is not bold</strong> -->
```

### 4. Practical Examples

Here are some real-world examples of how to use HTML in admin emails:

#### Newsletter Template

```html
<h1 style="color: #1f2937; font-size: 2rem; margin-bottom: 1rem;">
  🎉 Monthly Newsletter - December 2024
</h1>

<h2 style="color: #374151; font-size: 1.5rem; margin-bottom: 0.75rem;">
  What's New This Month
</h2>

<p>We've added several exciting features to My Trip Maps:</p>

<ul style="margin: 1rem 0; padding-left: 1.5rem;">
  <li>
    <strong>Enhanced Map Interface</strong>: Improved performance and user
    experience
  </li>
  <li>
    <strong>New POI Categories</strong>: Better organization for your favorite
    places
  </li>
  <li><strong>Mobile App</strong>: Now available on iOS and Android</li>
</ul>

<h2 style="color: #374151; font-size: 1.5rem; margin-bottom: 0.75rem;">
  Upcoming Features
</h2>

<table style="border-collapse: collapse; width: 100%; margin: 1rem 0;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: left;">
        Feature
      </th>
      <th style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: left;">
        Status
      </th>
      <th style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: left;">
        Expected Release
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem;">Dark Mode</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem;">
        🟡 In Progress
      </td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem;">January 2025</td>
    </tr>
    <tr>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem;">
        Social Sharing
      </td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem;">🟢 Complete</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem;">Available Now</td>
    </tr>
    <tr>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem;">Offline Maps</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem;">🔴 Planning</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem;">Q2 2025</td>
    </tr>
  </tbody>
</table>

<h2 style="color: #374151; font-size: 1.5rem; margin-bottom: 0.75rem;">
  Community Highlights
</h2>

<blockquote
  style="border-left: 4px solid #3b82f6; padding-left: 1rem; font-style: italic; margin: 1rem 0;"
>
  "My Trip Maps has completely changed how I plan my vacations!"<br /><br />
  - Sarah M., Premium Member
</blockquote>

<h2 style="color: #374151; font-size: 1.5rem; margin-bottom: 0.75rem;">
  Quick Links
</h2>

<ul style="margin: 1rem 0; padding-left: 1.5rem;">
  <li>
    <a
      href="https://mytripmaps.com"
      style="color: #3b82f6; text-decoration: underline;"
      >Visit Our Website</a
    >
  </li>
  <li>
    <a
      href="https://mytripmaps.com/blog"
      style="color: #3b82f6; text-decoration: underline;"
      >Read Our Blog</a
    >
  </li>
  <li>
    <a
      href="https://discord.gg/mytripmaps"
      style="color: #3b82f6; text-decoration: underline;"
      >Join Our Community</a
    >
  </li>
</ul>

<hr style="border: none; border-top: 1px solid #d1d5db; margin: 1rem 0;" />

<p style="font-style: italic; color: #6b7280;">
  Thank you for being part of our amazing community!
</p>
```

#### System Maintenance Notice

```markdown
# 🔧 Scheduled Maintenance Notice

## When

**Date**: January 15, 2025  
**Time**: 2:00 AM - 6:00 AM EST  
**Duration**: 4 hours

## What to Expect

- Brief service interruption
- Improved performance after maintenance
- New security updates

## Affected Services

- [x] Map creation and editing
- [x] POI management
- [ ] User profiles (read-only during maintenance)
- [ ] Photo uploads

## Contact Support

If you experience any issues, please contact our support team:

- Email: support@mytripmaps.com
- Live Chat: Available on our website

![Maintenance](https://example.com/maintenance-icon.png)
```

#### Feature Announcement

````markdown
# 🚀 New Feature: Collaborative Maps

We're excited to announce **Collaborative Maps** - now you can work together with friends and family to create amazing trip experiences!

## How It Works

1. **Create** a collaborative map
2. **Invite** friends via email or username
3. **Collaborate** in real-time
4. **Share** your final creation

## Benefits

- Real-time updates
- Comment and discuss POIs
- Version history
- Easy sharing

## Get Started

```bash
# Create a new collaborative map
1. Go to Dashboard
2. Click "New Map"
3. Enable "Collaborative Mode"
4. Invite your team
```
````

---

_Ready to start collaborating? [Create your first collaborative map now!](https://mytripmaps.com/dashboard)_

````

### 5. Tips and Best Practices

#### Email Structure
- **Clear Subject Line**: Use descriptive, action-oriented subjects
- **Scannable Content**: Break up text with headers, lists, and tables
- **Call to Action**: Include clear next steps for recipients
- **Mobile-Friendly**: Keep line lengths reasonable for mobile devices

#### Markdown Best Practices
- **Consistent Formatting**: Use the same heading levels throughout
- **Meaningful Alt Text**: Always provide descriptive alt text for images
- **Table Alignment**: Use alignment markers for better readability
- **Code Blocks**: Use appropriate language tags for syntax highlighting

#### Content Guidelines
- **Keep it Concise**: Respect users' time with focused content
- **Use Visual Elements**: Emojis, tables, and images make emails engaging
- **Test Your Preview**: Always use the preview feature before sending
- **Proofread**: Check for typos and formatting issues

#### Image Guidelines
- **Optimize Size**: Use compressed images (under 1MB recommended)
- **Hosting**: Ensure images are hosted on reliable, accessible servers
- **Alt Text**: Provide meaningful descriptions for accessibility
- **Responsive**: Test how images look on different devices

#### Table Best Practices
- **Clear Headers**: Use descriptive column headers
- **Consistent Data**: Align similar data types in columns
- **Not Too Wide**: Keep tables under 5-6 columns for readability
- **Use Alignment**: Left-align text, center-align numbers, right-align dates

### 6. Troubleshooting Common Issues

#### Preview Not Working
- Check that Markdown syntax is correct
- Ensure all brackets and parentheses are properly closed
- Verify that the preview toggle is enabled

#### Images Not Displaying
- Confirm the image URL is accessible
- Check that the image format is supported (JPG, PNG, GIF, WebP)
- Ensure the image hosting service allows external linking

#### Tables Not Rendering
- Verify proper table syntax with pipes and dashes
- Check that header separators have at least 3 dashes
- Ensure consistent column count across all rows

#### Formatting Issues
- Use consistent spacing around Markdown elements
- Avoid mixing different Markdown flavors
- Test with simple content first, then add complexity

### 7. Email Template

Admin broadcast emails use a professional template with:

- My Trip Maps branding
- Gradient header
- Clean content area
- Footer with email preferences note

## Security Features

### 8.1 Admin Authentication

- Only users with `role: "admin"` can access
- Protected by `adminAuth` middleware
- JWT token validation required

### 8.2 User Privacy

- Only sends to users with verified emails
- Respects `emailPrivate` setting
- Excludes unverified accounts

### 8.3 Rate Limiting

- Consider implementing rate limiting for email broadcasts
- Monitor email service usage

## Testing

### 9.1 Test File

Use `test-admin-email.js` to test the backend functionality:

```bash
# Install axios if not already installed
npm install axios

# Run the test
node test-admin-email.js
````

### 9.2 Manual Testing

1. Create an admin user in your database
2. Test the email composition interface
3. Verify emails are received by test users
4. Check email formatting and delivery

## Configuration

### 10.1 Environment Variables

Ensure these are set in your backend `.env`:

```env
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-email-password
ALERT_EMAIL_USER=your-email@domain.com
ALERT_EMAIL_PASS=your-email-password
```

### 10.2 Email Service

The system uses the existing email service configuration (Zoho SMTP by default).

## Monitoring and Logging

### 11.1 Backend Logs

The system logs email broadcast activities:

```javascript
console.log(
  `Admin broadcast email sent to ${successful} users. Failed: ${failed}`
);
```

### 11.2 Email Delivery

Monitor email delivery through your email service provider's dashboard.

## Troubleshooting

### 12.1 Common Issues

- **Permission Denied**: Ensure user has admin role
- **Email Not Sending**: Check email service configuration
- **No Users Found**: Verify users have verified emails

### 12.2 Debug Steps

1. Check backend logs for errors
2. Verify admin authentication
3. Test email service independently
4. Check user database for verified users

## Future Enhancements

### 13.1 Potential Features

- Email scheduling
- User segmentation (by role, activity, etc.)
- Email templates library
- Delivery tracking
- A/B testing
- Email analytics

### 13.2 Performance Improvements

- Batch email processing
- Queue system for large user bases
- Email service fallbacks

## Support

For issues or questions about the admin email system:

1. Check the backend logs
2. Verify email service configuration
3. Test with the provided test file
4. Review this documentation

## Notes

- The system uses HTML content directly for email rendering (no conversion needed)
- Emails are sent asynchronously to all users
- Failed email deliveries are logged but don't prevent successful ones
- Consider implementing email bounces handling for production use
