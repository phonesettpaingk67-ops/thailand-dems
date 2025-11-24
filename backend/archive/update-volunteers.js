const mysql = require('mysql2/promise');

async function updateDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Aiismylife_8013',
      database: 'disaster_management_db'
    });

    console.log('📊 Updating volunteer hours...');
    await connection.execute(
      'UPDATE Volunteers SET TotalHoursContributed = FLOOR(TotalHoursContributed * 2.5)'
    );

    console.log('👥 Adding new volunteers...');
    const joinDate = new Date().toISOString().split('T')[0];
    const newVolunteers = [
      ['Somchai', 'Prasert', 'somchai.p@email.com', '081-234-5678', 'Medical Aid, First Aid', 'Available', joinDate],
      ['Niran', 'Kittikul', 'niran.k@email.com', '082-345-6789', 'Search and Rescue, Heavy Equipment', 'Available', joinDate],
      ['Ploy', 'Srisawat', 'ploy.s@email.com', '083-456-7890', 'Food Distribution, Cooking', 'Available', joinDate],
      ['Anon', 'Chaiyaporn', 'anon.c@email.com', '084-567-8901', 'Medical Aid, Counseling', 'Available', joinDate],
      ['Kulap', 'Boonmee', 'kulap.b@email.com', '085-678-9012', 'Shelter Management, Logistics', 'Available', joinDate],
      ['Somsak', 'Rattana', 'somsak.r@email.com', '086-789-0123', 'Search and Rescue, First Aid', 'Available', joinDate],
      ['Mali', 'Thongchai', 'mali.t@email.com', '087-890-1234', 'Food Distribution, Child Care', 'Available', joinDate],
      ['Pong', 'Saetang', 'pong.s@email.com', '088-901-2345', 'Communications, Translation', 'Available', joinDate],
      ['Dao', 'Wongsakul', 'dao.w@email.com', '089-012-3456', 'Medical Aid, Nursing', 'Available', joinDate],
      ['Krit', 'Panichkul', 'krit.p@email.com', '080-123-4567', 'Heavy Equipment, Construction', 'Available', joinDate]
    ];

    for (const volunteer of newVolunteers) {
      await connection.execute(
        'INSERT INTO Volunteers (FirstName, LastName, Email, Phone, Skills, AvailabilityStatus, JoinedDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
        volunteer
      );
    }

    console.log('🌍 Reducing disaster population numbers...');
    await connection.execute(
      'UPDATE Disasters SET EstimatedAffectedPopulation = FLOOR(EstimatedAffectedPopulation * 0.3) WHERE EstimatedAffectedPopulation > 10000'
    );
    
    await connection.execute(
      'UPDATE Disasters SET EstimatedAffectedPopulation = FLOOR(EstimatedAffectedPopulation * 0.5) WHERE EstimatedAffectedPopulation BETWEEN 1000 AND 10000'
    );

    // Get results
    const [volunteers] = await connection.execute('SELECT COUNT(*) as count FROM Volunteers');
    const [population] = await connection.execute('SELECT SUM(EstimatedAffectedPopulation) as total FROM Disasters');

    console.log('\n✅ Update Complete!');
    console.log('📊 Total Volunteers:', volunteers[0].count);
    console.log('👥 Total Affected Population:', population[0].total);

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateDatabase();
