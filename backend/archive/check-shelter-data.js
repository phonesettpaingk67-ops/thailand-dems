const mysql = require('mysql2/promise');

async function checkShelterData() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Aiismylife_8013',
      database: 'disaster_management_db'
    });

    console.log('🏠 Checking Shelter Data...\n');

    // Get all shelters
    const [shelters] = await connection.execute(`
      SELECT 
        ShelterID,
        ShelterName,
        ShelterType,
        City,
        Capacity,
        CurrentOccupancy,
        Status,
        (Capacity - CurrentOccupancy) as AvailableSpace
      FROM Shelters
      ORDER BY ShelterID
    `);

    console.log('📊 Individual Shelters:');
    shelters.forEach(s => {
      console.log(`   ${s.ShelterName} (${s.City})`);
      console.log(`      Type: ${s.ShelterType}`);
      console.log(`      Capacity: ${s.Capacity} | Occupancy: ${s.CurrentOccupancy} | Available: ${s.AvailableSpace}`);
      console.log(`      Status: ${s.Status}\n`);
    });

    // Get dashboard stats
    const [[stats]] = await connection.execute(`
      SELECT 
        COUNT(*) as totalShelters,
        SUM(Capacity) as totalCapacity,
        SUM(CurrentOccupancy) as totalOccupancy,
        SUM(Capacity - CurrentOccupancy) as availableSpace,
        SUM(CASE WHEN Status = 'Available' THEN 1 ELSE 0 END) as availableShelters,
        SUM(CASE WHEN Status = 'Full' THEN 1 ELSE 0 END) as fullShelters
      FROM Shelters
    `);

    console.log('\n📈 Dashboard Summary:');
    console.log(`   Total Shelters: ${stats.totalShelters}`);
    console.log(`   Total Capacity: ${stats.totalCapacity.toLocaleString()}`);
    console.log(`   Current Occupancy: ${stats.totalOccupancy.toLocaleString()}`);
    console.log(`   Available Space: ${stats.availableSpace.toLocaleString()}`);
    console.log(`   Available Shelters: ${stats.availableShelters}`);
    console.log(`   Full Shelters: ${stats.fullShelters}`);

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkShelterData();
