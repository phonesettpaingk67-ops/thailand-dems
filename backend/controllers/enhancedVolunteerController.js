const db = require('../db/connection');

// =====================================================
// ENHANCED VOLUNTEER CONTROLLER
// =====================================================

// Get all volunteers with skills and availability
exports.getAllVolunteers = async (req, res) => {
  try {
    const { status, skill, available } = req.query;

    let query = `
      SELECT v.*,
        CONCAT(v.FirstName, ' ', v.LastName) as VolunteerName,
        GROUP_CONCAT(DISTINCT s.SkillName) as Skills
      FROM Volunteers v
      LEFT JOIN VolunteerSkills vs ON v.VolunteerID = vs.VolunteerID
      LEFT JOIN Skills s ON vs.SkillID = s.SkillID
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += ' AND v.AvailabilityStatus = ?';
      params.push(status);
    }

    if (skill) {
      query += ' AND (v.Skills LIKE ? OR s.SkillName LIKE ?)';
      params.push(`%${skill}%`, `%${skill}%`);
    }

    if (available) {
      query += ' AND v.AvailabilityStatus = "Available"';
    }

    query += ' GROUP BY v.VolunteerID ORDER BY v.LastName, v.FirstName';

    const [volunteers] = await db.query(query, params);
    res.json(volunteers);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ message: 'Error fetching volunteers', error: error.message });
  }
};

// Get volunteer profile with complete details
exports.getVolunteerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Basic info
    const [volunteers] = await db.query('SELECT * FROM Volunteers WHERE VolunteerID = ?', [id]);
    if (volunteers.length === 0) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    // Skills
    const [skills] = await db.query(`
      SELECT s.*, vs.ProficiencyLevel, vs.CertificationNumber, vs.ExpiryDate
      FROM VolunteerSkills vs
      JOIN Skills s ON vs.SkillID = s.SkillID
      WHERE vs.VolunteerID = ?
    `, [id]);

    // Availability
    const [availability] = await db.query(
      'SELECT * FROM VolunteerAvailability WHERE VolunteerID = ? ORDER BY AvailableFrom DESC LIMIT 1',
      [id]
    );

    // Training
    const [training] = await db.query(`
      SELECT tp.*, vt.CompletedDate, vt.ExpiryDate, vt.Status
      FROM VolunteerTraining vt
      JOIN TrainingPrograms tp ON vt.TrainingID = tp.TrainingID
      WHERE vt.VolunteerID = ?
      ORDER BY vt.CompletedDate DESC
    `, [id]);

    // Deployment history
    const [deployments] = await db.query(`
      SELECT vd.*, d.DisasterName, d.DisasterType
      FROM VolunteerDeployments vd
      JOIN Disasters d ON vd.DisasterID = d.DisasterID
      WHERE vd.VolunteerID = ?
      ORDER BY vd.DeployedAt DESC
      LIMIT 10
    `, [id]);

    res.json({
      volunteer: volunteers[0],
      skills,
      availability: availability[0] || null,
      training,
      deployments
    });
  } catch (error) {
    console.error('Error fetching volunteer profile:', error);
    res.status(500).json({ message: 'Error fetching volunteer profile', error: error.message });
  }
};

// =====================================================
// SKILLS MANAGEMENT
// =====================================================

exports.getAllSkills = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM Skills';
    const params = [];

    if (category) {
      query += ' WHERE Category = ?';
      params.push(category);
    }

    query += ' ORDER BY Category, SkillName';

    const [skills] = await db.query(query, params);
    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ message: 'Error fetching skills', error: error.message });
  }
};

exports.addSkillToVolunteer = async (req, res) => {
  try {
    const { VolunteerID, SkillID, ProficiencyLevel, CertificationNumber, CertifiedDate, ExpiryDate } = req.body;

    await db.query(`
      INSERT INTO VolunteerSkills 
      (VolunteerID, SkillID, ProficiencyLevel, CertificationNumber, CertifiedDate, ExpiryDate)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [VolunteerID, SkillID, ProficiencyLevel, CertificationNumber, CertifiedDate, ExpiryDate]);

    res.status(201).json({ message: 'Skill added to volunteer successfully' });
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({ message: 'Error adding skill', error: error.message });
  }
};

// =====================================================
// AVAILABILITY MANAGEMENT
// =====================================================

