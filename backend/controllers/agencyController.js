const db = require('../db/connection');

// =====================================================
// AGENCY MANAGEMENT CONTROLLER
// =====================================================

// Get all agencies with optional filters and calculated fields
exports.getAllAgencies = async (req, res) => {
  try {
    const { type, status, province } = req.query;
    let query = `
      SELECT 
        a.*,
        COUNT(DISTINCT CASE WHEN aa.Status IN ('Requested', 'Confirmed', 'Deployed') THEN aa.ActivationID END) AS ActiveDeployments,
        COUNT(DISTINCT CASE WHEN aa.Status = 'Completed' THEN aa.ActivationID END) AS CompletedDeployments,
        COUNT(DISTINCT aa.ActivationID) AS TotalDeployments,
        (SELECT COUNT(*) FROM AgencyResources WHERE AgencyID = a.AgencyID AND AvailabilityStatus = 'Available') AS AvailableResources,
        (SELECT COUNT(*) FROM AgencyResources WHERE AgencyID = a.AgencyID AND AvailabilityStatus = 'Deployed') AS DeployedResources,
        (SELECT COUNT(*) FROM AgencyResources WHERE AgencyID = a.AgencyID) AS TotalResources
      FROM Agencies a
      LEFT JOIN AgencyActivations aa ON a.AgencyID = aa.AgencyID
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ' AND a.AgencyType = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND a.Status = ?';
      params.push(status);
    }
    if (province) {
      query += ' AND a.Province = ?';
      params.push(province);
    }

    query += ' GROUP BY a.AgencyID ORDER BY a.AgencyName';

    const [agencies] = await db.query(query, params);
    res.json(agencies);
  } catch (error) {
    console.error('Error fetching agencies:', error);
    res.status(500).json({ message: 'Error fetching agencies', error: error.message });
  }
};

// Get single agency with resources and MOUs
exports.getAgencyById = async (req, res) => {
  try {
    const { id } = req.params;

    const [agencies] = await db.query('SELECT * FROM Agencies WHERE AgencyID = ?', [id]);
    if (agencies.length === 0) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    // Get MOUs
    const [mous] = await db.query('SELECT * FROM AgencyMOU WHERE AgencyID = ? ORDER BY SignedDate DESC', [id]);

    // Get Resources
    const [resources] = await db.query('SELECT * FROM AgencyResources WHERE AgencyID = ?', [id]);

    // Get Activations history
    const [activations] = await db.query(`
      SELECT aa.*, d.DisasterName, d.DisasterType 
      FROM AgencyActivations aa
      LEFT JOIN Disasters d ON aa.DisasterID = d.DisasterID
      WHERE aa.AgencyID = ?
      ORDER BY aa.RequestedAt DESC
      LIMIT 10
    `, [id]);

    res.json({
      agency: agencies[0],
      mous,
      resources,
      activations
    });
  } catch (error) {
    console.error('Error fetching agency:', error);
    res.status(500).json({ message: 'Error fetching agency', error: error.message });
  }
};

// Create new agency with validation
exports.createAgency = async (req, res) => {
  try {
    const {
      AgencyName, AgencyType, ContactPerson, PhoneNumber, Email,
      Address, Province, Region, ResponseCapability, ActivationTime
    } = req.body;

    // Validation
    if (!AgencyName || !AgencyType) {
      return res.status(400).json({ 
        error: 'Agency Name and Type are required' 
      });
    }

    // Validate phone format if provided (9-15 digits)
    if (PhoneNumber && !/^\d{9,15}$/.test(PhoneNumber.replace(/[-\s]/g, ''))) {
      return res.status(400).json({ 
        error: 'Invalid phone number format (9-15 digits required)' 
      });
    }

    // Validate email format if provided
    if (Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Check email uniqueness
    if (Email) {
      const [existing] = await db.query(
        'SELECT AgencyID FROM Agencies WHERE Email = ?',
        [Email]
      );
      if (existing.length > 0) {
        return res.status(409).json({ 
          error: 'An agency with this email already exists' 
        });
      }
    }

    const [result] = await db.query(
      `INSERT INTO Agencies 
      (AgencyName, AgencyType, ContactPerson, PhoneNumber, Email, Address, Province, Region, ResponseCapability, ActivationTime, Status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [AgencyName, AgencyType, ContactPerson, PhoneNumber, Email, Address, Province, Region, ResponseCapability, ActivationTime || 24]
    );

    // Return created agency with calculated fields
    const [created] = await db.query(`
      SELECT a.*, 
        0 AS ActiveDeployments,
        0 AS CompletedDeployments,
        0 AS TotalDeployments,
        0 AS AvailableResources,
        0 AS DeployedResources,
        0 AS TotalResources
      FROM Agencies a
      WHERE a.AgencyID = ?
    `, [result.insertId]);

    res.status(201).json({ 
      message: 'Agency created successfully',
      agency: created[0]
    });
  } catch (error) {
    console.error('Error creating agency:', error);
    res.status(500).json({ message: 'Error creating agency', error: error.message });
  }
};

