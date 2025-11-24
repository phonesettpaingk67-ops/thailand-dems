const db = require('../db/connection');

// =====================================================
// RESOURCE ALLOCATION INTELLIGENCE CONTROLLER
// =====================================================

// Auto-generate capacity alerts when disaster is created/updated
exports.analyzeDisasterCapacity = async (req, res) => {
  try {
    const { disasterId } = req.params;

    // Get disaster details
    const [disasters] = await db.query(
      'SELECT * FROM Disasters WHERE DisasterID = ?',
      [disasterId]
    );

    if (disasters.length === 0) {
      return res.status(404).json({ message: 'Disaster not found' });
    }

    const disaster = disasters[0];
    const affectedPop = disaster.EstimatedAffectedPopulation || 0;
    const alerts = [];

    // 1. SHELTER CAPACITY CHECK
    const [shelters] = await db.query(`
      SELECT SUM(Capacity) as TotalCapacity, 
             SUM(CurrentOccupancy) as TotalOccupied
      FROM Shelters 
      WHERE City = ? AND Status = 'Available'
    `, [disaster.AffectedRegion]);

    const shelterCapacity = (shelters[0]?.TotalCapacity || 0) - (shelters[0]?.TotalOccupied || 0);
    const shelterNeeded = Math.round(affectedPop * 0.3); // Assume 30% need shelter
    const shelterGap = shelterNeeded - shelterCapacity;

    if (shelterGap > 0) {
      const severity = shelterGap > shelterNeeded * 0.7 ? 'Critical' :
                      shelterGap > shelterNeeded * 0.4 ? 'High' : 'Medium';
      
      const recommendations = await generateShelterRecommendations(disaster, shelterGap);

      await db.query(`
        INSERT INTO CapacityAlerts 
        (DisasterID, AlertType, Severity, CurrentCapacity, RequiredCapacity, Gap, GapPercentage, Recommendations)
        VALUES (?, 'Shelter Shortage', ?, ?, ?, ?, ?, ?)
      `, [disasterId, severity, shelterCapacity, shelterNeeded, shelterGap, 
          (shelterGap / shelterNeeded * 100).toFixed(2), JSON.stringify(recommendations)]);

      alerts.push({
        type: 'Shelter Shortage',
        severity,
        gap: shelterGap,
        recommendations
      });
    }

    // 2. VOLUNTEER CAPACITY CHECK
    const [volunteers] = await db.query(`
      SELECT COUNT(*) as AvailableVolunteers
      FROM Volunteers v
      LEFT JOIN VolunteerAvailability va ON v.VolunteerID = va.VolunteerID
      WHERE v.Status = 'Active' 
        AND (va.Status = 'Available' OR va.Status IS NULL)
        AND v.PreferredLocation LIKE ?
    `, [`%${disaster.AffectedRegion}%`]);

    const availableVolunteers = volunteers[0]?.AvailableVolunteers || 0;
    const volunteersNeeded = Math.round(affectedPop / 100); // 1 volunteer per 100 people
    const volunteerGap = volunteersNeeded - availableVolunteers;

    if (volunteerGap > 0) {
      const severity = volunteerGap > volunteersNeeded * 0.7 ? 'Critical' :
                      volunteerGap > volunteersNeeded * 0.4 ? 'High' : 'Medium';
      
      const recommendations = await generateVolunteerRecommendations(disaster, volunteerGap);

      await db.query(`
        INSERT INTO CapacityAlerts 
        (DisasterID, AlertType, Severity, CurrentCapacity, RequiredCapacity, Gap, GapPercentage, Recommendations)
        VALUES (?, 'Volunteer Shortage', ?, ?, ?, ?, ?, ?)
      `, [disasterId, severity, availableVolunteers, volunteersNeeded, volunteerGap,
          (volunteerGap / volunteersNeeded * 100).toFixed(2), JSON.stringify(recommendations)]);

      alerts.push({
        type: 'Volunteer Shortage',
        severity,
        gap: volunteerGap,
        recommendations
      });
    }

    // 3. AUTO-ESCALATE TIER IF NEEDED
    const shouldEscalate = await checkTierEscalation(disaster, shelterGap, volunteerGap);
    if (shouldEscalate) {
      alerts.push({
        type: 'Tier Escalation Recommended',
        severity: 'High',
        recommendation: shouldEscalate
      });
    }

    res.json({
      message: 'Capacity analysis complete',
      alerts,
      summary: {
        shelterGap: shelterGap > 0 ? shelterGap : 0,
        volunteerGap: volunteerGap > 0 ? volunteerGap : 0,
        tierEscalation: shouldEscalate !== null
      }
    });
  } catch (error) {
    console.error('Error analyzing capacity:', error);
    res.status(500).json({ message: 'Error analyzing capacity', error: error.message });
  }
};

