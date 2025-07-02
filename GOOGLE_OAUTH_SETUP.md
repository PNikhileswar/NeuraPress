# Google OAuth Setup Guide for TrendWise

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make sure billing is enabled (required for OAuth)

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "People API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure the OAuth consent screen first (if prompted):
   
   **OAuth Consent Screen Setup:**
   - Choose "External" for user type
   - Fill in the required fields:
     - App name: "TrendWise"
     - User support email: your email
     - Application home page: http://localhost:3001 (for development)
     - Developer contact email: your email
   - **Scopes**: Default scopes (openid, email, profile) are sufficient
   - **Test users**: Add your email for development testing
   - **Publishing status**: Keep in "Testing" mode for development
   - Save and continue through all steps
   
   **Note**: During development, users will see "This app isn't verified" - click "Advanced" > "Go to TrendWise (unsafe)" to continue.

4. For Application type, select "Web application"
5. Add authorized redirect URIs:
   - For development: `http://localhost:3001/api/auth/callback/google`
   - For development (current port): `http://localhost:3001/api/auth/callback/google`
   - For production: `https://your-vercel-domain.vercel.app/api/auth/callback/google`

6. Click "Create"
7. Copy the Client ID and Client Secret

## Step 4: Update Environment Variables

Replace the values in your `.env.local` file with your actual credentials:

```env
# Google OAuth - Replace with your actual credentials
GOOGLE_CLIENT_ID=your-actual-google-client-id-from-step-3
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-from-step-3
```

## Step 5: Update NextAuth URL

Make sure your NEXTAUTH_URL matches your current development URL:

```env
NEXTAUTH_URL=http://localhost:3001
```

## Step 6: Restart Development Server

After updating the environment variables, restart your development server:

```bash
npm run dev
```

## Common Issues:

1. **"OAuth client was not found"**: 
   - Check that your Client ID is correct
   - Make sure the Google+ API is enabled

2. **"redirect_uri_mismatch"**: 
   - Ensure the redirect URI in Google Console exactly matches your NextAuth callback URL
   - Check that you're using the correct port (3001 in this case)

3. **"This app isn't verified"**: 
   - This is normal during development
   - Click "Advanced" > "Go to TrendWise (unsafe)" to continue

## For Production Deployment:

When deploying to Vercel, make sure to:
1. Add your production domain to Google OAuth redirect URIs
2. Set environment variables in Vercel dashboard
3. Update NEXTAUTH_URL to your production URL
