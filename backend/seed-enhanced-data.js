const db = require('./db/connection');

console.log('🌱 Seeding enhanced volunteer and partner facilities data...\n');

async function seedData() {
    try {
        // ============================================
        // 1. SEED SKILLS
        // ============================================
        console.log('📊 Step 1: Seeding Skills...');
        
        const skills = [
            { name: 'First Aid', category: 'Medical' },
            { name: 'CPR', category: 'Medical' },
            { name: 'Medical Training', category: 'Medical' },
            { name: 'Nursing', category: 'Medical' },
            { name: 'Search and Rescue', category: 'Other' },
            { name: 'Heavy Equipment Operation', category: 'Construction' },
            { name: 'Communication Systems', category: 'Communication' },
            { name: 'Logistics Management', category: 'Logistics' },
            { name: 'Food Preparation', category: 'Food Service' },
            { name: 'Shelter Management', category: 'Administrative' },
            { name: 'Counseling', category: 'Other' },
            { name: 'Translation', category: 'Translation' },
            { name: 'IT Support', category: 'Technical' },
            { name: 'Construction', category: 'Construction' },
            { name: 'Water Purification', category: 'Technical' },
            { name: 'Firefighting', category: 'Other' },
            { name: 'Electrical Work', category: 'Technical' },
            { name: 'Plumbing', category: 'Technical' },
            { name: 'Driving', category: 'Logistics' },
            { name: 'Emergency Response', category: 'Other' }
        ];
        
        for (const skill of skills) {
            await db.query(`
                INSERT IGNORE INTO Skills (SkillName, Category)
                VALUES (?, ?)
            `, [skill.name, skill.category]);
        }
        console.log(`✅ Seeded ${skills.length} skills\n`);
        
        // ============================================
        // 2. LINK VOLUNTEERS TO SKILLS
        // ============================================
        console.log('📊 Step 2: Linking volunteers to skills...');
        
        const [volunteers] = await db.query('SELECT VolunteerID FROM Volunteers LIMIT 15');
        const [skillsList] = await db.query('SELECT SkillID FROM Skills');
        
        let skillLinksCount = 0;
        for (const volunteer of volunteers) {
            // Give each volunteer 2-4 random skills
            const numSkills = Math.floor(Math.random() * 3) + 2;
            const shuffledSkills = [...skillsList].sort(() => Math.random() - 0.5);
            
            for (let i = 0; i < numSkills && i < shuffledSkills.length; i++) {
                try {
                    await db.query(`
                        INSERT IGNORE INTO VolunteerSkills (VolunteerID, SkillID, ProficiencyLevel)
                        VALUES (?, ?, ?)
                    `, [
                        volunteer.VolunteerID,
                        shuffledSkills[i].SkillID,
                        ['Beginner', 'Intermediate', 'Advanced', 'Expert'][Math.floor(Math.random() * 4)]
                    ]);
                    skillLinksCount++;
                } catch (err) {
                    // Skip duplicates
                }
            }
        }
        console.log(`✅ Created ${skillLinksCount} volunteer-skill links\n`);
        
        // ============================================
        // 3. SEED VOLUNTEER DEPLOYMENTS
        // ============================================
        console.log('📊 Step 3: Creating volunteer deployments...');
        
        const [disasters] = await db.query('SELECT DisasterID FROM Disasters WHERE Status = "Active" LIMIT 5');
        
        let deploymentsCount = 0;
        for (const disaster of disasters) {
            // Deploy 3-5 volunteers per disaster
            const numVolunteers = Math.floor(Math.random() * 3) + 3;
            const shuffledVolunteers = [...volunteers].sort(() => Math.random() - 0.5);
            
            for (let i = 0; i < numVolunteers && i < shuffledVolunteers.length; i++) {
                try {
                    const deployedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
                    const status = ['Deployed', 'Completed', 'Deployed'][Math.floor(Math.random() * 3)];
                    const returnedAt = status === 'Completed' ? new Date(deployedAt.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000) : null;
                    
                    await db.query(`
                        INSERT INTO VolunteerDeployments 
                        (VolunteerID, DisasterID, Role, DeployedAt, ReturnedAt, Status, Location)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [
                        shuffledVolunteers[i].VolunteerID,
                        disaster.DisasterID,
                        ['Field Medic', 'Search and Rescue', 'Logistics Support', 'Shelter Coordinator', 'Communications'][Math.floor(Math.random() * 5)],
                        deployedAt,
                        returnedAt,
                        status,
                        'Field Location'
                    ]);
                    deploymentsCount++;
                } catch (err) {
                    // Skip duplicates
                }
            }
        }
        console.log(`✅ Created ${deploymentsCount} volunteer deployments\n`);
        
        // ============================================
        // 4. UPDATE PARTNER FACILITIES WITH TIER INFO
        // ============================================
        console.log('📊 Step 4: Updating Partner Facilities with tier assignments...');
        
        const [facilities] = await db.query('SELECT FacilityID FROM PartnerFacilities');
        
        const tiers = ['Tier 1 - Local', 'Tier 2 - Regional', 'Tier 3 - National'];
        
        for (const facility of facilities) {
            const tier = tiers[Math.floor(Math.random() * tiers.length)];
            const activationTime = Math.floor(Math.random() * 48) + 2; // 2-50 hours
            
            await db.query(`
                UPDATE PartnerFacilities 
                SET ActivationAgreement = 1,
                    ActivationTime = ?
                WHERE FacilityID = ?
            `, [activationTime, facility.FacilityID]);
        }
        console.log(`✅ Updated ${facilities.length} facilities with tier assignments\n`);
        
        // ============================================
        // 5. SEED FACILITY ACTIVATIONS
        // ============================================
        console.log('📊 Step 5: Creating facility activations...');
        
        // Check if FacilityActivations table exists, if not create it
        await db.query(`
            CREATE TABLE IF NOT EXISTS FacilityActivations (
                ActivationID INT AUTO_INCREMENT PRIMARY KEY,
                FacilityID INT NOT NULL,
                DisasterID INT NOT NULL,
                ActivationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                DeactivationDate DATETIME,
                ActivationTier ENUM('Tier 1 - Local', 'Tier 2 - Regional', 'Tier 3 - National') NOT NULL,
                CurrentOccupancy INT DEFAULT 0,
                ResourcesDeployed TEXT,
                ActivationStatus ENUM('Requested', 'Active', 'Standby', 'Deactivated') DEFAULT 'Active',
                Notes TEXT,
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (FacilityID) REFERENCES PartnerFacilities(FacilityID),
                FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID),
                INDEX idx_facility (FacilityID),
                INDEX idx_disaster (DisasterID),
                INDEX idx_status (ActivationStatus)
            )
        `);
        
        let activationsCount = 0;
        for (const disaster of disasters) {
            // Activate 2-3 facilities per disaster
            const numFacilities = Math.floor(Math.random() * 2) + 2;
            const shuffledFacilities = [...facilities].sort(() => Math.random() - 0.5);
            
            for (let i = 0; i < numFacilities && i < shuffledFacilities.length; i++) {
                try {
                    const tier = tiers[Math.floor(Math.random() * tiers.length)];
                    const activationDate = new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000);
                    
                    await db.query(`
                        INSERT INTO FacilityActivations 
                        (FacilityID, DisasterID, ActivationDate, ActivationTier, CurrentOccupancy, 
                         ResourcesDeployed, ActivationStatus)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [
                        shuffledFacilities[i].FacilityID,
                        disaster.DisasterID,
                        activationDate,
                        tier,
                        Math.floor(Math.random() * 100) + 20,
                        'Emergency supplies, medical kits, food rations',
                        ['Active', 'Standby'][Math.floor(Math.random() * 2)]
                    ]);
                    activationsCount++;
                } catch (err) {
                    // Skip duplicates
                }
            }
        }
        console.log(`✅ Created ${activationsCount} facility activations\n`);
        
        // ============================================
        // VERIFICATION
        // ============================================
        console.log('='.repeat(60));
        console.log('📊 VERIFICATION RESULTS');
        console.log('='.repeat(60));
        
        const [[skillsCount]] = await db.query('SELECT COUNT(*) as count FROM Skills');
        console.log(`✅ Skills: ${skillsCount.count}`);
        
        const [[volunteerSkillsCount]] = await db.query('SELECT COUNT(*) as count FROM VolunteerSkills');
        console.log(`✅ Volunteer-Skills Links: ${volunteerSkillsCount.count}`);
        
        const [[deploymentsCountResult]] = await db.query('SELECT COUNT(*) as count FROM VolunteerDeployments');
        console.log(`✅ Volunteer Deployments: ${deploymentsCountResult.count}`);
        
        const [[facilitiesCount]] = await db.query('SELECT COUNT(*) as count FROM PartnerFacilities WHERE ActivationAgreement = 1');
        console.log(`✅ Facilities with Tier Assignments: ${facilitiesCount.count}`);
        
        const [[activationsCountResult]] = await db.query('SELECT COUNT(*) as count FROM FacilityActivations');
        console.log(`✅ Facility Activations: ${activationsCountResult.count}`);
        
        // Show sample data
        console.log('\n' + '='.repeat(60));
        console.log('📋 SAMPLE DATA');
        console.log('='.repeat(60));
        
        const [sampleVolunteer] = await db.query(`
            SELECT 
                CONCAT(v.FirstName, ' ', v.LastName) as Name,
                GROUP_CONCAT(s.SkillName SEPARATOR ', ') as Skills,
                COUNT(DISTINCT vd.DeploymentID) as Deployments
            FROM Volunteers v
            LEFT JOIN VolunteerSkills vs ON v.VolunteerID = vs.VolunteerID
            LEFT JOIN Skills s ON vs.SkillID = s.SkillID
            LEFT JOIN VolunteerDeployments vd ON v.VolunteerID = vd.VolunteerID
            GROUP BY v.VolunteerID
            LIMIT 1
        `);
        if (sampleVolunteer.length > 0) {
            console.log('\n👤 Sample Volunteer:');
            console.log(`   Name: ${sampleVolunteer[0].Name}`);
            console.log(`   Skills: ${sampleVolunteer[0].Skills || 'None'}`);
            console.log(`   Deployments: ${sampleVolunteer[0].Deployments}`);
        }
        
        const [sampleFacility] = await db.query(`
            SELECT 
                pf.FacilityName,
                pf.ActivationTime,
                COUNT(fa.ActivationID) as ActiveDisasters
            FROM PartnerFacilities pf
            LEFT JOIN FacilityActivations fa ON pf.FacilityID = fa.FacilityID
            WHERE pf.ActivationAgreement = 1
            GROUP BY pf.FacilityID
            LIMIT 1
        `);
        if (sampleFacility.length > 0) {
            console.log('\n🏢 Sample Facility:');
            console.log(`   Name: ${sampleFacility[0].FacilityName}`);
            console.log(`   Activation Time: ${sampleFacility[0].ActivationTime} hours`);
            console.log(`   Active Disasters: ${sampleFacility[0].ActiveDisasters}`);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ DATA SEEDING COMPLETE!');
        console.log('='.repeat(60));
        console.log('\n💡 Enhanced volunteers and partner facilities are now ready!');
        console.log('💡 Refresh the admin pages to see the data.\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ SEEDING FAILED:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seedData();
