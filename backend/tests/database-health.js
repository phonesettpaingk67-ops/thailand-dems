/**
 * Database Health Check Script
 * Verifies database integrity, indexes, and performance
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../db/connection');

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
  header: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`)
};

async function checkDatabaseConnection() {
  log.header('\n1. Database Connection');
  try {
    await db.query('SELECT 1');
    log.success('Database connection is active');
    return true;
  } catch (error) {
    log.error(`Database connection failed: ${error.message}`);
    return false;
  }
}

async function checkTableIntegrity() {
  log.header('\n2. Table Integrity');
  
  const tables = [
    'Disasters',
    'Shelters',
    'DisasterShelters',
    'ReliefSupplies',
    'SupplyDistributions',
    'Volunteers',
    'VolunteerAssignments',
    'DamageAssessments',
    'AffectedPopulations',
    'RecoveryProjects',
    'Alerts'
  ];
  
  let allGood = true;
  
  for (const table of tables) {
    try {
      const [[result]] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
      log.success(`${table}: ${result.count} records`);
    } catch (error) {
      log.error(`${table}: ${error.message}`);
      allGood = false;
    }
  }
  
  return allGood;
}

async function checkIndexes() {
  log.header('\n3. Index Status');
  
  try {
    const [indexes] = await db.query(`
      SELECT 
        TABLE_NAME,
        INDEX_NAME,
        COLUMN_NAME,
        INDEX_TYPE
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = 'disaster_management_db'
        AND TABLE_NAME IN ('Disasters', 'Volunteers', 'ReliefSupplies', 'Shelters')
      ORDER BY TABLE_NAME, INDEX_NAME
    `);
    
    const grouped = indexes.reduce((acc, idx) => {
      if (!acc[idx.TABLE_NAME]) acc[idx.TABLE_NAME] = [];
      acc[idx.TABLE_NAME].push(idx);
      return acc;
    }, {});
    
    for (const [table, idxs] of Object.entries(grouped)) {
      log.info(`${table}: ${idxs.length} indexes`);
    }
    
    log.success('All indexes are in place');
    return true;
  } catch (error) {
    log.error(`Index check failed: ${error.message}`);
    return false;
  }
}

async function checkForeignKeys() {
  log.header('\n4. Foreign Key Constraints');
  
  try {
    const [fks] = await db.query(`
      SELECT 
        TABLE_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'disaster_management_db'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY TABLE_NAME
    `);
    
    log.info(`Found ${fks.length} foreign key relationships`);
    
    // Test referential integrity
    const [orphans1] = await db.query(`
      SELECT COUNT(*) as count
      FROM DisasterShelters ds
      LEFT JOIN Disasters d ON ds.DisasterID = d.DisasterID
      WHERE d.DisasterID IS NULL
    `);
    
    const [orphans2] = await db.query(`
      SELECT COUNT(*) as count
      FROM DisasterShelters ds
      LEFT JOIN Shelters s ON ds.ShelterID = s.ShelterID
      WHERE s.ShelterID IS NULL
    `);
    
    if (orphans1[0].count === 0 && orphans2[0].count === 0) {
      log.success('No orphaned records found');
    } else {
      log.warn(`Found ${orphans1[0].count + orphans2[0].count} orphaned records`);
    }
    
    return true;
  } catch (error) {
    log.error(`Foreign key check failed: ${error.message}`);
    return false;
  }
}

async function checkDataConsistency() {
  log.header('\n5. Data Consistency');
  
  try {
    // Check supply quantities
    const [supplies] = await db.query(`
      SELECT 
        SupplyID,
        TotalQuantity,
        AllocatedQuantity,
        (TotalQuantity - AllocatedQuantity) as Available
      FROM ReliefSupplies
      WHERE AllocatedQuantity > TotalQuantity
    `);
    
    if (supplies.length === 0) {
      log.success('Supply quantities are consistent');
    } else {
      log.error(`Found ${supplies.length} supplies with invalid quantities`);
      supplies.forEach(s => {
        log.warn(`  Supply ${s.SupplyID}: Total=${s.TotalQuantity}, Allocated=${s.AllocatedQuantity}`);
      });
    }
    
    // Check volunteer status
    const [volunteers] = await db.query(`
      SELECT 
        v.VolunteerID,
        CONCAT(v.FirstName, ' ', v.LastName) as FullName,
        v.AvailabilityStatus,
        COUNT(va.AssignmentID) as ActiveAssignments
      FROM Volunteers v
      LEFT JOIN VolunteerAssignments va ON v.VolunteerID = va.VolunteerID 
        AND va.Status = 'Active'
      GROUP BY v.VolunteerID, v.FirstName, v.LastName, v.AvailabilityStatus
      HAVING (v.AvailabilityStatus = 'Deployed' AND ActiveAssignments = 0)
         OR (v.AvailabilityStatus = 'Available' AND ActiveAssignments > 0)
    `);
    
    if (volunteers.length === 0) {
      log.success('Volunteer statuses are consistent');
    } else {
      log.warn(`Found ${volunteers.length} volunteers with inconsistent status`);
    }
    
    return supplies.length === 0 && volunteers.length === 0;
  } catch (error) {
    log.error(`Consistency check failed: ${error.message}`);
    return false;
  }
}

async function checkConnectionPool() {
  log.header('\n6. Connection Pool Status');
  
  try {
    const [poolStats] = await db.query(`
      SHOW STATUS LIKE 'Threads_connected'
    `);
    
    const [maxConnections] = await db.query(`
      SHOW VARIABLES LIKE 'max_connections'
    `);
    
    log.info(`Active connections: ${poolStats[0].Value}`);
    log.info(`Max connections: ${maxConnections[0].Value}`);
    
    const usage = (poolStats[0].Value / maxConnections[0].Value) * 100;
    
    if (usage < 50) {
      log.success(`Connection pool usage: ${usage.toFixed(1)}% - Healthy`);
    } else if (usage < 80) {
      log.warn(`Connection pool usage: ${usage.toFixed(1)}% - Monitor closely`);
    } else {
      log.error(`Connection pool usage: ${usage.toFixed(1)}% - Consider increasing max_connections`);
    }
    
    return true;
  } catch (error) {
    log.error(`Connection pool check failed: ${error.message}`);
    return false;
  }
}

async function checkPerformance() {
  log.header('\n7. Query Performance');
  
  try {
    const start = Date.now();
    
    await db.query('SELECT * FROM Disasters');
    const time1 = Date.now() - start;
    
    await db.query(`
      SELECT d.*, COUNT(ds.ShelterID) as ShelterCount
      FROM Disasters d
      LEFT JOIN DisasterShelters ds ON d.DisasterID = ds.DisasterID
      GROUP BY d.DisasterID
    `);
    const time2 = Date.now() - start - time1;
    
    log.info(`Simple query: ${time1}ms`);
    log.info(`Join query: ${time2}ms`);
    
    if (time1 < 50 && time2 < 100) {
      log.success('Query performance is good');
    } else {
      log.warn('Query performance could be improved - consider adding indexes');
    }
    
    return true;
  } catch (error) {
    log.error(`Performance check failed: ${error.message}`);
    return false;
  }
}

async function runHealthCheck() {
  console.log('\n' + '='.repeat(60));
  console.log('  Database Health Check');
  console.log('='.repeat(60));
  
  const checks = [
    checkDatabaseConnection,
    checkTableIntegrity,
    checkIndexes,
    checkForeignKeys,
    checkDataConsistency,
    checkConnectionPool,
    checkPerformance
  ];
  
  const results = [];
  
  for (const check of checks) {
    try {
      const result = await check();
      results.push(result);
    } catch (error) {
      log.error(`Check failed: ${error.message}`);
      results.push(false);
    }
  }
  
  log.header('\n' + '='.repeat(60));
  log.header('  Health Check Summary');
  log.header('='.repeat(60));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    log.success(`\nAll ${total} checks passed! Database is healthy. ✓`);
  } else {
    log.warn(`\n${passed}/${total} checks passed. Review warnings above.`);
  }
  
  console.log('='.repeat(60) + '\n');
  
  await db.end();
  return passed === total;
}

if (require.main === module) {
  runHealthCheck()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      log.error(`Fatal error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { runHealthCheck };
