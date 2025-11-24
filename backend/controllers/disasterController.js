const db = require('../db/connection');
const alertController = require('./alertController');

// Get all disasters with optional filtering
exports.getAllDisasters = async (req, res) => {
  try {
    const { status, type, severity } = req.query;
    
    let query = 'SELECT * FROM Disasters WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND Status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND DisasterType = ?';
      params.push(type);
    }
    if (severity) {
      query += ' AND Severity = ?';
      params.push(severity);
    }
    
    query += ' ORDER BY StartDate DESC';
    
    const [disasters] = await db.query(query, params);
    res.json(disasters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get disaster by ID with full details
exports.getDisasterById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [disasters] = await db.query(
      'SELECT * FROM Disasters WHERE DisasterID = ?',
      [id]
    );
    
    if (disasters.length === 0) {
      return res.status(404).json({ error: 'Disaster not found' });
    }
    
    // Get associated shelters
    const [shelters] = await db.query(`
      SELECT s.*, ds.ActivatedAt, ds.PeakOccupancy
      FROM Shelters s
      JOIN DisasterShelters ds ON s.ShelterID = ds.ShelterID
      WHERE ds.DisasterID = ? AND ds.DeactivatedAt IS NULL
    `, [id]);
    
    // Get affected populations
    const [populations] = await db.query(
      'SELECT * FROM AffectedPopulations WHERE DisasterID = ? ORDER BY RecordedDate DESC',
      [id]
    );
    
    // Get damage assessments
    const [assessments] = await db.query(
      'SELECT * FROM DamageAssessments WHERE DisasterID = ? ORDER BY AssessmentDate DESC',
      [id]
    );
    
    res.json({
      ...disasters[0],
      shelters,
      affectedPopulations: populations,
      damageAssessments: assessments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new disaster
exports.createDisaster = async (req, res) => {
  try {
    const {
      DisasterName, DisasterType, Severity, Description,
      AffectedRegion, Latitude, Longitude, StartDate,
      EstimatedAffectedPopulation, EstimatedDamage
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO Disasters 
      (DisasterName, DisasterType, Severity, Description, AffectedRegion, 
       Latitude, Longitude, StartDate, EstimatedAffectedPopulation, EstimatedDamage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [DisasterName, DisasterType, Severity, Description, AffectedRegion,
       Latitude, Longitude, StartDate, EstimatedAffectedPopulation, EstimatedDamage]
    );
    
    // Auto-create alert for new disaster
    const disasterData = {
      DisasterID: result.insertId,
      DisasterName,
      DisasterType,
      Severity,
      Description,
      AffectedRegion,
      Status: 'Active'
    };
    await alertController.autoCreateDisasterAlert(disasterData, 'created');
    
    res.status(201).json({
      message: 'Disaster created successfully',
      DisasterID: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update disaster
exports.updateDisaster = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;
    
    const fields = Object.keys(updateFields);
    const values = Object.values(updateFields);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    values.push(id);
    
    const [result] = await db.query(
      `UPDATE Disasters SET ${setClause} WHERE DisasterID = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Disaster not found' });
    }
    
    // If status changed, create status update alert
    if (updateFields.Status) {
      const [[disaster]] = await db.query('SELECT * FROM Disasters WHERE DisasterID = ?', [id]);
      if (disaster) {
        await alertController.autoCreateDisasterAlert(disaster, 'statusChanged');
      }
    }
    
    res.json({ message: 'Disaster updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete disaster
exports.deleteDisaster = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query(
      'DELETE FROM Disasters WHERE DisasterID = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Disaster not found' });
    }
    
    res.json({ message: 'Disaster deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get disaster statistics
exports.getDisasterStats = async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT 
        COUNT(*) as totalDisasters,
        SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) as activeDisasters,
        SUM(CASE WHEN Severity = 'Catastrophic' THEN 1 ELSE 0 END) as catastrophicDisasters,
        SUM(EstimatedAffectedPopulation) as totalAffectedPopulation,
        SUM(EstimatedDamage) as totalEstimatedDamage
      FROM Disasters
    `);
    
    const [byType] = await db.query(`
      SELECT DisasterType, COUNT(*) as count
      FROM Disasters
      GROUP BY DisasterType
      ORDER BY count DESC
    `);
    
    const [bySeverity] = await db.query(`
      SELECT Severity, COUNT(*) as count
      FROM Disasters
      GROUP BY Severity
      ORDER BY FIELD(Severity, 'Catastrophic', 'Severe', 'Moderate', 'Minor')
    `);
    
    res.json({
      summary: stats,
      byType,
      bySeverity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
