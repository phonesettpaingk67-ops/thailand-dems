const db = require('../db/connection');

// Get all user reports with filters
exports.getAllReports = async (req, res) => {
  try {
    const { status, disasterType, severity } = req.query;
    
    let query = 'SELECT * FROM UserReports WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND Status = ?';
      params.push(status);
    }
    if (disasterType) {
      query += ' AND DisasterType = ?';
      params.push(disasterType);
    }
    if (severity) {
      query += ' AND Severity = ?';
      params.push(severity);
    }
    
    query += ' ORDER BY ReportedAt DESC';
    
    const [reports] = await db.query(query, params);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new user report
exports.createReport = async (req, res) => {
  try {
    const {
      UserName,
      UserEmail,
      UserPhone,
      ReportedLocation,
      DisasterType,
      Severity,
      Description,
      Latitude,
      Longitude
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO UserReports 
       (UserName, UserEmail, UserPhone, ReportedLocation, DisasterType, Severity, Description, Latitude, Longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [UserName, UserEmail, UserPhone, ReportedLocation, DisasterType, Severity, Description, Latitude, Longitude]
    );
    
    res.status(201).json({ 
      message: 'Report submitted successfully',
      reportId: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update report status (admin)
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { Status, AdminNotes, VerifiedBy } = req.body;
    
    const updates = [];
    const params = [];
    
    if (Status) {
      updates.push('Status = ?');
      params.push(Status);
    }
    if (AdminNotes !== undefined) {
      updates.push('AdminNotes = ?');
      params.push(AdminNotes);
    }
    if (VerifiedBy) {
      updates.push('VerifiedBy = ?', 'VerifiedAt = NOW()');
      params.push(VerifiedBy);
    }
    
    params.push(id);
    
    await db.query(
      `UPDATE UserReports SET ${updates.join(', ')} WHERE ReportID = ?`,
      params
    );
    
    res.json({ message: 'Report updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM UserReports WHERE ReportID = ?', [id]);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get report statistics
exports.getReportStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as totalReports,
        SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) as pendingReports,
        SUM(CASE WHEN Status = 'Verified' THEN 1 ELSE 0 END) as verifiedReports,
        SUM(CASE WHEN Status = 'Dismissed' THEN 1 ELSE 0 END) as dismissedReports,
        SUM(CASE WHEN Severity = 'Critical' THEN 1 ELSE 0 END) as criticalReports
      FROM UserReports
    `);
    
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
