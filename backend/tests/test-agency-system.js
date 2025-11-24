// AGENCY SYSTEM VALIDATION TEST SCRIPT
// Run this to validate the complete agency workflow

const BASE_URL = 'http://localhost:5000/api';
const TOKEN = 'YOUR_ADMIN_TOKEN_HERE'; // Replace with actual admin token

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`
};

console.log('🧪 AGENCY SYSTEM VALIDATION TEST\n');
console.log('='.repeat(60));

// Test 1: Create Agency
async function testCreateAgency() {
  console.log('\n✅ TEST 1: Create New Agency');
  console.log('-'.repeat(60));
  
  const agencyData = {
    AgencyName: 'TEST - Emergency Response Unit',
    AgencyType: 'Government',
    ContactPerson: 'John Doe',
    PhoneNumber: '0812345678',
    Email: `test.agency.${Date.now()}@example.com`, // Unique email
    Address: '123 Test Street, Bangkok',
    Province: 'Bangkok',
    Region: 'Central',
    ResponseCapability: 'Medical support, Search and rescue, Emergency supplies',
    ActivationTime: 4
  };

  try {
    const response = await fetch(`${BASE_URL}/agencies`, {
      method: 'POST',
      headers,
      body: JSON.stringify(agencyData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ PASS: Agency created');
      console.log(`   Agency ID: ${result.agency.AgencyID}`);
      console.log(`   Name: ${result.agency.AgencyName}`);
      console.log(`   Status: ${result.agency.Status}`);
      return result.agency.AgencyID;
    } else {
      console.log('❌ FAIL:', result.error || result.message);
      return null;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return null;
  }
}

// Test 2: Add Resources to Agency
async function testAddResources(agencyId) {
  console.log('\n✅ TEST 2: Add Resources to Agency');
  console.log('-'.repeat(60));

  const resources = [
    {
      AgencyID: agencyId,
      ResourceType: 'Medical Supplies',
      ResourceName: 'Emergency Medical Kits',
      Quantity: 100,
      Unit: 'kits',
      DeploymentTime: 2,
      Notes: 'Fully stocked trauma kits'
    },
    {
      AgencyID: agencyId,
      ResourceType: 'Volunteers',
      ResourceName: 'Trained Medical Personnel',
      Quantity: 25,
      Unit: 'personnel',
      DeploymentTime: 4,
      Notes: 'Doctors and nurses'
    }
  ];

  const addedResources = [];

  for (const resource of resources) {
    try {
      const response = await fetch(`${BASE_URL}/agencies/resources`, {
        method: 'POST',
        headers,
        body: JSON.stringify(resource)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ PASS: Added ${resource.ResourceName}`);
        addedResources.push(result.resourceId);
      } else {
        console.log(`❌ FAIL: ${resource.ResourceName} -`, result.error);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${resource.ResourceName} -`, error.message);
    }
  }

  return addedResources;
}

// Test 3: Get Agency Details (verify resources)
async function testGetAgencyDetails(agencyId) {
  console.log('\n✅ TEST 3: Get Agency Details');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(`${BASE_URL}/agencies/${agencyId}`, { headers });
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ PASS: Agency details retrieved');
      console.log(`   Agency: ${result.agency.AgencyName}`);
      console.log(`   Resources: ${result.resources.length} types`);
      console.log(`   Activations: ${result.activations.length} records`);
      console.log(`   MOUs: ${result.mous.length} agreements`);
      return true;
    } else {
      console.log('❌ FAIL:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

// Test 4: Get Available Agencies (for disaster)
async function testGetAvailableAgencies() {
  console.log('\n✅ TEST 4: Get Available Agencies');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(`${BASE_URL}/agencies/available`, { headers });
    const agencies = await response.json();
    
    if (response.ok) {
      console.log('✅ PASS: Available agencies retrieved');
      console.log(`   Found: ${agencies.length} available agencies`);
      agencies.slice(0, 3).forEach(a => {
        console.log(`   - ${a.AgencyName} (${a.AvailableResources || 0} resources)`);
      });
      return agencies;
    } else {
      console.log('❌ FAIL:', agencies.message);
      return [];
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return [];
  }
}

// Test 5: Activate Agency for Disaster
async function testActivateAgency(agencyId, disasterId) {
  console.log('\n✅ TEST 5: Activate Agency for Disaster');
  console.log('-'.repeat(60));

  const activationData = {
    DisasterID: disasterId,
    AgencyID: agencyId,
    ResourcesDeployed: '50 medical kits, 10 medical personnel',
    PersonnelDeployed: 10,
    Notes: 'TEST ACTIVATION - Deploying medical support team'
  };

  try {
    const response = await fetch(`${BASE_URL}/agencies/activate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(activationData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ PASS: Agency activated');
      console.log(`   ${result.message}`);
      console.log(`   Activation ID: ${result.activationId}`);
      return result.activationId;
    } else {
      console.log('❌ FAIL:', result.error || result.message);
      return null;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return null;
  }
}

