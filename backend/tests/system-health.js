const db = require('../db/connection');

/**
 * Comprehensive System Health Check
 * Validates all critical database tables, triggers, and data integrity
 */

async function checkSystemHealth() {
  console.log('🏥 Starting System Health Check...\n');
  
  const results = {
    passed: [],
    warnings: [],
    failed: []
  };

  try {
    // 1. Check Database Connection
    console.log('1️⃣  Checking database connection...');
    await db.query('SELECT 1');
    results.passed.push('✅ Database connection successful');

    // 2. Verify All Required Tables Exist
    console.log('2️⃣  Verifying required tables...');
    const requiredTables = [
      'Disasters', 'Shelters', 'ReliefSupplies', 'Volunteers',
      'VolunteerAssignments', 'DisasterShelters', 'SupplyDistributions',
      'Alerts', 'UserReports', 'VolunteerAccounts'
    ];
    
    const [tables] = await db.query('SHOW TABLES');
    const existingTables = tables.map(t => Object.values(t)[0].toLowerCase());
    
    for (const table of requiredTables) {
      if (existingTables.includes(table.toLowerCase())) {
        results.passed.push(`✅ Table ${table} exists`);
      } else {
        results.failed.push(`❌ Missing table: ${table}`);
      }
    }

    // 3. Check Supply Status Triggers
    console.log('3️⃣  Checking triggers...');
    const [triggers] = await db.query('SHOW TRIGGERS');
    const triggerNames = triggers.map(t => t.Trigger);
    
    if (triggerNames.includes('update_supply_status_insert') && 
        triggerNames.includes('update_supply_status_update')) {
      results.passed.push('✅ Supply status triggers exist');
    } else {
      results.warnings.push('⚠️  Supply status triggers missing - auto-status update disabled');
    }

    // 4. Verify Data Integrity
    console.log('4️⃣  Checking data integrity...');
    
    // Check for disasters
    const [[disasterCount]] = await db.query('SELECT COUNT(*) as count FROM Disasters');
    if (disasterCount.count > 0) {
      results.passed.push(`✅ ${disasterCount.count} disasters in database`);
    } else {
      results.warnings.push('⚠️  No disasters found in database');
    }

    // Check for shelters
    const [[shelterCount]] = await db.query('SELECT COUNT(*) as count FROM Shelters');
    if (shelterCount.count > 0) {
      results.passed.push(`✅ ${shelterCount.count} shelters in database`);
    } else {
      results.warnings.push('⚠️  No shelters found in database');
    }

    // Check for volunteers
    const [[volunteerCount]] = await db.query('SELECT COUNT(*) as count FROM Volunteers');
    if (volunteerCount.count > 0) {
      results.passed.push(`✅ ${volunteerCount.count} volunteers registered`);
    } else {
      results.warnings.push('⚠️  No volunteers found in database');
    }

    // Check for supplies
    const [[supplyCount]] = await db.query('SELECT COUNT(*) as count FROM ReliefSupplies');
    if (supplyCount.count > 0) {
      results.passed.push(`✅ ${supplyCount.count} supply types available`);
    } else {
      results.warnings.push('⚠️  No supplies found in database');
    }

    // 5. Validate Foreign Key Constraints
    console.log('5️⃣  Validating foreign key relationships...');
    
    // Check orphaned assignments
    const [orphanedAssignments] = await db.query(`
      SELECT COUNT(*) as count FROM VolunteerAssignments va
      LEFT JOIN Volunteers v ON va.VolunteerID = v.VolunteerID
      WHERE v.VolunteerID IS NULL
    `);
    
    if (orphanedAssignments[0].count === 0) {
      results.passed.push('✅ No orphaned volunteer assignments');
    } else {
      results.failed.push(`❌ ${orphanedAssignments[0].count} orphaned volunteer assignments found`);
    }

    // 6. Check Critical Status Fields
    console.log('6️⃣  Validating status values...');
    
    const [invalidStatuses] = await db.query(`
      SELECT COUNT(*) as count FROM Disasters 
      WHERE Status NOT IN ('Active', 'Contained', 'Recovery', 'Closed')
    `);
    
    if (invalidStatuses[0].count === 0) {
      results.passed.push('✅ All disaster statuses valid');
    } else {
      results.warnings.push(`⚠️  ${invalidStatuses[0].count} disasters with invalid status`);
    }

    // 7. Check Generated Columns
    console.log('7️⃣  Checking computed columns...');
    
    const [supplyWithNullAvailable] = await db.query(`
      SELECT COUNT(*) as count FROM ReliefSupplies 
      WHERE AvailableQuantity IS NULL
    `);
    
    if (supplyWithNullAvailable[0].count === 0) {
      results.passed.push('✅ All supply available quantities calculated');
    } else {
      results.failed.push(`❌ ${supplyWithNullAvailable[0].count} supplies with null available quantity`);
    }

  } catch (error) {
    results.failed.push(`❌ Error during health check: ${error.message}`);
  }

  // Print Results
  console.log('\n' + '='.repeat(60));
  console.log('📊 HEALTH CHECK RESULTS');
  console.log('='.repeat(60) + '\n');

  if (results.passed.length > 0) {
    console.log('✅ PASSED CHECKS:');
    results.passed.forEach(r => console.log('  ' + r));
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    results.warnings.forEach(r => console.log('  ' + r));
    console.log('');
  }

  if (results.failed.length > 0) {
    console.log('❌ FAILED CHECKS:');
    results.failed.forEach(r => console.log('  ' + r));
    console.log('');
  }

  const total = results.passed.length + results.warnings.length + results.failed.length;
  const score = ((results.passed.length / total) * 100).toFixed(1);
  
  console.log('='.repeat(60));
  console.log(`Overall Health Score: ${score}% (${results.passed.length}/${total} checks passed)`);
  console.log('='.repeat(60) + '\n');

  if (results.failed.length === 0) {
    console.log('✅ System is healthy and ready for use!\n');
    process.exit(0);
  } else {
    console.log('⚠️  System has critical issues that need attention.\n');
    process.exit(1);
  }
}

// Run the health check
checkSystemHealth().catch(err => {
  console.error('❌ Health check failed:', err);
  process.exit(1);
});