// Get all capacity alerts for a disaster
exports.getCapacityAlerts = async (req, res) => {
  try {
    const { disasterId } = req.params;
    const { status } = req.query;

    let query = 'SELECT * FROM CapacityAlerts WHERE DisasterID = ?';
    const params = [disasterId];

    if (status) {
      query += ' AND Status = ?';
      params.push(status);
    }

    query += ' ORDER BY Severity DESC, CreatedAt DESC';

    const [alerts] = await db.query(query, params);
    
    // Parse recommendations JSON
    const parsedAlerts = alerts.map(alert => ({
      ...alert,
      Recommendations: typeof alert.Recommendations === 'string' 
        ? JSON.parse(alert.Recommendations) 
        : alert.Recommendations
    }));

    res.json(parsedAlerts);
  } catch (error) {
    console.error('Error fetching capacity alerts:', error);
    res.status(500).json({ message: 'Error fetching capacity alerts', error: error.message });
  }
};

// Resolve capacity alert
exports.resolveCapacityAlert = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      'UPDATE CapacityAlerts SET Status = "Resolved", ResolvedAt = NOW() WHERE AlertID = ?',
      [id]
    );

    res.json({ message: 'Alert resolved successfully' });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ message: 'Error resolving alert', error: error.message });
  }
};

// =====================================================
// SMART RECOMMENDATIONS
// =====================================================

// Get smart recommendations for a disaster
exports.getSmartRecommendations = async (req, res) => {
  try {
    const { disasterId } = req.params;
    const { status } = req.query;

    let query = 'SELECT * FROM SmartRecommendations WHERE DisasterID = ?';
    const params = [disasterId];

    if (status) {
      query += ' AND Status = ?';
      params.push(status);
    }

    query += ' ORDER BY Priority ASC, CreatedAt DESC';

    const [recommendations] = await db.query(query, params);
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
};

// Implement a recommendation
exports.implementRecommendation = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      'UPDATE SmartRecommendations SET Status = "Implemented", ImplementedAt = NOW() WHERE RecommendationID = ?',
      [id]
    );

    res.json({ message: 'Recommendation implemented successfully' });
  } catch (error) {
    console.error('Error implementing recommendation:', error);
    res.status(500).json({ message: 'Error implementing recommendation', error: error.message });
  }
};

// =====================================================
// RESOURCE REQUESTS
// =====================================================

