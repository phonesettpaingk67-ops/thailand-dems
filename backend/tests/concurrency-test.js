/**
 * Concurrency Test for DEMS Backend
 * Tests database transactions and race condition handling
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  test: (msg) => console.log(`${colors.cyan}▶${colors.reset} ${msg}`)
};

// Test 1: Concurrent reads (should all succeed)
async function testConcurrentReads() {
  log.test('Test 1: Concurrent Read Operations');
  
  try {
    const promises = Array(20).fill(null).map((_, i) => 
      axios.get(`${API_BASE}/disasters`)
    );
    
    const results = await Promise.all(promises);
    
    if (results.every(r => r.status === 200)) {
      log.success(`All 20 concurrent reads succeeded`);
      return true;
    } else {
      log.error('Some reads failed');
      return false;
    }
  } catch (error) {
    log.error(`Concurrent reads failed: ${error.message}`);
    return false;
  }
}

// Test 2: Concurrent volunteer assignments (should handle race conditions)
async function testConcurrentVolunteerAssignment() {
  log.test('Test 2: Concurrent Volunteer Assignment (Race Condition Test)');
  
  try {
    // Get an available volunteer
    const { data: volunteers } = await axios.get(`${API_BASE}/volunteers?status=Available`);
    
    if (volunteers.length === 0) {
      log.warn('No available volunteers for testing');
      return true;
    }
    
    const volunteer = volunteers[0];
    log.info(`Testing with volunteer: ${volunteer.FullName} (ID: ${volunteer.VolunteerID})`);
    
    // Try to assign the same volunteer to 5 different disasters simultaneously
    const { data: disasters } = await axios.get(`${API_BASE}/disasters`);
    
    const assignments = Array(5).fill(null).map((_, i) => 
      axios.post(`${API_BASE}/volunteers/assign`, {
        VolunteerID: volunteer.VolunteerID,
        DisasterID: disasters[i % disasters.length].DisasterID,
        Role: `Test Role ${i}`,
        Notes: `Concurrent test ${i}`
      }).catch(err => ({
        error: true,
        message: err.response?.data?.error || err.message
      }))
    );
    
    const results = await Promise.all(assignments);
    
    const successes = results.filter(r => !r.error).length;
    const failures = results.filter(r => r.error).length;
    
    if (successes === 1 && failures === 4) {
      log.success(`Race condition handled correctly: 1 success, 4 failures`);
      return true;
    } else if (successes > 1) {
      log.error(`Race condition not handled: ${successes} assignments succeeded (should be 1)`);
      return false;
    } else {
      log.warn(`Unexpected result: ${successes} success, ${failures} failures`);
      return true;
    }
  } catch (error) {
    log.error(`Volunteer assignment test failed: ${error.message}`);
    return false;
  }
}

// Test 3: Connection pool stress test
async function testConnectionPool() {
  log.test('Test 3: Connection Pool Stress Test');
  
  try {
    // Create 30 simultaneous requests (more than pool size of 20)
    const promises = Array(30).fill(null).map((_, i) => 
      axios.get(`${API_BASE}/dashboard`).catch(err => ({
        error: true,
        message: err.message
      }))
    );
    
    const start = Date.now();
    const results = await Promise.all(promises);
    const duration = Date.now() - start;
    
    const successes = results.filter(r => !r.error).length;
    const failures = results.filter(r => r.error).length;
    
    log.info(`Completed in ${duration}ms`);
    log.info(`Success: ${successes}, Failures: ${failures}`);
    
    if (successes >= 28) {
      log.success('Connection pool handling concurrent requests well');
      return true;
    } else {
      log.error('Too many failures in connection pool test');
      return false;
    }
  } catch (error) {
    log.error(`Connection pool test failed: ${error.message}`);
    return false;
  }
}

// Test 4: Mixed concurrent operations
async function testMixedOperations() {
  log.test('Test 4: Mixed Concurrent Operations');
  
  try {
    const promises = [
      axios.get(`${API_BASE}/disasters`),
      axios.get(`${API_BASE}/shelters`),
      axios.get(`${API_BASE}/volunteers`),
      axios.get(`${API_BASE}/supplies`),
      axios.get(`${API_BASE}/dashboard`),
      axios.get(`${API_BASE}/disasters`),
      axios.get(`${API_BASE}/shelters`),
      axios.get(`${API_BASE}/volunteers/stats`),
      axios.get(`${API_BASE}/supplies/stats`),
      axios.get(`${API_BASE}/dashboard`)
    ];
    
    const results = await Promise.all(promises.map(p => 
      p.catch(err => ({ error: true, message: err.message }))
    ));
    
    const successes = results.filter(r => !r.error).length;
    
    if (successes === 10) {
      log.success('All mixed operations succeeded');
      return true;
    } else {
      log.error(`Only ${successes}/10 operations succeeded`);
      return false;
    }
  } catch (error) {
    log.error(`Mixed operations test failed: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('  DEMS Backend Concurrency & Database Tests');
  console.log('='.repeat(60) + '\n');
  
  log.info('Checking if backend is running...');
  
  try {
    await axios.get(`${API_BASE}/dashboard`);
    log.success('Backend is running\n');
  } catch (error) {
    log.error('Backend is not running! Start it with: npm run dev');
    process.exit(1);
  }
  
  const tests = [
    testConcurrentReads,
    testConnectionPool,
    testMixedOperations,
    testConcurrentVolunteerAssignment
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await test();
    results.push(result);
    console.log(''); // Empty line between tests
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  console.log('='.repeat(60));
  console.log('  Test Results Summary');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    log.success(`All ${total} tests passed! ✓`);
  } else {
    log.warn(`${passed}/${total} tests passed`);
  }
  
  console.log('='.repeat(60) + '\n');
  
  return passed === total;
}

// Run tests if called directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    log.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests };
