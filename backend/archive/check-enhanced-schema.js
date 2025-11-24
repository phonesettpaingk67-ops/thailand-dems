const db = require('./config/database');

async function checkSchema() {
    try {
        console.log('Checking Skills table...');
        const [columns] = await db.query('DESCRIBE Skills');
        console.table(columns);
        
        console.log('\nChecking VolunteerSkills table...');
        const [vsColumns] = await db.query('DESCRIBE VolunteerSkills');
        console.table(vsColumns);
        
        console.log('\nChecking VolunteerDeployments table...');
        const [vdColumns] = await db.query('DESCRIBE VolunteerDeployments');
        console.table(vdColumns);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkSchema();