// Create resource request
exports.createResourceRequest = async (req, res) => {
  try {
    const { DisasterID, ResourceType, QuantityNeeded, Priority, RequestedBy, RequiredBy, Notes } = req.body;

    const [result] = await db.query(`
      INSERT INTO ResourceRequests 
      (DisasterID, ResourceType, QuantityNeeded, Priority, RequestedBy, RequiredBy, Notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [DisasterID, ResourceType, QuantityNeeded, Priority, RequestedBy, RequiredBy, Notes]);

    res.status(201).json({
      message: 'Resource request created successfully',
      requestId: result.insertId
    });
  } catch (error) {
    console.error('Error creating resource request:', error);
    res.status(500).json({ message: 'Error creating resource request', error: error.message });
  }
};

// Get resource requests for disaster
exports.getResourceRequests = async (req, res) => {
  try {
    const { disasterId } = req.params;
    const { status, priority } = req.query;

    let query = 'SELECT * FROM ResourceRequests WHERE DisasterID = ?';
    const params = [disasterId];

    if (status) {
      query += ' AND Status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND Priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY Priority DESC, CreatedAt DESC';

    const [requests] = await db.query(query, params);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching resource requests:', error);
    res.status(500).json({ message: 'Error fetching resource requests', error: error.message });
  }
};

// Update request status
exports.updateResourceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { Status, QuantityFulfilled, AllocatedAgencies } = req.body;

    await db.query(`
      UPDATE ResourceRequests 
      SET Status = ?, QuantityFulfilled = ?, AllocatedAgencies = ?
      WHERE RequestID = ?
    `, [Status, QuantityFulfilled, AllocatedAgencies, id]);

    res.json({ message: 'Resource request updated successfully' });
  } catch (error) {
    console.error('Error updating resource request:', error);
    res.status(500).json({ message: 'Error updating resource request', error: error.message });
  }
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function generateShelterRecommendations(disaster, gap) {
  const recommendations = [];

  // Check for available partner facilities
  const [facilities] = await db.query(`
    SELECT COUNT(*) as Count, SUM(MaxCapacity) as Capacity
    FROM PartnerFacilities
    WHERE Province = ? AND Status = 'Available' AND ActivationAgreement = TRUE
  `, [disaster.AffectedRegion]);

  if (facilities[0]?.Count > 0) {
    recommendations.push({
      action: 'Activate Partner Facilities',
      impact: `+${facilities[0].Capacity} beds`,
      priority: 1
    });
  }

  // Check for nearby agencies with shelter capacity
  const [agencies] = await db.query(`
    SELECT a.AgencyName, ar.Quantity
    FROM Agencies a
    JOIN AgencyResources ar ON a.AgencyID = ar.AgencyID
    WHERE ar.ResourceType = 'Shelter Space' 
      AND ar.AvailabilityStatus = 'Available'
      AND a.Province = ?
    LIMIT 5
  `, [disaster.AffectedRegion]);

  if (agencies.length > 0) {
    recommendations.push({
      action: 'Contact Partner Agencies',
      agencies: agencies.map(a => a.AgencyName),
      impact: `+${agencies.reduce((sum, a) => sum + a.Quantity, 0)} beds`,
      priority: 2
    });
  }

  // Suggest host family activation
  const [hostFamilies] = await db.query(`
    SELECT COUNT(*) as Count, SUM(MaxGuests - CurrentGuests) as Capacity
    FROM HostFamilies
    WHERE Province = ? AND Status = 'Active' AND BackgroundCheckStatus = 'Verified'
  `, [disaster.AffectedRegion]);

  if (hostFamilies[0]?.Count > 0) {
    recommendations.push({
      action: 'Activate Host Family Network',
      impact: `+${hostFamilies[0].Capacity} people`,
      priority: 3
    });
  }

  return recommendations;
}

async function generateVolunteerRecommendations(disaster, gap) {
  const recommendations = [];

  // Create recruitment campaign
  recommendations.push({
    action: 'Launch Recruitment Campaign',
    target: gap,
    priority: 1
  });

  // Check agencies with volunteers
  const [agencies] = await db.query(`
    SELECT a.AgencyName, ar.Quantity
    FROM Agencies a
    JOIN AgencyResources ar ON a.AgencyID = ar.AgencyID
    WHERE ar.ResourceType = 'Volunteers' 
      AND ar.AvailabilityStatus = 'Available'
    LIMIT 5
  `);

  if (agencies.length > 0) {
    recommendations.push({
      action: 'Request Agency Volunteers',
      agencies: agencies.map(a => a.AgencyName),
      impact: `+${agencies.reduce((sum, a) => sum + a.Quantity, 0)} volunteers`,
      priority: 2
    });
  }

  return recommendations;
}

async function checkTierEscalation(disaster, shelterGap, volunteerGap) {
  const currentTier = disaster.ResponseTier || 'Tier 1 - Local';
  const affectedPop = disaster.EstimatedAffectedPopulation || 0;
  const damage = disaster.EstimatedDamage || 0;

  // Check escalation criteria
  if (currentTier === 'Tier 1 - Local') {
    if (affectedPop > 5000 || damage > 50000000 || shelterGap > 1000 || volunteerGap > 100) {
      return {
        from: 'Tier 1 - Local',
        to: 'Tier 2 - Regional',
        reason: 'Exceeds local capacity thresholds'
      };
    }
  }

  if (currentTier === 'Tier 2 - Regional') {
    if (affectedPop > 50000 || damage > 500000000 || shelterGap > 10000) {
      return {
        from: 'Tier 2 - Regional',
        to: 'Tier 3 - National',
        reason: 'Exceeds regional capacity thresholds'
      };
    }
  }

  return null;
}

// Dashboard summary for capacity intelligence
exports.getCapacitySummary = async (req, res) => {
  try {
    const { disasterId } = req.params;

    const [alerts] = await db.query(`
      SELECT AlertType, Severity, COUNT(*) as Count
      FROM CapacityAlerts
      WHERE DisasterID = ? AND Status = 'Active'
      GROUP BY AlertType, Severity
    `, [disasterId]);

    const [requests] = await db.query(`
      SELECT Status, COUNT(*) as Count, SUM(QuantityNeeded - QuantityFulfilled) as Unfulfilled
      FROM ResourceRequests
      WHERE DisasterID = ?
      GROUP BY Status
    `, [disasterId]);

    const [recommendations] = await db.query(`
      SELECT RecommendationType, COUNT(*) as Count
      FROM SmartRecommendations
      WHERE DisasterID = ? AND Status = 'Pending'
      GROUP BY RecommendationType
    `, [disasterId]);

    res.json({
      alerts,
      requests,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching capacity summary:', error);
    res.status(500).json({ message: 'Error fetching capacity summary', error: error.message });
  }
};
