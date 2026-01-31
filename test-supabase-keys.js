// Test Supabase API keys directly
const { default: fetch } = require('node-fetch');

const SUPABASE_URL = 'https://zatysaexdxqieeqylsgr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphdHlzYWV4ZHhxaWVlcXlsc2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MDk4NTMsImV4cCI6MjA3NDA4NTg1M30.sg5XnjRwQFjn4NNB5yBkyFgT86jz0AXBRPtBsEbyJhs';

async function testSupabaseKeys() {
  console.log('🔍 Testing Supabase API Keys...');
  console.log('📍 URL:', SUPABASE_URL);
  console.log('🔑 Key:', ANON_KEY.substring(0, 50) + '...');
  console.log('');

  // Test 1: Basic API connectivity
  console.log('Test 1: Basic API connectivity');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 200) {
      console.log('🎉 Basic API connectivity: WORKING');
    } else {
      console.log('❌ Basic API connectivity: FAILED');
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Basic API connectivity: ERROR');
    console.error('Error:', error.message);
  }

  console.log('');

  // Test 2: Auth endpoint
  console.log('Test 2: Auth endpoint');
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    
    console.log('✅ Auth Response Status:', response.status);
    
    if (response.status === 200) {
      const settings = await response.json();
      console.log('🎉 Auth endpoint: WORKING');
      console.log('📋 Auth settings:', JSON.stringify(settings, null, 2));
    } else {
      console.log('❌ Auth endpoint: FAILED');
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Auth endpoint: ERROR');
    console.error('Error:', error.message);
  }

  console.log('');

  // Test 3: Database access (users table)
  console.log('Test 3: Database access (users table)');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=count&head=true`, {
      method: 'HEAD',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Database Response Status:', response.status);
    
    if (response.status === 200) {
      console.log('🎉 Database access: WORKING');
      const count = response.headers.get('content-range');
      console.log('📊 Users table accessible, count header:', count);
    } else {
      console.log('❌ Database access: FAILED');
      console.log('Status:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Database access: ERROR');
    console.error('Error:', error.message);
  }

  console.log('');

  // Test 4: OAuth token exchange simulation
  console.log('Test 4: OAuth token exchange endpoint');
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=authorization_code`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: 'test_code',
        redirect_uri: 'http://localhost:2020/auth/callback'
      })
    });
    
    console.log('✅ OAuth Token Exchange Status:', response.status);
    
    if (response.status === 400) {
      console.log('🎉 OAuth endpoint: WORKING (400 expected for invalid code)');
      const error = await response.json();
      console.log('Expected error:', error);
    } else if (response.status === 401) {
      console.log('❌ OAuth endpoint: API KEY INVALID (401 Unauthorized)');
      const error = await response.json();
      console.log('Auth error:', error);
    } else {
      console.log('⚠️ OAuth endpoint: Unexpected status');
      const responseText = await response.text();
      console.log('Response:', responseText);
    }
  } catch (error) {
    console.log('❌ OAuth token exchange: ERROR');
    console.error('Error:', error.message);
  }

  console.log('');
  console.log('🏁 Test completed!');
}

// Run the test
testSupabaseKeys().catch(console.error);