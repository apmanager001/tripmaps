# Backend Environment Setup for R2

## Required Environment Variables

You need to create a `.env` file in the `backend/` directory with the following variables:

### 1. Create the .env file

Create a file called `.env` in the `backend/` directory:

```bash
cd backend
touch .env
```

### 2. Add the required variables

Add these variables to your `backend/.env` file:

```env
# Database Configuration
MONGO_URL=mongodb://localhost:27017/tripmaps

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000
SERVER_URL=http://localhost:3000
SERVER2_URL=http://localhost:3001

# Cloudflare R2 Configuration (for photo storage)
R2_ACCESS_KEY_ID=your_cloudflare_account_id
R2_SECRET_ACCESS_KEY=your_api_token
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com

# Stripe Configuration (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Get your R2 credentials

Follow the steps in `R2_SETUP.md` to get your Cloudflare R2 credentials:

1. **Account ID**: Found in Cloudflare dashboard
2. **API Token**: Create a custom token with R2 permissions
3. **Bucket Name**: Your R2 bucket name
4. **Endpoint**: `https://your_account_id.r2.cloudflarestorage.com`

### 4. Example values

Replace the placeholder values with your actual credentials:

```env
R2_ACCESS_KEY_ID=1234567890abcdef1234567890abcdef
R2_SECRET_ACCESS_KEY=your_api_token_from_cloudflare
R2_BUCKET_NAME=my-tripmaps-photos
R2_ENDPOINT=https://1234567890abcdef1234567890abcdef.r2.cloudflarestorage.com
```

### 5. Restart the backend

After creating the `.env` file, restart your backend server:

```bash
cd backend
npm start
```

### 6. Verify the setup

Check that the backend starts without credential errors. You should see:

- "Database Connected"
- No "Missing credentials" errors

## Troubleshooting

### Error: "Missing credentials in config"

This means your R2 environment variables are not set correctly. Check:

1. **File location**: Make sure `.env` is in the `backend/` directory
2. **Variable names**: Must be exactly as shown above
3. **No spaces**: Don't add spaces around the `=` sign
4. **Valid credentials**: Ensure your R2 credentials are correct

### Error: "Could not load credentials from any providers"

This usually means the environment variables are not being loaded. Check:

1. **File permissions**: Make sure the `.env` file is readable
2. **File format**: Use Unix line endings (LF, not CRLF)
3. **No quotes**: Don't wrap values in quotes unless they contain spaces

### Still having issues?

1. Check the `R2_SETUP.md` file for detailed R2 setup instructions
2. Verify your Cloudflare R2 bucket is created and accessible
3. Test your credentials with a simple upload test
