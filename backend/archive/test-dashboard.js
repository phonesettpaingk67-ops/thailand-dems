const db = require('./db/connection');

async function testDashboard() {
    try {
        console.log('Testing dashboard queries...\n');
        
        // Check if PartnerFacilities exists
        console.log('1. Checking PartnerFacilities table...');
        try {
            const [[pfCount]] = await db.query(`SELECT COUNT(*) as count FROM PartnerFacilities`);
            console.log('✅ PartnerFacilities exists:', pfCount.count, 'records');
        } catch (err) {
            console.log('❌ PartnerFacilities does not exist:', err.message);
        }
        
        // Test shelters query
        console.log('\n2. Testing Shelters query...');
        const [[shelterStats]] = await db.query(`
            SELECT 
                COUNT(*) as totalShelters,
                SUM(Capacity) as totalCapacity,
                SUM(CurrentOccupancy) as totalOccupancy
            FROM Shelters
        `);
        console.log('✅ Shelters:', shelterStats);
        
        // Test volunteers query
        console.log('\n3. Testing Volunteers query...');
        const [[volunteerStats]] = await db.query(`
            SELECT 
                COUNT(*) as totalVolunteers,
                SUM(CASE WHEN AvailabilityStatus = 'Available' THEN 1 ELSE 0 END) as availableVolunteers
            FROM Volunteers
        `);
        console.log('✅ Volunteers:', volunteerStats);
        
        console.log('\n✅ All queries successful!');
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testDashboard();
