const db = require('./config/database');

console.log('🔄 Starting data migration...\n');

async function runMigration() {
    try {
        console.log('📊 Migrating shelter data to PartnerFacilities...\n');
        
        // Migrate shelters to partner facilities using existing table structure
        const [result] = await db.query(`
            INSERT INTO PartnerFacilities (
                FacilityName, FacilityType, ContactPerson, PhoneNumber, Address, 
                Province, Latitude, Longitude, MaxCapacity, 
                Status, Amenities, CreatedAt, UpdatedAt
            )
            SELECT 
                s.ShelterName,
                CASE s.ShelterType
                    WHEN 'Community Center' THEN 'Community Center'
                    WHEN 'Evacuation Center' THEN 'Government Building'
                    ELSE 'Other'
                END as FacilityType,
                s.ContactPerson,
                s.ContactPhone,
                s.Address,
                s.City,
                s.Latitude,
                s.Longitude,
                s.Capacity,
                CASE 
                    WHEN s.Status = 'Available' THEN 'Available'
                    WHEN s.Status = 'Full' THEN 'Unavailable'
                    WHEN s.Status = 'Closed' THEN 'Unavailable'
                    WHEN s.Status = 'Under Maintenance' THEN 'Under Maintenance'
                    ELSE 'Available'
                END as Status,
                s.Facilities as Amenities,
                s.CreatedAt,
                s.UpdatedAt
            FROM Shelters s
            WHERE NOT EXISTS (
                SELECT 1 FROM PartnerFacilities pf 
                WHERE pf.FacilityName = s.ShelterName 
                  AND pf.Address = s.Address
            )
        `);
        
        console.log(`✅ Migrated ${result.affectedRows} shelters to PartnerFacilities\n`);
        
        console.log('='.repeat(60));
        console.log('📊 VERIFICATION RESULTS');
        console.log('='.repeat(60));
        
        const [oldShelters] = await db.query(`
            SELECT COUNT(*) as total,
            SUM(CASE WHEN Status = 'Available' THEN 1 ELSE 0 END) as available
            FROM Shelters
        `);
        console.log(`🏠 Old Shelters: ${oldShelters[0].total} total, ${oldShelters[0].available || 0} available`);
        
        const [newFacilities] = await db.query(`
            SELECT COUNT(*) as total,
            SUM(CASE WHEN Status = 'Available' THEN 1 ELSE 0 END) as available
            FROM PartnerFacilities
        `);
        console.log(`🏢 Partner Facilities: ${newFacilities[0].total} total, ${newFacilities[0].available || 0} available`);
        
        const [volunteers] = await db.query(`
            SELECT COUNT(*) as total,
            SUM(CASE WHEN AvailabilityStatus = 'Available' THEN 1 ELSE 0 END) as available
            FROM Volunteers
        `);
        console.log(`👥 Volunteers: ${volunteers[0].total} total, ${volunteers[0].available || 0} available`);
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ MIGRATION COMPLETE!');
        console.log('='.repeat(60));
        console.log('\n💡 Now update the admin/shelters page to query PartnerFacilities');
        console.log('💡 The dashboard and facilities page should show matching data!\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ MIGRATION FAILED:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run the migration
runMigration();
