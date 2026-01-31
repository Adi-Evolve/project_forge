// Quick Supabase Connection Test
// Run this in browser console to debug API key issues

const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase Connection...');
  
  // Test environment variables
  console.log('Environment Variables:');
  console.log('SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
  console.log('ANON_KEY (first 20 chars):', process.env.REACT_APP_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
  
  try {
    // Test basic connection
    const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY || ''}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🌐 Basic connection status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Supabase connection successful');
    } else if (response.status === 401) {
      console.log('❌ Unauthorized - API key might be invalid');
    } else {
      console.log('⚠️ Unexpected response:', response.status);
    }
    
    // Test auth endpoint
    const authResponse = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY || ''}`,
      }
    });
    
    console.log('🔐 Auth endpoint status:', authResponse.status);
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
};

// Auto-run the test
testSupabaseConnection();

export { testSupabaseConnection };