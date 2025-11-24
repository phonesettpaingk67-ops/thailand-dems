const db = require('../db/connection');

// Get all volunteers with enhanced data
exports.getAllVolunteers = async (req, res) => {
  try {
    const { status, skills } = req.query;
    
    let query = `
      SELECT 
        v.*,
        CONCAT(v.FirstName, ' ', v.LastName) as FullName,
        v.JoinedDate as RegistrationDate,
        COUNT(DISTINCT CASE WHEN va.Status = 'Active' THEN va.AssignmentID END) as ActiveAssignments,
        COUNT(DISTINCT CASE WHEN va.Status = 'Completed' THEN va.AssignmentID END) as CompletedAssignments,
        COUNT(DISTINCT va.AssignmentID) as TotalAssignments
      FROM Volunteers v
      LEFT JOIN VolunteerAssignments va ON v.VolunteerID = va.VolunteerID
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND v.AvailabilityStatus = ?';
      params.push(status);
    }
    if (skills) {
      query += ' AND v.Skills LIKE ?';
      params.push(`%${skills}%`);
    }
    
    query += ' GROUP BY v.VolunteerID ORDER BY v.LastName, v.FirstName';
    
    const [volunteers] = await db.query(query, params);
    res.json(volunteers);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get volunteer by ID
exports.getVolunteerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [volunteers] = await db.query(
      'SELECT * FROM Volunteers WHERE VolunteerID = ?',
      [id]
    );
    
    if (volunteers.length === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    // Get assignment history
    const [assignments] = await db.query(`
      SELECT va.*, d.DisasterName, s.ShelterName
      FROM VolunteerAssignments va
      JOIN Disasters d ON va.DisasterID = d.DisasterID
      LEFT JOIN Shelters s ON va.ShelterID = s.ShelterID
      WHERE va.VolunteerID = ?
      ORDER BY va.AssignedDate DESC
    `, [id]);
    
    res.json({
      ...volunteers[0],
      assignments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create volunteer with validation
exports.createVolunteer = async (req, res) => {
  try {
    const {
      FirstName, LastName, Email, Phone, Skills,
      Certification, EmergencyContact, EmergencyPhone, RegistrationDate
    } = req.body;
    
    // Validation
    if (!FirstName || !LastName || !Phone) {
      return res.status(400).json({ 
        error: 'Missing required fields: FirstName, LastName, Phone' 
      });
    }
    
    // Validate phone format (basic)
    const phoneClean = Phone.replace(/\D/g, '');
    if (phoneClean.length < 9 || phoneClean.length > 11) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    // Validate email if provided
    if (Email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(Email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      
      // Check for duplicate email
      const [[existing]] = await db.query(
        'SELECT VolunteerID FROM Volunteers WHERE Email = ?',
        [Email]
      );
      if (existing) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }
    
    // Use RegistrationDate from request, or default to current date
    const joinDate = RegistrationDate || new Date().toISOString().split('T')[0];
    
    const [result] = await db.query(
      `INSERT INTO Volunteers 
      (FirstName, LastName, Email, Phone, Skills, Certification, 
       EmergencyContact, EmergencyPhone, JoinedDate, AvailabilityStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available')`,
      [FirstName, LastName, Email || null, Phone, Skills || null, Certification || null,
       EmergencyContact || null, EmergencyPhone || null, joinDate]
    );
    
    // Fetch the created volunteer
    const [newVolunteer] = await db.query(
      `SELECT v.*, 
        CONCAT(v.FirstName, ' ', v.LastName) as FullName,
        0 as ActiveAssignments,
        0 as CompletedAssignments,
        0 as TotalAssignments
      FROM Volunteers v WHERE v.VolunteerID = ?`,
      [result.insertId]
    );
    
    res.status(201).json({
      message: 'Volunteer registered successfully',
      volunteer: newVolunteer[0]
    });
  } catch (error) {
    console.error('Error creating volunteer:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update volunteer
exports.updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = { ...req.body };
    
    // Map RegistrationDate to JoinedDate if present
    if (updateFields.RegistrationDate) {
      updateFields.JoinedDate = updateFields.RegistrationDate;
      delete updateFields.RegistrationDate;
    }
    
    const fields = Object.keys(updateFields);
    const values = Object.values(updateFields);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    values.push(id);
    
    const [result] = await db.query(
      `UPDATE Volunteers SET ${setClause} WHERE VolunteerID = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    res.json({ message: 'Volunteer updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete volunteer
exports.deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query(
      'DELETE FROM Volunteers WHERE VolunteerID = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    res.json({ message: 'Volunteer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get volunteer statistics with detailed breakdown
exports.getVolunteerStats = async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT 
        COUNT(*) as totalVolunteers,
        SUM(CASE WHEN AvailabilityStatus = 'Available' THEN 1 ELSE 0 END) as availableVolunteers,
        SUM(CASE WHEN AvailabilityStatus = 'Deployed' THEN 1 ELSE 0 END) as deployedVolunteers,
        SUM(CASE WHEN AvailabilityStatus = 'On Leave' THEN 1 ELSE 0 END) as onLeaveVolunteers,
        SUM(CASE WHEN AvailabilityStatus = 'Inactive' THEN 1 ELSE 0 END) as inactiveVolunteers,
        SUM(TotalHoursContributed) as totalHoursContributed,
        ROUND(AVG(TotalHoursContributed), 2) as avgHoursPerVolunteer
      FROM Volunteers
    `);
    
    // Get volunteers by skills
    const [bySkills] = await db.query(`
      SELECT 
        TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v.Skills, ',', numbers.n), ',', -1)) as Skill,
        COUNT(DISTINCT v.VolunteerID) as VolunteerCount
      FROM Volunteers v
      CROSS JOIN (
        SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
      ) numbers
      WHERE v.Skills IS NOT NULL 
        AND CHAR_LENGTH(v.Skills) - CHAR_LENGTH(REPLACE(v.Skills, ',', '')) >= numbers.n - 1
      GROUP BY Skill
      HAVING Skill != ''
      ORDER BY VolunteerCount DESC
      LIMIT 10
    `);
    
    // Get active assignments count
    const [[activeAssignmentsCount]] = await db.query(`
      SELECT COUNT(*) as count
      FROM VolunteerAssignments
      WHERE Status = 'Active'
    `);
    
    // Get top volunteers by hours
    const [topVolunteers] = await db.query(`
      SELECT 
        VolunteerID,
        CONCAT(FirstName, ' ', LastName) as FullName,
        TotalHoursContributed
      FROM Volunteers
      WHERE TotalHoursContributed > 0
      ORDER BY TotalHoursContributed DESC
      LIMIT 5
    `);
    
    res.json({
      summary: stats,
      bySkills,
      activeAssignmentsCount: activeAssignmentsCount.count,
      topVolunteers
    });
  } catch (error) {
    console.error('Error fetching volunteer stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Assign volunteer to disaster (simplified - triggers handle status)
exports.assignVolunteer = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      VolunteerID, DisasterID, ShelterID, Role, Notes
    } = req.body;
    
    await connection.beginTransaction();
    
    // Check volunteer availability with lock
    const [[volunteer]] = await connection.query(
      'SELECT AvailabilityStatus, FirstName, LastName FROM Volunteers WHERE VolunteerID = ? FOR UPDATE',
      [VolunteerID]
    );
    
    if (!volunteer) {
      await connection.rollback();
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    if (volunteer.AvailabilityStatus !== 'Available') {
      await connection.rollback();
      return res.status(400).json({ 
        error: `${volunteer.FirstName} ${volunteer.LastName} is currently ${volunteer.AvailabilityStatus.toLowerCase()}` 
      });
    }
    
    // Create assignment (trigger will auto-update volunteer status)
    const [result] = await connection.query(
      `INSERT INTO VolunteerAssignments 
      (VolunteerID, DisasterID, ShelterID, Role, Notes, Status)
      VALUES (?, ?, ?, ?, ?, 'Active')`,
      [VolunteerID, DisasterID, ShelterID || null, Role, Notes || null]
    );
    
    await connection.commit();
    res.status(201).json({ 
      message: `${volunteer.FirstName} ${volunteer.LastName} assigned successfully`,
      assignmentId: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error assigning volunteer:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Get volunteer assignments with details
exports.getVolunteerAssignments = async (req, res) => {
  try {
    const query = `
      SELECT 
        va.AssignmentID,
        va.VolunteerID,
        va.DisasterID,
        va.ShelterID,
        va.Role,
        va.AssignedDate,
        va.CompletedDate,
        va.HoursWorked,
        va.Status,
        va.Notes,
        CONCAT(v.FirstName, ' ', v.LastName) as VolunteerName,
        v.AvailabilityStatus,
        d.DisasterName,
        d.AffectedRegion,
        s.ShelterName,
        s.City as ShelterCity
      FROM VolunteerAssignments va
      JOIN Volunteers v ON va.VolunteerID = v.VolunteerID
      JOIN Disasters d ON va.DisasterID = d.DisasterID
      LEFT JOIN Shelters s ON va.ShelterID = s.ShelterID
      ORDER BY va.AssignedDate DESC
    `;
    
    const [assignments] = await db.query(query);
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create volunteer assignment (admin) - triggers handle status
exports.createAssignment = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { VolunteerID, DisasterID, ShelterID, Role, Notes, HoursWorked, Status } = req.body;
    
    // Verify volunteer exists
    const [[volunteer]] = await connection.query(
      'SELECT FirstName, LastName, AvailabilityStatus FROM Volunteers WHERE VolunteerID = ?',
      [VolunteerID]
    );
    
    if (!volunteer) {
      await connection.rollback();
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    // If assigning as Active, check availability
    if (Status === 'Active' && volunteer.AvailabilityStatus !== 'Available') {
      await connection.rollback();
      return res.status(400).json({ 
        error: `Cannot assign ${volunteer.FirstName} ${volunteer.LastName} - currently ${volunteer.AvailabilityStatus.toLowerCase()}` 
      });
    }
    
    // Create assignment (trigger will handle status update)
    const [result] = await connection.query(
      `INSERT INTO VolunteerAssignments 
      (VolunteerID, DisasterID, ShelterID, Role, Notes, HoursWorked, Status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [VolunteerID, DisasterID, ShelterID || null, Role, Notes || null, HoursWorked || 0, Status || 'Active']
    );
    
    await connection.commit();
    res.status(201).json({ 
      message: 'Assignment created successfully',
      assignmentId: result.insertId 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Update volunteer assignment - triggers handle status
exports.updateAssignment = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { VolunteerID, DisasterID, ShelterID, Role, Notes, HoursWorked, Status, CompletedDate } = req.body;
    
    const updateFields = {};
    if (VolunteerID) updateFields.VolunteerID = VolunteerID;
    if (DisasterID) updateFields.DisasterID = DisasterID;
    if (ShelterID !== undefined) updateFields.ShelterID = ShelterID;
    if (Role) updateFields.Role = Role;
    if (Notes !== undefined) updateFields.Notes = Notes;
    if (HoursWorked !== undefined) updateFields.HoursWorked = parseInt(HoursWorked);
    if (Status) updateFields.Status = Status;
    if (CompletedDate) updateFields.CompletedDate = CompletedDate;
    
    // Auto-set CompletedDate if status changed to Completed
    if (Status === 'Completed' && !CompletedDate) {
      updateFields.CompletedDate = new Date();
    }
    
    const keys = Object.keys(updateFields);
    const values = Object.values(updateFields);
    
    if (keys.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Get assignment info
    const [[assignment]] = await connection.query(
      'SELECT VolunteerID, Status FROM VolunteerAssignments WHERE AssignmentID = ?',
      [id]
    );
    
    if (!assignment) {
      await connection.rollback();
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    // Update assignment (trigger will handle volunteer status)
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    await connection.query(
      `UPDATE VolunteerAssignments SET ${setClause} WHERE AssignmentID = ?`,
      [...values, id]
    );
    
    await connection.commit();
    res.json({ message: 'Assignment updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating assignment:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Delete assignment - triggers handle status
exports.deleteAssignment = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    // Get volunteer ID before deletion
    const [[assignment]] = await connection.query(
      'SELECT VolunteerID, Status FROM VolunteerAssignments WHERE AssignmentID = ?',
      [id]
    );
    
    if (!assignment) {
      await connection.rollback();
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    // Delete assignment (trigger will handle volunteer status update)
    await connection.query('DELETE FROM VolunteerAssignments WHERE AssignmentID = ?', [id]);
    
    await connection.commit();
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};
