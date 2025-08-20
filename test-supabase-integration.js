const { SupabaseService } = require('./src/services/supabase');

async function testSupabaseIntegration() {
  console.log('🧪 Testing Supabase Integration...\n');

  try {
    // Test 1: Send URL for processing
    console.log('1. Testing URL submission...');
    const taskId = await SupabaseService.sendUrlForProcessing(
      'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      'en'
    );
    console.log('✅ Task created:', taskId);

    // Test 2: Poll for completion (with timeout)
    console.log('\n2. Testing task polling...');
    const maxWaitTime = 30000; // 30 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const task = await SupabaseService.pollTaskCompletion(taskId);
        console.log('✅ Task completed:', task.status);
        
        if (task.captions) {
          console.log('📝 Captions received:', task.captions.length);
        }
        break;
      } catch (error) {
        if (error.message.includes('Processing failed')) {
          console.log('❌ Task failed:', error.message);
          break;
        }
        // Continue polling
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Test 3: Get recent tasks
    console.log('\n3. Testing recent tasks...');
    const recentTasks = await SupabaseService.getRecentTasks();
    console.log('✅ Recent tasks:', recentTasks.length);

    console.log('\n🎉 Supabase integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSupabaseIntegration();
