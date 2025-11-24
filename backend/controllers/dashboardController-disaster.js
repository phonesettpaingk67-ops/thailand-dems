const db = require('../db/connection');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Disaster stats
    const [[disasterStats]] = await db.query(`
      SELECT 
        COUNT(*) as totalDisasters,
        SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) as activeDisasters,
        SUM(CASE WHEN Severity = 'Catastrophic' THEN 1 ELSE 0 END) as catastrophicDisasters,
        SUM(EstimatedAffectedPopulation) as totalAffectedPopulation
      FROM Disasters
    `);
    
    // Shelter stats with detailed breakdown
    const [[shelterStats]] = await db.query(`
      SELECT 
        COUNT(*) as totalShelters,
        SUM(Capacity) as totalCapacity,
        SUM(CurrentOccupancy) as totalOccupancy,
        SUM(Capacity - CurrentOccupancy) as availableSpace,
        ROUND(AVG((CurrentOccupancy / NULLIF(Capacity, 0)) * 100), 2) as avgOccupancyPercent,
        SUM(CASE WHEN Status = 'Available' THEN 1 ELSE 0 END) as availableShelters,
        SUM(CASE WHEN Status = 'Full' THEN 1 ELSE 0 END) as fullShelters
      FROM Shelters
    `);
    
    // Volunteer stats with detailed breakdown
    const [[volunteerStats]] = await db.query(`
      SELECT 
        COUNT(*) as totalVolunteers,
        SUM(CASE WHEN AvailabilityStatus = 'Available' THEN 1 ELSE 0 END) as availableVolunteers,
        SUM(CASE WHEN AvailabilityStatus = 'Deployed' THEN 1 ELSE 0 END) as deployedVolunteers,
        SUM(TotalHoursContributed) as totalHoursContributed
      FROM Volunteers
    `);
    
    // Supply stats
    const [[supplyStats]] = await db.query(`
      SELECT 
        COUNT(*) as totalSupplyTypes,
        SUM(CASE WHEN Status = 'Low Stock' OR Status = 'Out of Stock' THEN 1 ELSE 0 END) as lowStockItems
      FROM ReliefSupplies
    `);
    
    // Report stats
    const [[reportStats]] = await db.query(`
      SELECT 
        COUNT(*) as totalReports,
        SUM(CASE WHEN DATE(ReportedAt) = CURDATE() THEN 1 ELSE 0 END) as newReports
      FROM UserReports
    `);
    
    // Recent disasters
    const [recentDisasters] = await db.query(`
      SELECT DisasterID, DisasterName, DisasterType, Severity, Status, 
             AffectedRegion, StartDate, EstimatedAffectedPopulation, 
             Latitude, Longitude, Description, EstimatedDamage, EndDate
      FROM Disasters
      ORDER BY StartDate DESC
      LIMIT 8
    `);
    
    // Active alerts
    const [activeAlerts] = await db.query(`
      SELECT AlertID, AlertType, Severity, Title, Message, AffectedRegion, IssuedAt
      FROM Alerts
      WHERE Status = 'Active'
      ORDER BY IssuedAt DESC
      LIMIT 5
    `);
    
    // Disaster type distribution
    const [disastersByType] = await db.query(`
      SELECT DisasterType as name, COUNT(*) as value
      FROM Disasters
      GROUP BY DisasterType
      ORDER BY value DESC
    `);
    
    // Severity distribution
    const [disastersBySeverity] = await db.query(`
      SELECT Severity as name, COUNT(*) as value
      FROM Disasters
      GROUP BY Severity
      ORDER BY FIELD(Severity, 'Catastrophic', 'Severe', 'Moderate', 'Minor')
    `);
    
    // Status distribution
    const [disastersByStatus] = await db.query(`
      SELECT Status as name, COUNT(*) as value
      FROM Disasters
      GROUP BY Status
      ORDER BY value DESC
    `);
    
    res.json({
      disasters: disasterStats,
      shelters: shelterStats,
      volunteers: volunteerStats,
      supplies: supplyStats,
      reports: reportStats,
      recentDisasters,
      activeAlerts,
      charts: {
        disastersByType,
        disastersBySeverity,
        disastersByStatus
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};
