// Test Project Creation and Fetching
const { createClient } = require('@supabase/supabase-js');

// Replace with your actual values
const supabaseUrl = 'https://pgfzweufsurcngnhegvu.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZnp3ZXVmc3VyY25nbmhlZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzNDg3MTgsImV4cCI6MjA0MTkyNDcxOH0.5lrP5UzO9BQIPJ6gWXBYozgjGlXIMU7VhS3-bfJHKUg';

const supabase = createClient(supabaseUrl, anonKey);

async function testProjectOperations() {
  console.log('🚀 Testing Project Creation and Fetching...\n');

  // Test project creation
  const testProject = {
    title: 'Test Project Creation',
    description: 'This is a test project to verify database operations',
    category: 'Technology',
    tags: ['test', 'database', 'verification'],
    status: 'active',
    creator_id: '123e4567-e89b-12d3-a456-426614174000', // dummy UUID
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  console.log('📝 Creating test project...');
  const { data: insertData, error: insertError } = await supabase
    .from('projects')
    .insert(testProject)
    .select()
    .single();

  if (insertError) {
    console.error('❌ Project creation failed:', insertError);
    return;
  }

  console.log('✅ Project created successfully:', insertData.id);

  // Test project fetching
  console.log('\n🔍 Fetching projects...');
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
    console.log(`  - ${project.title} (${project.status})`);
  });
}

async function testIdeaOperations() {
  console.log('\n💡 Testing Idea Creation and Fetching...\n');

  // Test idea creation
  const testIdea = {
    title: 'Test Idea Creation',
    description: 'This is a test idea to verify database operations',
    category: 'Technology',
    tags: ['test', 'database', 'verification'],
    status: 'approved',
    creator_id: '123e4567-e89b-12d3-a456-426614174000' // dummy UUID
  };

  console.log('📝 Creating test idea...');
  const { data: insertData, error: insertError } = await supabase
    .from('ideas')
    .insert(testIdea)
    .select()
    .single();

  if (insertError) {
    console.error('❌ Idea creation failed:', insertError);
    return;
  }

  console.log('✅ Idea created successfully:', insertData.id);

  // Test idea fetching
  console.log('\n🔍 Fetching ideas...');
  const { data: fetchData, error: fetchError } = await supabase
    .from('ideas')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(5);

  if (fetchError) {
    console.error('❌ Idea fetching failed:', fetchError);
    return;
  }

  console.log('✅ Fetched ideas:', fetchData.length);
  fetchData.forEach(idea => {
    console.log(`  - ${idea.title} (${idea.status})`);
  });
}

async function main() {
  try {
    await testProjectOperations();
    await testIdeaOperations();
    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

main();