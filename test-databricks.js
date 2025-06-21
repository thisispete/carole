/**
 * Test script for Databricks AI integration
 * Run with: node test-databricks.js
 */

import { databricksService } from './src/lib/databricksService.ts';

async function testDatabricksIntegration() {
  console.log('🧪 Testing Databricks AI Integration...\n');

  try {
    // Test 1: Initialize service
    console.log('1️⃣ Testing service initialization...');
    const initialized = await databricksService.initialize();
    console.log(`   Result: ${initialized ? '✅ Success' : '❌ Failed'}\n`);

    // Test 2: List models
    console.log('2️⃣ Testing model listing...');
    const modelsResult = await databricksService.listModels();
    if (modelsResult.success && modelsResult.models) {
      console.log('   ✅ Available models:');
      modelsResult.models.forEach(model => {
        console.log(`      - ${model.displayName} (${model.name}) ${model.recommended ? '⭐' : ''}`);
      });
    } else {
      console.log(`   ❌ Failed: ${modelsResult.error}`);
    }
    console.log('');

    // Test 3: Send test message
    console.log('3️⃣ Testing AI chat...');
    const chatResult = await databricksService.sendMessage(
      'Hello! Can you help me understand how to prioritize my tasks?'
    );
    if (chatResult.success) {
      console.log('   ✅ AI Response:');
      console.log(`      "${chatResult.response}"`);
      console.log(`   📊 Tokens: ${chatResult.usage?.total_tokens || 0}`);
    } else {
      console.log(`   ❌ Failed: ${chatResult.error}`);
    }
    console.log('');

    // Test 4: Priority suggestions
    console.log('4️⃣ Testing priority suggestions...');
    const mockTasks = [
      { id: '1', title: 'Set up database schema', priority: 8, status: 'done' },
      { id: '2', title: 'Build task CRUD interface', priority: 9, status: 'in_progress' },
      { id: '3', title: 'Integrate AI chat functionality', priority: 6, status: 'todo' },
      { id: '4', title: 'Design priority algorithm', priority: 7, status: 'backlog' }
    ];

    const priorityResult = await databricksService.getPrioritySuggestions(mockTasks);
    if (priorityResult.success) {
      console.log('   ✅ Priority suggestions:');
      console.log(`      "${priorityResult.response}"`);
    } else {
      console.log(`   ❌ Failed: ${priorityResult.error}`);
    }
    console.log('');

    // Test 5: Task creation from text
    console.log('5️⃣ Testing natural language task creation...');
    const taskResult = await databricksService.createTaskFromText(
      'I need to update the company website with new pricing information by Friday'
    );
    if (taskResult.success) {
      console.log('   ✅ Task creation response:');
      console.log(`      "${taskResult.response}"`);
    } else {
      console.log(`   ❌ Failed: ${taskResult.error}`);
    }

    console.log('\n🎉 Databricks AI integration test complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run "npm run dev" to start the development server');
    console.log('   2. Open http://localhost:5173 in your browser');
    console.log('   3. Test the chat interface in the Carole dashboard');
    console.log('   4. Try the "Get Priority Suggestions" button');
    console.log('\n💡 Note: Currently in development mode with simulated responses.');
    console.log('   In Block\'s production environment, this would connect to real Databricks endpoints.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Make sure you\'re running this in a Node.js environment that supports ES modules');
    console.log('   - Check that all dependencies are installed (npm install)');
    console.log('   - Verify the TypeScript files are properly compiled');
  }
}

// Run the test
testDatabricksIntegration(); 