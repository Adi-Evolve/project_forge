# Supabase API Key Fix Guide

## The Problem
Your Supabase API keys are invalid or expired, causing 401 Unauthorized errors:
- OAuth authentication fails
- Database queries fail
- All Supabase operations fail

## Step-by-Step Solution

### 1. Get New API Keys from Supabase Dashboard

1. **Go to**: https://supabase.com/dashboard/project/zatysaexdxqieeqylsgr
2. **Navigate to**: Settings → API
3. **Copy the following**:
   - **Project URL**: Should be `https://zatysaexdxqieeqylsgr.supabase.co`
   - **anon/public key**: A long JWT token starting with `eyJ...`
   - **service_role key**: Another long JWT token starting with `eyJ...`

### 2. Update Your .env File

Replace the keys in your `.env` file:

```properties
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://zatysaexdxqieeqylsgr.supabase.co
REACT_APP_SUPABASE_ANON_KEY=[NEW_ANON_KEY_HERE]
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=[NEW_SERVICE_ROLE_KEY_HERE]
```

### 3. Restart Your Development Server

After updating the .env file:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
```

### 4. Test the Connection

After restart, the 401 errors should disappear and OAuth should work properly.

## Current Invalid Keys

Your current keys appear to be expired:
- ANON_KEY: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphdHlzYWV4ZHhxaWVlcXlsc2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MDk4NTMsImV4cCI6MjA3NDA4NTg1M30.sg5XnjRwQFjn4NNB5yBkyFgT86jz0AXBRPtBsEbyJhs`

These need to be replaced with fresh keys from your Supabase dashboard.

## Verification

Once you update the keys, you should see:
- ✅ No more 401 Unauthorized errors
- ✅ OAuth authentication working
- ✅ Database operations successful
- ✅ Transaction monitoring working