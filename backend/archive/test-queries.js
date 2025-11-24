const db = require('./db/connection');

async function testQueries() {
    try {
        console.log('1. Testing Disasters...');
        const [[disasterStats]] = await db.query(`
            SELECT 
                COUNT(*) as totalDisasters,
                SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) as activeDisasters
            FROM Disasters
        `);
        console.log('✅', disasterStats);
        
        console.log('\n2. Testing Shelters...');
        const [[shelterStats]] = await db.query(`
            SELECT 
                COUNT(*) as totalShelters,
                SUM(Capacity) as totalCapacity
            FROM Shelters
        `);
        console.log('✅', shelterStats);
        
        console.log('\n3. Testing Volunteers...');
        const [[volunteerStats]] = await db.query(`
            SELECT 
                COUNT(*) as totalVolunteers
            FROM Volunteers
        `);
        console.log('✅', volunteerStats);
        
        console.log('\n4. Testing ReliefSupplies...');
        const [[supplyStats]] = await db.query(`
            SELECT 
                COUNT(*) as totalSupplyTypes
            FROM ReliefSupplies
        `);
        console.log('✅', supplyStats);
        
        console.log('\n5. Testing Alerts...');
        const [activeAlerts] = await db.query(`
            SELECT AlertID FROM Alerts WHERE Status = 'Active' LIMIT 1
        `);
        console.log('✅ Alerts found:', activeAlerts.length);
        
        console.log('\n✅ All queries successful!');
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Query failed at:', error.sql);
        process.exit(1);
    }
}

testQueries();