// Update agency with validation
exports.updateAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    
    // Check if agency exists
    const [existing] = await db.query('SELECT AgencyName FROM Agencies WHERE AgencyID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    // Validate phone if being updated
    if (fields.PhoneNumber && !/^\d{9,15}$/.test(fields.PhoneNumber.replace(/[-\s]/g, ''))) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate email if being updated
    if (fields.Email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.Email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      // Check email uniqueness (excluding current agency)
      const [emailCheck] = await db.query(
        'SELECT AgencyID FROM Agencies WHERE Email = ? AND AgencyID != ?',
        [fields.Email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(409).json({ error: 'Another agency with this email already exists' });
      }
    }
    
    const updates = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(fields), id];

    await db.query(`UPDATE Agencies SET ${updates} WHERE AgencyID = ?`, values);
    
    // Return updated agency with calculated fields
    const [updated] = await db.query(`
      SELECT a.*,
        COUNT(DISTINCT CASE WHEN aa.Status IN ('Requested', 'Confirmed', 'Deployed') THEN aa.ActivationID END) AS ActiveDeployments,
        COUNT(DISTINCT CASE WHEN aa.Status = 'Completed' THEN aa.ActivationID END) AS CompletedDeployments,
        (SELECT COUNT(*) FROM AgencyResources WHERE AgencyID = a.AgencyID AND AvailabilityStatus = 'Available') AS AvailableResources
      FROM Agencies a
      LEFT JOIN AgencyActivations aa ON a.AgencyID = aa.AgencyID
      WHERE a.AgencyID = ?
      GROUP BY a.AgencyID
    `, [id]);
    
    res.json({ 
      message: `${existing[0].AgencyName} updated successfully`,
      agency: updated[0]
    });
  } catch (error) {
    console.error('Error updating agency:', error);
    res.status(500).json({ message: 'Error updating agency', error: error.message });
  }
};

// Delete agency
exports.deleteAgency = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Agencies WHERE AgencyID = ?', [id]);
    res.json({ message: 'Agency deleted successfully' });
  } catch (error) {
    console.error('Error deleting agency:', error);
    res.status(500).json({ message: 'Error deleting agency', error: error.message });
  }
};

// =====================================================
// AGENCY RESOURCES
// =====================================================

