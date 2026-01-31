# OAuth Setup Guide for ProjectForge

## Current Issue
The GitHub OAuth is failing because the client_id shows an email address instead of a proper GitHub Client ID, and there's a port mismatch in the redirect URL.

## Step-by-Step Fix

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   ```
   Application name: ProjectForge
   Homepage URL: http://localhost:2020
   Authorization callback URL: https://zatysaexdxqieeqylsgr.supabase.co/auth/v1/callback
   ```
4. Click **"Register application"**
5. **Copy the Client ID and Client Secret** (you'll need these)

### 2. Configure Supabase OAuth

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `zatysaexdxqieeqylsgr`
3. Navigate to: **Authentication → Providers**
4. Find **GitHub** provider and click to configure
5. **Enable the GitHub provider**
6. Enter your credentials:
   ```
   Client ID: [Your GitHub OAuth App Client ID]
   Client Secret: [Your GitHub OAuth App Client Secret]
   ```
7. **Save the configuration**

### 3. Update Site URL in Supabase

1. In Supabase Dashboard, go to: **Authentication → URL Configuration**
2. Set **Site URL** to: `http://localhost:2020`
3. Add **Redirect URLs**:
   ```
   http://localhost:2020
   http://localhost:2020/auth/callback
   ```

### 4. Test Google OAuth (Alternative)

If GitHub setup is complex, you can test with Google OAuth first:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set authorized redirect URIs:
   ```
   https://zatysaexdxqieeqylsgr.supabase.co/auth/v1/callback
   ```
6. Configure in Supabase the same way as GitHub

### 5. Verify Configuration

After setup, the OAuth URL should look like:
```
https://github.com/login/oauth/authorize?client_id=YOUR_ACTUAL_CLIENT_ID&redirect_uri=https%3A%2F%2Fzatysaexdxqieeqylsgr.supabase.co%2Fauth%2Fv1%2Fcallback&response_type=code&scope=user%3Aemail&state=...
```

## Common Issues & Solutions

### Issue 1: "Page not found" after GitHub redirect
**Cause**: Invalid client_id or misconfigured redirect URI
**Solution**: Verify GitHub OAuth app settings and Supabase configuration

### Issue 2: Port mismatch (3000 vs 2020)
**Cause**: Supabase site URL is set to localhost:3000
**Solution**: Update Supabase site URL to localhost:2020

### Issue 3: Email address as client_id
**Cause**: GitHub OAuth app not properly configured in Supabase
**Solution**: Ensure you enter the actual Client ID (not email) in Supabase

## Testing Steps

1. Start your app: `npm start`
2. Navigate to login/signup page
3. Click "Continue with GitHub" or "Continue with Google"
4. Should redirect to provider's OAuth page
5. After authorization, should redirect back to your app
6. Check browser console for any errors

## Environment Variables (if needed)

If you want to add OAuth credentials to your .env file for reference:
```
# OAuth Configuration (for reference)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Note**: Don't commit OAuth secrets to version control!