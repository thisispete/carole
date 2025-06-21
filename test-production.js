/**
 * Production Databricks Connection Test
 * Set environment to production and test real connections
 */

// Set production environment
process.env.VITE_DATABRICKS_ENV = 'production';
process.env.VITE_DATABRICKS_HOST = process.env.VITE_DATABRICKS_HOST || 'https://your-databricks-workspace.cloud.databricks.com';

import { databricksService } from './src/lib/databricksService.ts';

async function testProductionConnection() {
  console.log('🏢 Testing Production Databricks Connection...\n');
  console.log('🔧 Environment Variables:');
  console.log(`   VITE_DATABRICKS_ENV: ${process.env.VITE_DATABRICKS_ENV}`);
  console.log(`   VITE_DATABRICKS_HOST: ${process.env.VITE_DATABRICKS_HOST}\n`);

  try {
    // Test 1: Initialize service
    console.log('1️⃣ Testing production service initialization...');
    const initialized = await databricksService.initialize();
    console.log(`   Result: ${initialized ? '✅ Success' : '❌ Failed'}\n`);

    if (!initialized) {
      console.log('❌ Cannot proceed without successful initialization');
      return;
    }

    // Test 2: Test connection
    console.log('2️⃣ Testing Databricks connection...');
    const connectionResult = await databricksService.testConnection();
    if (connectionResult.success) {
      console.log('   ✅ Connection successful');
      console.log(`   📝 Message: ${connectionResult.message}`);
    } else {
      console.log('   ❌ Connection failed');
      console.log(`   📝 Error: ${connectionResult.error}`);
    }
    console.log('');

    // Test 3: List models
    console.log('3️⃣ Testing model listing...');
    const modelsResult = await databricksService.listModels();
    if (modelsResult.success && modelsResult.models) {
      console.log('   ✅ Models loaded successfully:');
      modelsResult.models.forEach(model => {
        console.log(`      - ${model.displayName} (${model.name}) ${model.recommended ? '⭐' : ''}`);
        console.log(`        ${model.description}`);
      });
    } else {
      console.log(`   ❌ Failed to load models: ${modelsResult.error}`);
    }
    console.log('');

    // Test 4: Send test message
    console.log('4️⃣ Testing AI chat with Claude 3.5 Sonnet...');
    const chatResult = await databricksService.sendMessage(
      'Hello! This is a test message to verify the production Databricks connection is working.',
      [],
      'claude-3-5-sonnet'
    );
    
    if (chatResult.success) {
      console.log('   ✅ AI Response received:');
      console.log(`      "${chatResult.response}"`);
      console.log(`   📊 Usage: ${JSON.stringify(chatResult.usage, null, 2)}`);
    } else {
      console.log(`   ❌ Chat failed: ${chatResult.error}`);
    }

    console.log('\n🎉 Production connection test complete!');
    
  } catch (error) {
    console.error('❌ Production test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure you\'re connected to Block\'s network');
    console.log('   2. Verify you\'re logged into Block SSO (try visiting go/databricks)');
    console.log('   3. Check that VITE_DATABRICKS_HOST is set to the correct workspace URL');
    console.log('   4. Ensure your account has access to Databricks serving endpoints');
  }
}

// Run the production test
testProductionConnection(); 