exports.updateAvailability = async (req, res) => {
  try {
    const { VolunteerID, AvailableFrom, AvailableTo, DaysOfWeek, Status, Notes } = req.body;

    await db.query(`
      INSERT INTO VolunteerAvailability 
      (VolunteerID, AvailableFrom, AvailableTo, DaysOfWeek, Status, Notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [VolunteerID, AvailableFrom, AvailableTo, DaysOfWeek, Status, Notes]);

    res.status(201).json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: 'Error updating availability', error: error.message });
  }
};

exports.getAvailableVolunteers = async (req, res) => {
  try {
    const { skill, location } = req.query;

    let query = `
      SELECT DISTINCT v.*, 
        GROUP_CONCAT(DISTINCT s.SkillName) as Skills,
        va.AvailableFrom, va.AvailableTo
      FROM Volunteers v
      JOIN VolunteerAvailability va ON v.VolunteerID = va.VolunteerID
      LEFT JOIN VolunteerSkills vs ON v.VolunteerID = vs.VolunteerID
      LEFT JOIN Skills s ON vs.SkillID = s.SkillID
      WHERE v.Status = 'Active'
        AND va.Status = 'Available'
        AND va.AvailableFrom <= CURDATE()
        AND (va.AvailableTo >= CURDATE() OR va.AvailableTo IS NULL)
    `;

    const params = [];

    if (skill) {
      query += ' AND s.SkillName = ?';
      params.push(skill);
    }

    if (location) {
      query += ' AND v.PreferredLocation LIKE ?';
      params.push(`%${location}%`);
    }

    query += ' GROUP BY v.VolunteerID ORDER BY v.VolunteerName';

    const [volunteers] = await db.query(query, params);
    res.json(volunteers);
  } catch (error) {
    console.error('Error fetching available volunteers:', error);
    res.status(500).json({ message: 'Error fetching available volunteers', error: error.message });
  }
};

// =====================================================
// DEPLOYMENT MANAGEMENT
// =====================================================

exports.deployVolunteer = async (req, res) => {
  try {
    const { VolunteerID, DisasterID, Role, Location, Notes } = req.body;

    const [result] = await db.query(`
      INSERT INTO VolunteerDeployments 
      (VolunteerID, DisasterID, Role, Location, Notes)
      VALUES (?, ?, ?, ?, ?)
    `, [VolunteerID, DisasterID, Role, Location, Notes]);

    // Update availability status
    await db.query(`
      UPDATE VolunteerAvailability 
      SET Status = 'On Deployment'
      WHERE VolunteerID = ?
    `, [VolunteerID]);

    res.status(201).json({
      message: 'Volunteer deployed successfully',
      deploymentId: result.insertId
    });
  } catch (error) {
    console.error('Error deploying volunteer:', error);
    res.status(500).json({ message: 'Error deploying volunteer', error: error.message });
  }
};

exports.completeDeployment = async (req, res) => {
  try {
    const { id } = req.params;
    const { PerformanceRating, Notes } = req.body;

    // Get volunteer ID
    const [deployments] = await db.query(
      'SELECT VolunteerID FROM VolunteerDeployments WHERE DeploymentID = ?',
      [id]
    );

    if (deployments.length === 0) {
      return res.status(404).json({ message: 'Deployment not found' });
    }

    // Update deployment
    await db.query(`
      UPDATE VolunteerDeployments 
      SET Status = 'Completed', ReturnedAt = NOW(), PerformanceRating = ?, Notes = ?
      WHERE DeploymentID = ?
    `, [PerformanceRating, Notes, id]);

    // Update availability back to available
    await db.query(`
      UPDATE VolunteerAvailability 
      SET Status = 'Available'
      WHERE VolunteerID = ?
    `, [deployments[0].VolunteerID]);

    res.json({ message: 'Deployment completed successfully' });
  } catch (error) {
    console.error('Error completing deployment:', error);
    res.status(500).json({ message: 'Error completing deployment', error: error.message });
  }
};

// =====================================================
// RECRUITMENT CAMPAIGNS
// =====================================================

exports.createRecruitmentCampaign = async (req, res) => {
  try {
    const { CampaignName, DisasterID, TargetVolunteers, RequiredSkills, StartDate, EndDate, Description } = req.body;

    const [result] = await db.query(`
      INSERT INTO RecruitmentCampaigns 
      (CampaignName, DisasterID, TargetVolunteers, RequiredSkills, StartDate, EndDate, Description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [CampaignName, DisasterID, TargetVolunteers, JSON.stringify(RequiredSkills), StartDate, EndDate, Description]);

    res.status(201).json({
      message: 'Recruitment campaign created successfully',
      campaignId: result.insertId
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Error creating campaign', error: error.message });
  }
};

exports.getRecruitmentCampaigns = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT rc.*, d.DisasterName, d.DisasterType
      FROM RecruitmentCampaigns rc
      LEFT JOIN Disasters d ON rc.DisasterID = d.DisasterID
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += ' AND rc.Status = ?';
      params.push(status);
    }

    query += ' ORDER BY rc.StartDate DESC';

    const [campaigns] = await db.query(query, params);
    
    // Parse RequiredSkills JSON
    const parsed = campaigns.map(c => ({
      ...c,
      RequiredSkills: typeof c.RequiredSkills === 'string' ? JSON.parse(c.RequiredSkills) : c.RequiredSkills
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
  }
};

// =====================================================
// TRAINING PROGRAMS
// =====================================================

exports.getAllTrainingPrograms = async (req, res) => {
  try {
    const [programs] = await db.query('SELECT * FROM TrainingPrograms ORDER BY Category, TrainingName');
    res.json(programs);
  } catch (error) {
    console.error('Error fetching training programs:', error);
    res.status(500).json({ message: 'Error fetching training programs', error: error.message });
  }
};

exports.recordTrainingCompletion = async (req, res) => {
  try {
    const { VolunteerID, TrainingID, CompletedDate, Score, CertificateNumber } = req.body;

    // Get training validity period
    const [programs] = await db.query('SELECT CertificationValid FROM TrainingPrograms WHERE TrainingID = ?', [TrainingID]);
    
    let expiryDate = null;
    if (programs[0]?.CertificationValid) {
      const completed = new Date(CompletedDate);
      expiryDate = new Date(completed.setMonth(completed.getMonth() + programs[0].CertificationValid));
    }

    await db.query(`
      INSERT INTO VolunteerTraining 
      (VolunteerID, TrainingID, CompletedDate, ExpiryDate, Score, CertificateNumber)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [VolunteerID, TrainingID, CompletedDate, expiryDate, Score, CertificateNumber]);

    res.status(201).json({ message: 'Training completion recorded successfully' });
  } catch (error) {
    console.error('Error recording training:', error);
    res.status(500).json({ message: 'Error recording training', error: error.message });
  }
};
