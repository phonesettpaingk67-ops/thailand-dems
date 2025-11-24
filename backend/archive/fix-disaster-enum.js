const db = require('./db/connection');

async function fixDisasterTypeEnum() {
  try {
    console.log('Updating DisasterType ENUM column...');
    
    await db.query(`
      ALTER TABLE Disasters 
      MODIFY COLUMN DisasterType ENUM(
        'Earthquake', 
        'Flood', 
        'Hurricane', 
        'Wildfire', 
        'Tsunami', 
        'Tornado', 
        'Drought', 
        'Landslide', 
        'Volcanic Eruption', 
        'Industrial Accident', 
        'Storm', 
        'Other'
      ) NOT NULL
    `);
    
    console.log('✓ DisasterType column updated successfully!');
    console.log('✓ "Storm" has been added to the allowed disaster types');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating column:', error.message);
    process.exit(1);
  }
}

fixDisasterTypeEnum();
