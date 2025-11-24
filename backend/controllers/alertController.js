const db = require('../db/connection');

// Get all alerts
exports.getAllAlerts = async (req, res) => {
  try {
    const { status, severity, disasterType } = req.query;
    
    let query = `
      SELECT a.*, d.DisasterName, d.DisasterType, d.Severity as DisasterSeverity
      FROM Alerts a
      LEFT JOIN Disasters d ON a.DisasterID = d.DisasterID
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND a.Status = ?';
      params.push(status);
    }
    if (severity) {
      query += ' AND a.Severity = ?';
      params.push(severity);
    }
    if (disasterType) {
      query += ' AND d.DisasterType = ?';
      params.push(disasterType);
    }
    
    query += ' ORDER BY a.IssuedAt DESC';
    
    const [alerts] = await db.query(query, params);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get active alerts
exports.getActiveAlerts = async (req, res) => {
  try {
    const [alerts] = await db.query(`
      SELECT a.*, d.DisasterName, d.DisasterType
      FROM Alerts a
      LEFT JOIN Disasters d ON a.DisasterID = d.DisasterID
      WHERE a.Status = 'Active' 
      AND (a.ExpiresAt IS NULL OR a.ExpiresAt > NOW())
      ORDER BY a.IssuedAt DESC
    `);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get alert by ID
exports.getAlertById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [alerts] = await db.query(`
      SELECT a.*, d.DisasterName, d.DisasterType, d.Severity as DisasterSeverity
      FROM Alerts a
      LEFT JOIN Disasters d ON a.DisasterID = d.DisasterID
      WHERE a.AlertID = ?
    `, [id]);
    
    if (alerts.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json(alerts[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create alert
exports.createAlert = async (req, res) => {
  try {
    const {
      AlertType, Severity, Title, Message, AffectedRegion,
      IssuedBy, ExpiresAt, DisasterID
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO Alerts 
      (AlertType, Severity, Title, Message, AffectedRegion, IssuedBy, ExpiresAt, DisasterID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [AlertType, Severity, Title, Message, AffectedRegion, IssuedBy, ExpiresAt, DisasterID]
    );
    
    res.status(201).json({
      message: 'Alert created successfully',
      AlertID: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Auto-create alert when disaster is created/updated
exports.autoCreateDisasterAlert = async (disaster, action = 'created') => {
  try {
    const severityMap = {
      'Catastrophic': 'Emergency',
      'Severe': 'Critical',
      'Moderate': 'Warning',
      'Minor': 'Info'
    };
    
    const alertTypeMap = {
      'created': 'Early Warning',
      'updated': 'Early Warning',
      'severe': 'Evacuation'
    };
    
    let title, message, alertType;
    const severity = severityMap[disaster.Severity] || 'Warning';
    
    if (action === 'created') {
      title = `${disaster.Severity} ${disaster.DisasterType} Alert - ${disaster.AffectedRegion}`;
      message = `A ${disaster.Severity.toLowerCase()} ${disaster.DisasterType.toLowerCase()} has been reported in ${disaster.AffectedRegion}. ${disaster.Description || 'Stay alert and follow official instructions.'}`;
      alertType = disaster.Severity === 'Catastrophic' || disaster.Severity === 'Severe' ? 'Evacuation' : 'Early Warning';
    } else if (action === 'statusChanged') {
      title = `Disaster Status Update - ${disaster.DisasterName}`;
      message = `The status of ${disaster.DisasterName} has been updated to: ${disaster.Status}. Please stay informed through official channels.`;
      alertType = 'Early Warning';
    }
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days expiration
    
    await db.query(
      `INSERT INTO Alerts 
      (AlertType, Severity, Title, Message, AffectedRegion, IssuedBy, ExpiresAt, DisasterID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        alertType,
        severity,
        title,
        message,
        disaster.AffectedRegion,
        'System (Automated)',
        expiresAt,
        disaster.DisasterID
      ]
    );
    
    return true;
  } catch (error) {
    console.error('Error auto-creating alert:', error);
    return false;
  }
};

// Update alert
exports.updateAlert = async (req, res) => {
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
      `UPDATE Alerts SET ${setClause} WHERE AlertID = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json({ message: 'Alert updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel alert
exports.cancelAlert = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query(
      `UPDATE Alerts SET Status = 'Cancelled' WHERE AlertID = ?`,
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json({ message: 'Alert cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete alert
exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query(
      'DELETE FROM Alerts WHERE AlertID = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get alerts for a specific disaster
exports.getAlertsByDisaster = async (req, res) => {
  try {
    const { disasterId } = req.params;
    
    const [alerts] = await db.query(`
      SELECT * FROM Alerts 
      WHERE DisasterID = ? 
      ORDER BY IssuedAt DESC
    `, [disasterId]);
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Expire old alerts (cron job function)
exports.expireOldAlerts = async () => {
  try {
    await db.query(`
      UPDATE Alerts 
      SET Status = 'Expired' 
      WHERE Status = 'Active' 
      AND ExpiresAt IS NOT NULL 
      AND ExpiresAt < NOW()
    `);
    return true;
  } catch (error) {
    console.error('Error expiring alerts:', error);
    return false;
  }
};
