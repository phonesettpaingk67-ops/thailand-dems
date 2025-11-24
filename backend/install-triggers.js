const fs = require('fs');
const db = require('./db/connection');

const triggerFiles = [
  { name: 'Shelter Status Triggers', file: './db/shelter-status-triggers.sql' },
  { name: 'Volunteer Status Triggers', file: './db/volunteer-status-triggers.sql' },
  { name: 'Agency Activation Triggers', file: './db/agency-activation-triggers.sql' }
];

async function installAllTriggers() {
  console.log('🔧 Installing Database Triggers...\n');
  
  for (const triggerFile of triggerFiles) {
    console.log(`📦 Processing: ${triggerFile.name}`);
    console.log(`📄 File: ${triggerFile.file}\n`);
    
    try {
      // Read the SQL file
      const sql = fs.readFileSync(triggerFile.file, 'utf8');
      
      // Split by delimiter and filter empty statements
      const statements = sql
        .split('$$')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--') && !s.startsWith('DELIMITER'));
      
      console.log(`📝 Found ${statements.length} SQL statements\n`);
      
      let installed = 0;
      let skipped = 0;
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        
        if (statement) {
          console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);
          try {
            await db.query(statement);
            installed++;
          } catch (error) {
            if (error.code === 'ER_TRG_ALREADY_EXISTS') {
              console.log(`⚠️  Trigger already exists (skipping)`);
              skipped++;
            } else {
              throw error;
            }
          }
        }
      }
      
      console.log(`✅ ${triggerFile.name}: ${installed} installed, ${skipped} skipped\n`);
      console.log('─'.repeat(60) + '\n');
      
    } catch (error) {
      console.error(`❌ ERROR installing ${triggerFile.name}:`, error.message);
      throw error;
    }
  }
  
  // Verify all triggers
  console.log('📊 Verifying installed triggers...\n');
  
  const [shelterTriggers] = await db.query(`
    SHOW TRIGGERS FROM disaster_management_db 
    WHERE \`Table\` = 'Shelters'
  `);
  
  const [volunteerTriggers] = await db.query(`
    SHOW TRIGGERS FROM disaster_management_db 
    WHERE \`Table\` IN ('Volunteers', 'VolunteerAssignments')
  `);
  
  const [agencyTriggers] = await db.query(`
    SHOW TRIGGERS FROM disaster_management_db 
    WHERE \`Table\` IN ('AgencyActivations', 'AgencyResources')
  `);
  
  console.log(`✓ Shelter triggers (${shelterTriggers.length}):`);
  shelterTriggers.forEach(t => {
    console.log(`   - ${t.Trigger} (${t.Event} ${t.Timing} on ${t.Table})`);
  });
  
  console.log(`\n✓ Volunteer triggers (${volunteerTriggers.length}):`);
  volunteerTriggers.forEach(t => {
    console.log(`   - ${t.Trigger} (${t.Event} ${t.Timing} on ${t.Table})`);
  });
  
  console.log(`\n✓ Agency triggers (${agencyTriggers.length}):`);
  agencyTriggers.forEach(t => {
    console.log(`   - ${t.Trigger} (${t.Event} ${t.Timing} on ${t.Table})`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 ALL TRIGGERS INSTALLED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log('\nYour system now has:');
  console.log('  ✅ Automatic shelter status management');
  console.log('  ✅ Automatic volunteer status management');
  console.log('  ✅ Automatic agency activation tracking');
  console.log('  ✅ Automatic resource availability updates');
  console.log('  ✅ Data integrity enforcement\n');
  
  process.exit(0);
}

installAllTriggers().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});

