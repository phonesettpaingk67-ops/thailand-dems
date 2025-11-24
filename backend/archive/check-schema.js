const db = require('./config/database');

async function checkSchema() {
    try {
        console.log('📊 Checking Shelters table schema...\n');
        const [columns] = await db.query('DESCRIBE Shelters');
        console.table(columns);
        
        console.log('\n📊 Sample data:\n');
        const [sample] = await db.query('SELECT * FROM Shelters LIMIT 1');
        console.log(sample[0]);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
