const db = require('./config/database');

async function checkSchema() {
    try {
        console.log('📊 Checking PartnerFacilities table schema...\n');
        const [columns] = await db.query('DESCRIBE PartnerFacilities');
        console.table(columns);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkSchema();
