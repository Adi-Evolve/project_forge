// Test environment variables loading
require('dotenv').config();

console.log('Testing environment variables...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

// Check if .env file exists and is readable
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\n.env file found and readable');
  console.log('Contains REACT_APP_SUPABASE_URL:', envContent.includes('REACT_APP_SUPABASE_URL'));
  
  // Extract the URL from .env file
  const urlMatch = envContent.match(/REACT_APP_SUPABASE_URL=(.+)/);
  if (urlMatch) {
    console.log('URL in .env file:', urlMatch[1]);
  }
} catch (error) {
  console.error('Error reading .env file:', error.message);
}