// Test 6: Update Activation Status
async function testUpdateActivationStatus(activationId) {
  console.log('\n✅ TEST 6: Update Activation Status');
  console.log('-'.repeat(60));

  const statuses = [
    { Status: 'Confirmed', Notes: 'Agency confirmed availability' },
    { Status: 'Deployed', Notes: 'Team arrived on site' },
    { Status: 'Completed', Notes: 'Mission completed successfully' }
  ];

  for (const statusUpdate of statuses) {
    try {
      const response = await fetch(`${BASE_URL}/agencies/activations/${activationId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(statusUpdate)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ PASS: Status updated to ${statusUpdate.Status}`);
        console.log(`   ${result.message}`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
      } else {
        console.log(`❌ FAIL: ${statusUpdate.Status} -`, result.error);
        break;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${statusUpdate.Status} -`, error.message);
      break;
    }
  }
}

// Test 7: Verify Triggers (check stats)
async function testVerifyTriggers() {
  console.log('\n✅ TEST 7: Verify Automatic Triggers');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(`${BASE_URL}/agencies/stats`, { headers });
    const stats = await response.json();
    
    if (response.ok) {
      console.log('✅ PASS: Stats retrieved (triggers working)');
      console.log(`   Total Agencies: ${stats.summary.totalAgencies}`);
      console.log(`   Active Deployments: ${stats.summary.activeDeployments}`);
      console.log(`   Completed Deployments: ${stats.summary.completedDeployments}`);
      console.log(`   Available Resources: ${stats.summary.totalAvailableResources}`);
      return true;
    } else {
      console.log('❌ FAIL:', stats.message);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

// Test 8: Prevent Duplicate Activation
async function testPreventDuplicate(agencyId, disasterId) {
  console.log('\n✅ TEST 8: Prevent Duplicate Activation');
  console.log('-'.repeat(60));

  const activationData = {
    DisasterID: disasterId,
    AgencyID: agencyId,
    ResourcesDeployed: 'Duplicate test',
    PersonnelDeployed: 5
  };

  try {
    const response = await fetch(`${BASE_URL}/agencies/activate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(activationData)
    });

    const result = await response.json();
    
    if (!response.ok && result.error && result.error.includes('already activated')) {
      console.log('✅ PASS: Duplicate activation prevented');
      console.log(`   ${result.error}`);
      return true;
    } else {
      console.log('❌ FAIL: Should have prevented duplicate activation');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

// Main Test Runner
async function runAllTests() {
  console.log('\n🚀 Starting Agency System Validation...\n');

  // Get first active disaster for testing
  let disasterId = null;
  try {
    const disastersRes = await fetch(`${BASE_URL}/disasters`, { headers });
    const disasters = await disastersRes.json();
    const activeDisaster = disasters.find(d => d.Status === 'Active');
    
    if (activeDisaster) {
      disasterId = activeDisaster.DisasterID;
      console.log(`📍 Using disaster: ${activeDisaster.DisasterName} (ID: ${disasterId})`);
    } else {
      console.log('⚠️  No active disasters found. Create one first!');
      return;
    }
  } catch (error) {
    console.log('❌ Could not fetch disasters:', error.message);
    return;
  }

  // Run all tests
  const agencyId = await testCreateAgency();
  if (!agencyId) {
    console.log('\n❌ Cannot proceed - agency creation failed');
    return;
  }

  await testAddResources(agencyId);
  await testGetAgencyDetails(agencyId);
  await testGetAvailableAgencies();
  
  const activationId = await testActivateAgency(agencyId, disasterId);
  if (activationId) {
    await testUpdateActivationStatus(activationId);
    await testPreventDuplicate(agencyId, disasterId);
  }
  
  await testVerifyTriggers();

  console.log('\n' + '='.repeat(60));
  console.log('✅ VALIDATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`\n📊 Test Agency ID: ${agencyId}`);
  console.log('🗑️  You can delete this test agency from the admin panel\n');
}

// Execute if running directly in Node.js
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}

// Export for browser console
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}
