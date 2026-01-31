// Quick terminal test for OAuth flow
const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

// Simple endpoint to receive logs from frontend
app.post('/api/terminal-log', (req, res) => {
  const { message, data, timestamp } = req.body;
  console.log(`[${timestamp}] ${message}`);
  if (data) {
    console.log('Data:', JSON.stringify(data, null, 2));
  }
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`🔍 OAuth Debug Server running on http://localhost:${port}`);
  console.log('📡 Ready to receive OAuth flow logs from frontend...');
  console.log('🚨 REMEMBER: Update your Supabase API keys first!');
});

module.exports = app;