exports.addAgencyResource = async (req, res) => {
  try {
    const { AgencyID, ResourceType, ResourceName, Quantity, Unit, DeploymentTime, Notes } = req.body;

    const [result] = await db.query(
      `INSERT INTO AgencyResources 
      (AgencyID, ResourceType, ResourceName, Quantity, Unit, DeploymentTime, Notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [AgencyID, ResourceType, ResourceName, Quantity, Unit, DeploymentTime, Notes]
    );

    res.status(201).json({ 
      message: 'Resource added successfully',
      resourceId: result.insertId
    });
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ message: 'Error adding resource', error: error.message });
  }
};

exports.updateResourceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { AvailabilityStatus } = req.body;

    await db.query(
      'UPDATE AgencyResources SET AvailabilityStatus = ? WHERE ResourceID = ?',
      [AvailabilityStatus, id]
    );

    res.json({ message: 'Resource status updated successfully' });
  } catch (error) {
    console.error('Error updating resource status:', error);
    res.status(500).json({ message: 'Error updating resource status', error: error.message });
  }
};

// =====================================================
// AGENCY ACTIVATION
// =====================================================

// Activate agency for disaster with validation
exports.activateAgency = async (req, res) => {
  try {
    const { DisasterID, AgencyID, ResourcesDeployed, PersonnelDeployed, Notes } = req.body;

    // Validate required fields
    if (!DisasterID || !AgencyID) {
      return res.status(400).json({ error: 'DisasterID and AgencyID are required' });
    }

    // Check if agency exists and is active
    const [agency] = await db.query(
      'SELECT AgencyName, Status FROM Agencies WHERE AgencyID = ?',
      [AgencyID]
    );
    if (agency.length === 0) {
      return res.status(404).json({ error: 'Agency not found' });
    }
    if (agency[0].Status !== 'Active') {
      return res.status(400).json({ 
        error: `Cannot activate ${agency[0].AgencyName}: Agency status is ${agency[0].Status}` 
      });
    }

    // Check if disaster exists and is active
    const [disaster] = await db.query(
      'SELECT DisasterName, Status FROM Disasters WHERE DisasterID = ?',
      [DisasterID]
    );
    if (disaster.length === 0) {
      return res.status(404).json({ error: 'Disaster not found' });
    }
    if (disaster[0].Status !== 'Active') {
      return res.status(400).json({ 
        error: `Cannot activate agency for ${disaster[0].DisasterName}: Disaster is ${disaster[0].Status}` 
      });
    }

    // Check if already activated for this disaster
    const [existing] = await db.query(
      `SELECT ActivationID, Status FROM AgencyActivations 
       WHERE DisasterID = ? AND AgencyID = ? AND Status IN ('Requested', 'Confirmed', 'Deployed')`,
      [DisasterID, AgencyID]
    );
    if (existing.length > 0) {
      return res.status(409).json({ 
        error: `${agency[0].AgencyName} is already activated for ${disaster[0].DisasterName} (Status: ${existing[0].Status})` 
      });
    }

    const [result] = await db.query(
      `INSERT INTO AgencyActivations 
      (DisasterID, AgencyID, Status, ResourcesDeployed, PersonnelDeployed, Notes)
      VALUES (?, ?, 'Requested', ?, ?, ?)`,
      [DisasterID, AgencyID, ResourcesDeployed, PersonnelDeployed, Notes]
    );

    res.status(201).json({ 
      message: `${agency[0].AgencyName} activation requested for ${disaster[0].DisasterName}`,
      activationId: result.insertId,
      agencyName: agency[0].AgencyName,
      disasterName: disaster[0].DisasterName
    });
  } catch (error) {
    console.error('Error activating agency:', error);
    res.status(500).json({ message: 'Error activating agency', error: error.message });
  }
};

// Update activation status (Confirm, Deploy, Complete, Cancel)
exports.updateActivationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { Status, Notes } = req.body;

    // Validate status
    const validStatuses = ['Requested', 'Confirmed', 'Deployed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(Status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Check activation exists
    const [activation] = await db.query(
      `SELECT aa.*, a.AgencyName, d.DisasterName
       FROM AgencyActivations aa
       JOIN Agencies a ON aa.AgencyID = a.AgencyID
       JOIN Disasters d ON aa.DisasterID = d.DisasterID
       WHERE aa.ActivationID = ?`,
      [id]
    );
    if (activation.length === 0) {
      return res.status(404).json({ error: 'Activation not found' });
    }

    const current = activation[0];
    
    // Build update query
    let updateQuery = 'UPDATE AgencyActivations SET Status = ?';
    let params = [Status];
    
    // Auto-set ActivatedAt when changing to Deployed (if not already set)
    if (Status === 'Deployed' && !current.ActivatedAt) {
      updateQuery += ', ActivatedAt = NOW()';
    }
    
    // Update notes if provided
    if (Notes) {
      updateQuery += ', Notes = ?';
      params.push(Notes);
    }
    
    updateQuery += ' WHERE ActivationID = ?';
    params.push(id);

    await db.query(updateQuery, params);

    res.json({ 
      message: `${current.AgencyName} activation for ${current.DisasterName} updated to ${Status}`,
      previousStatus: current.Status,
      newStatus: Status
    });
  } catch (error) {
    console.error('Error updating activation status:', error);
    res.status(500).json({ message: 'Error updating activation status', error: error.message });
  }
};

// Backwards compatibility: Confirm activation
exports.confirmActivation = async (req, res) => {
  req.body.Status = 'Confirmed';
  return exports.updateActivationStatus(req, res);
};

// Get active agencies for a disaster
exports.getActiveAgenciesForDisaster = async (req, res) => {
  try {
    const { disasterId } = req.params;

    const [agencies] = await db.query(`
      SELECT aa.*, a.AgencyName, a.AgencyType, a.ContactPerson, a.PhoneNumber
      FROM AgencyActivations aa
      JOIN Agencies a ON aa.AgencyID = a.AgencyID
      WHERE aa.DisasterID = ?
      ORDER BY aa.RequestedAt DESC
    `, [disasterId]);

    res.json(agencies);
  } catch (error) {
    console.error('Error fetching active agencies:', error);
    res.status(500).json({ message: 'Error fetching active agencies', error: error.message });
  }
};

// Get available agencies that can be activated with detailed stats
exports.getAvailableAgencies = async (req, res) => {
  try {
    const { resourceType, disasterId } = req.query;

    let query = `
      SELECT DISTINCT a.*, 
        GROUP_CONCAT(DISTINCT ar.ResourceType) as ResourceTypes,
        SUM(CASE WHEN ar.AvailabilityStatus = 'Available' THEN 1 ELSE 0 END) as AvailableResources,
        SUM(CASE WHEN ar.AvailabilityStatus = 'Deployed' THEN 1 ELSE 0 END) as DeployedResources,
        COUNT(DISTINCT CASE WHEN aa.Status IN ('Requested', 'Confirmed', 'Deployed') THEN aa.ActivationID END) as ActiveDeployments
      FROM Agencies a
      LEFT JOIN AgencyResources ar ON a.AgencyID = ar.AgencyID
      LEFT JOIN AgencyActivations aa ON a.AgencyID = aa.AgencyID
      WHERE a.Status = 'Active'
    `;
    
    const params = [];

    if (resourceType) {
      query += ` AND ar.ResourceType = ?`;
      params.push(resourceType);
    }
    
    // Exclude agencies already activated for this disaster
    if (disasterId) {
      query += ` AND NOT EXISTS (
        SELECT 1 FROM AgencyActivations 
        WHERE AgencyID = a.AgencyID 
          AND DisasterID = ? 
          AND Status IN ('Requested', 'Confirmed', 'Deployed')
      )`;
      params.push(disasterId);
    }

    query += ` GROUP BY a.AgencyID ORDER BY a.ActivationTime ASC, AvailableResources DESC`;

    const [agencies] = await db.query(query, params);

    res.json(agencies);
  } catch (error) {
    console.error('Error fetching available agencies:', error);
    res.status(500).json({ message: 'Error fetching available agencies', error: error.message });
  }
};

// =====================================================
// AGENCY STATISTICS
// =====================================================

// Get comprehensive agency statistics
exports.getAgencyStats = async (req, res) => {
  try {
    // Summary statistics
    const [summary] = await db.query(`
      SELECT 
        COUNT(DISTINCT a.AgencyID) as totalAgencies,
        SUM(CASE WHEN a.Status = 'Active' THEN 1 ELSE 0 END) as activeAgencies,
        SUM(CASE WHEN a.Status = 'Inactive' THEN 1 ELSE 0 END) as inactiveAgencies,
        SUM(CASE WHEN a.Status = 'Suspended' THEN 1 ELSE 0 END) as suspendedAgencies,
        COUNT(DISTINCT CASE WHEN aa.Status IN ('Requested', 'Confirmed', 'Deployed') THEN aa.ActivationID END) as activeDeployments,
        COUNT(DISTINCT CASE WHEN aa.Status = 'Completed' THEN aa.ActivationID END) as completedDeployments,
        (SELECT COUNT(*) FROM AgencyResources WHERE AvailabilityStatus = 'Available') as totalAvailableResources,
        (SELECT COUNT(*) FROM AgencyResources WHERE AvailabilityStatus = 'Deployed') as totalDeployedResources
      FROM Agencies a
      LEFT JOIN AgencyActivations aa ON a.AgencyID = aa.AgencyID
    `);

    // By type
    const [byType] = await db.query(`
      SELECT 
        AgencyType,
        COUNT(*) as count,
        SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) as active
      FROM Agencies
      GROUP BY AgencyType
      ORDER BY count DESC
    `);

    // By region
    const [byRegion] = await db.query(`
      SELECT 
        Region,
        COUNT(*) as count,
        SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) as active
      FROM Agencies
      WHERE Region IS NOT NULL
      GROUP BY Region
      ORDER BY count DESC
    `);

    // Top agencies by deployments
    const [topAgencies] = await db.query(`
      SELECT 
        a.AgencyID,
        a.AgencyName,
        a.AgencyType,
        COUNT(DISTINCT aa.ActivationID) as totalDeployments,
        COUNT(DISTINCT CASE WHEN aa.Status = 'Completed' THEN aa.ActivationID END) as completedDeployments,
        (SELECT COUNT(*) FROM AgencyResources WHERE AgencyID = a.AgencyID) as totalResources
      FROM Agencies a
      LEFT JOIN AgencyActivations aa ON a.AgencyID = aa.AgencyID
      WHERE a.Status = 'Active'
      GROUP BY a.AgencyID
      ORDER BY totalDeployments DESC, completedDeployments DESC
      LIMIT 5
    `);

    // Resource availability by type
    const [resourcesByType] = await db.query(`
      SELECT 
        ResourceType,
        COUNT(*) as total,
        SUM(CASE WHEN AvailabilityStatus = 'Available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN AvailabilityStatus = 'Deployed' THEN 1 ELSE 0 END) as deployed,
        SUM(CASE WHEN AvailabilityStatus = 'Reserved' THEN 1 ELSE 0 END) as reserved
      FROM AgencyResources
      GROUP BY ResourceType
      ORDER BY total DESC
    `);

    res.json({
      summary: summary[0],
      byType,
      byRegion,
      topAgencies,
      resourcesByType
    });
  } catch (error) {
    console.error('Error fetching agency stats:', error);
    res.status(500).json({ message: 'Error fetching agency stats', error: error.message });
  }
};
