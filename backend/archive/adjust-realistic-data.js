const mysql = require('mysql2/promise');

async function adjustData() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Aiismylife_8013',
      database: 'disaster_management_db'
    });

    console.log('⏱️  Adjusting volunteer hours to realistic values...');
    // Set volunteer hours to realistic values (between 5-500 hours)
    await connection.execute(`
      UPDATE Volunteers 
      SET TotalHoursContributed = FLOOR(5 + (RAND() * 495))
      WHERE TotalHoursContributed > 500
    `);
    
    // Keep reasonable hours for those under 500
    await connection.execute(`
      UPDATE Volunteers 
      SET TotalHoursContributed = FLOOR(10 + (RAND() * 200))
      WHERE TotalHoursContributed < 10 OR TotalHoursContributed = 0
    `);

    console.log('🏠 Increasing shelter capacities...');
    // Increase shelter capacities for larger shelters
    await connection.execute(`
      UPDATE Shelters 
      SET Capacity = CASE 
        WHEN ShelterType = 'Emergency Shelter' THEN FLOOR(Capacity * 2.5)
        WHEN ShelterType = 'Community Center' THEN FLOOR(Capacity * 3)
        WHEN ShelterType = 'School' THEN FLOOR(Capacity * 2)
        WHEN ShelterType = 'Sports Complex' THEN FLOOR(Capacity * 3.5)
        WHEN ShelterType = 'Gymnasium' THEN FLOOR(Capacity * 2.8)
        ELSE FLOOR(Capacity * 2)
      END
      WHERE Capacity < 500
    `);

    // Get updated stats
    const [volunteers] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        MIN(TotalHoursContributed) as minHours,
        MAX(TotalHoursContributed) as maxHours,
        AVG(TotalHoursContributed) as avgHours
      FROM Volunteers
    `);

    const [shelters] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(Capacity) as totalCapacity,
        SUM(CurrentOccupancy) as totalOccupancy,
        MIN(Capacity) as minCapacity,
        MAX(Capacity) as maxCapacity
      FROM Shelters
    `);

    console.log('\n✅ Adjustments Complete!');
    console.log('\n📊 Volunteer Stats:');
    console.log(`   Total Volunteers: ${volunteers[0].total}`);
    console.log(`   Hours Range: ${volunteers[0].minHours} - ${volunteers[0].maxHours} hours`);
    console.log(`   Average Hours: ${Math.round(volunteers[0].avgHours)} hours`);
    
    console.log('\n🏠 Shelter Stats:');
    console.log(`   Total Shelters: ${shelters[0].total}`);
    console.log(`   Total Capacity: ${shelters[0].totalCapacity.toLocaleString()}`);
    console.log(`   Current Occupancy: ${shelters[0].totalOccupancy.toLocaleString()}`);
    console.log(`   Capacity Range: ${shelters[0].minCapacity} - ${shelters[0].maxCapacity}`);

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

adjustData();
