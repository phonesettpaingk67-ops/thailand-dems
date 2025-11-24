const db = require('./db/connection');
const fs = require('fs');

async function checkAndCreateTable() {
  try {
    // Check if table exists
    const [tables] = await db.query("SHOW TABLES LIKE 'UserReports'");
    
    if (tables.length === 0) {
      console.log('❌ UserReports table does not exist. Creating it now...');
      
      // Read and execute the SQL file
      const sql = fs.readFileSync('./db/create-user-reports.sql', 'utf8');
      await db.query(sql);
      
      console.log('✅ UserReports table created successfully');
    } else {
      console.log('✅ UserReports table exists');
    }
    
    // Check count
    const [[countResult]] = await db.query('SELECT COUNT(*) as count FROM UserReports');
    console.log(`📊 Total reports in database: ${countResult.count}`);
    
    // Check today's reports
    const [[todayResult]] = await db.query(`
      SELECT COUNT(*) as count 
      FROM UserReports 
      WHERE DATE(ReportedAt) = CURDATE()
    `);
    console.log(`📅 Reports today: ${todayResult.count}`);
    
    // Show recent reports
    const [recentReports] = await db.query(`
      SELECT ReportID, UserName, DisasterType, Severity, ReportedLocation, ReportedAt 
      FROM UserReports 
      ORDER BY ReportedAt DESC 
      LIMIT 5
    `);
    
    if (recentReports.length > 0) {
      console.log('\n📋 Recent reports:');
      recentReports.forEach(r => {
        console.log(`  - ID:${r.ReportID} | ${r.DisasterType} (${r.Severity}) | ${r.UserName} | ${r.ReportedLocation} | ${r.ReportedAt}`);
      });
    } else {
      console.log('\n📋 No reports found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndCreateTable();
