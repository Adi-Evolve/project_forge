// Test Centralized Project Creation
const { createClient } = require('@supabase/supabase-js');

// Replace with your actual values
const supabaseUrl = 'https://pgfzweufsurcngnhegvu.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZnp3ZXVmc3VyY25nbmhlZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzNDg3MTgsImV4cCI6MjA0MTkyNDcxOH0.5lrP5UzO9BQIPJ6gWXBYozgjGlXIMU7VhS3-bfJHKUg';

const supabase = createClient(supabaseUrl, anonKey);

async function testCentralizedProjectCreation() {
  console.log('🚀 Testing Centralized Project Creation...\n');

  // Test project creation with centralized schema
  const testProject = {
    title: 'Centralized Test Project',
    description: 'This is a test project for the centralized database schema',
    summary: 'A test project to verify centralized operations work correctly',
    category: 'Technology',
    tags: ['test', 'centralized', 'database'],
    status: 'active',
    approval_status: 'pending',
    creator_id: '123e4567-e89b-12d3-a456-426614174000', // dummy UUID
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    featured: false,
    views: 0,
    likes: 0,
    comment_count: 0,
    share_count: 0,
    bookmark_count: 0
  };

  console.log('📝 Creating centralized test project...');
  const { data: insertData, error: insertError } = await supabase
    .from('projects')
    .insert(testProject)
    .select()
    .single();

  if (insertError) {
    console.error('❌ Centralized project creation failed:', insertError);
    return;
  }

  console.log('✅ Centralized project created successfully:', insertData.id);

  // Test project fetching
  console.log('\n🔍 Fetching centralized projects...');
  const { data: fetchData, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (fetchError) {
    console.error('❌ Project fetching failed:', fetchError);
    return;
  }

  console.log('✅ Fetched projects:', fetchData.length);
  fetchData.forEach(project => {
    console.log(`  - ${project.title} (${project.status}) - Created: ${project.created_at}`);
  });

  console.log('\n🎉 Centralized project operations working correctly!');
}

testCentralizedProjectCreation();