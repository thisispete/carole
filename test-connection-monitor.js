#!/usr/bin/env node

/**
 * Databricks Connection Monitor
 * Tests connection reliability and logs response times
 */

const token = process.env.VITE_DATABRICKS_TOKEN;
const host = process.env.VITE_DATABRICKS_HOST || 'https://block-lakehouse-production.cloud.databricks.com';

if (!token) {
  console.error('❌ VITE_DATABRICKS_TOKEN environment variable is required');
  console.log('💡 Set it in your .env.local file or run with: VITE_DATABRICKS_TOKEN=your_token node test-connection-monitor.js');
  process.exit(1);
}

async function testConnection() {
  const testMessage = {
    messages: [{ role: "user", content: "test" }],
    max_tokens: 10,
    temperature: 0.1,
  };

  const startTime = Date.now();
  
  try {
    const response = await fetch(
      `${host}/serving-endpoints/claude-3-5-sonnet/invocations`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testMessage),
      }
    );

    const responseTime = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    if (response.ok) {
      console.log(`${timestamp} ✅ SUCCESS (${responseTime}ms) - Status: ${response.status}`);
      return { success: true, responseTime, status: response.status };
    } else {
      const errorText = await response.text();
      console.log(`${timestamp} ❌ FAILED (${responseTime}ms) - Status: ${response.status} - ${errorText.slice(0, 100)}`);
      return { success: false, responseTime, status: response.status, error: errorText };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} 💥 ERROR (${responseTime}ms) - ${error.message}`);
    return { success: false, responseTime, error: error.message };
  }
}

async function runMonitor(iterations = 10, delayMs = 2000) {
  console.log(`🔍 Starting Databricks connection monitor...`);
  console.log(`📊 Testing ${iterations} times with ${delayMs}ms intervals`);
  console.log(`🔗 Host: ${host}`);
  console.log(`🔑 Token: ${token.slice(0, 20)}...${token.slice(-4)}`);
  console.log('');

  const results = [];
  
  for (let i = 1; i <= iterations; i++) {
    console.log(`Test ${i}/${iterations}:`);
    const result = await testConnection();
    results.push(result);
    
    if (i < iterations) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // Summary
  console.log('\n📊 SUMMARY:');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length} (${Math.round(successful.length/results.length*100)}%)`);
  console.log(`❌ Failed: ${failed.length}/${results.length} (${Math.round(failed.length/results.length*100)}%)`);
  
  if (successful.length > 0) {
    const avgResponseTime = successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length;
    const minResponseTime = Math.min(...successful.map(r => r.responseTime));
    const maxResponseTime = Math.max(...successful.map(r => r.responseTime));
    
    console.log(`⚡ Avg Response Time: ${Math.round(avgResponseTime)}ms`);
    console.log(`📈 Min/Max: ${minResponseTime}ms / ${maxResponseTime}ms`);
  }
  
  // Error breakdown
  if (failed.length > 0) {
    console.log('\n❌ ERRORS:');
    const errorCounts = {};
    failed.forEach(r => {
      const key = r.status ? `HTTP ${r.status}` : 'Network Error';
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });
    
    Object.entries(errorCounts).forEach(([error, count]) => {
      console.log(`  ${error}: ${count} times`);
    });
  }
}

// Run the monitor
const iterations = process.argv[2] ? parseInt(process.argv[2]) : 10;
const delay = process.argv[3] ? parseInt(process.argv[3]) : 2000;

runMonitor(iterations, delay).catch(console.error); 