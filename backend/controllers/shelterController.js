const db = require('../db/connection');

// Get all shelters with enhanced data
exports.getAllShelters = async (req, res) => {
  try {
    const { status, city, type } = req.query;
    
    let query = `
      SELECT 
        s.*,
        (s.Capacity - s.CurrentOccupancy) as AvailableSpace,
        ROUND((s.CurrentOccupancy / NULLIF(s.Capacity, 0)) * 100, 2) as OccupancyPercent,
        COUNT(DISTINCT ds.DisasterID) as ActiveDisasterCount
      FROM Shelters s
      LEFT JOIN DisasterShelters ds ON s.ShelterID = ds.ShelterID 
        AND ds.DeactivatedAt IS NULL
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND s.Status = ?';
      params.push(status);
    }
    if (city) {
      query += ' AND s.City LIKE ?';
      params.push(`%${city}%`);
    }
    if (type) {
      query += ' AND s.ShelterType = ?';
      params.push(type);
    }
    
    query += ' GROUP BY s.ShelterID ORDER BY s.ShelterName';
    
    const [shelters] = await db.query(query, params);
    res.json(shelters);
  } catch (error) {
    console.error('Error fetching shelters:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get shelter by ID
exports.getShelterById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [shelters] = await db.query(
      'SELECT * FROM Shelters WHERE ShelterID = ?',
      [id]
    );
    
    if (shelters.length === 0) {
      return res.status(404).json({ error: 'Shelter not found' });
    }
    
    // Get active disasters using this shelter
    const [disasters] = await db.query(`
      SELECT d.*, ds.ActivatedAt, ds.PeakOccupancy
      FROM Disasters d
      JOIN DisasterShelters ds ON d.DisasterID = ds.DisasterID
      WHERE ds.ShelterID = ? AND ds.DeactivatedAt IS NULL
    `, [id]);
    
    res.json({
      ...shelters[0],
      activeDisasters: disasters
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create shelter with validation
exports.createShelter = async (req, res) => {
  try {
    const {
      ShelterName, ShelterType, Address, City,
      Latitude, Longitude, Capacity, Facilities,
      ContactPerson, ContactPhone, CurrentOccupancy, Status
    } = req.body;
    
    // Validation
    if (!ShelterName || !ShelterType || !Address || !City || !Capacity) {
      return res.status(400).json({ 
        error: 'Missing required fields: ShelterName, ShelterType, Address, City, Capacity' 
      });
    }
    
    const capacityNum = parseInt(Capacity);
    const occupancyNum = parseInt(CurrentOccupancy) || 0;
    
    if (capacityNum < 0) {
      return res.status(400).json({ error: 'Capacity cannot be negative' });
    }
    
    if (occupancyNum < 0) {
      return res.status(400).json({ error: 'Occupancy cannot be negative' });
    }
    
    if (occupancyNum > capacityNum) {
      return res.status(400).json({ error: 'Occupancy cannot exceed capacity' });
    }
    
    const [result] = await db.query(
      `INSERT INTO Shelters 
      (ShelterName, ShelterType, Address, City, Latitude, Longitude, 
       Capacity, CurrentOccupancy, Status, Facilities, ContactPerson, ContactPhone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ShelterName, ShelterType, Address, City, Latitude || null, Longitude || null,
       capacityNum, occupancyNum, Status || 'Available', Facilities || null, 
       ContactPerson || null, ContactPhone || null]
    );
    
    // Fetch the created shelter with calculated fields
    const [newShelter] = await db.query(
      `SELECT s.*, 
        (s.Capacity - s.CurrentOccupancy) as AvailableSpace,
        ROUND((s.CurrentOccupancy / NULLIF(s.Capacity, 0)) * 100, 2) as OccupancyPercent
      FROM Shelters s WHERE s.ShelterID = ?`,
      [result.insertId]
    );
    
    res.status(201).json({
      message: 'Shelter created successfully',
      shelter: newShelter[0]
    });
  } catch (error) {
    console.error('Error creating shelter:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update shelter with validation and auto-status
exports.updateShelter = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateFields.ShelterID;
    delete updateFields.CreatedAt;
    delete updateFields.UpdatedAt;
    delete updateFields.AvailableSpace;
    delete updateFields.OccupancyPercent;
    delete updateFields.ActiveDisasterCount;
    
    const fields = Object.keys(updateFields);
    const values = Object.values(updateFields);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Validation for capacity and occupancy
    if (updateFields.Capacity !== undefined) {
      const capacity = parseInt(updateFields.Capacity);
      if (capacity < 0) {
        return res.status(400).json({ error: 'Capacity cannot be negative' });
      }
    }
    
    if (updateFields.CurrentOccupancy !== undefined) {
      const occupancy = parseInt(updateFields.CurrentOccupancy);
      if (occupancy < 0) {
        return res.status(400).json({ error: 'Occupancy cannot be negative' });
      }
    }
    
    // If both capacity and occupancy are being updated, validate them together
    if (updateFields.Capacity !== undefined && updateFields.CurrentOccupancy !== undefined) {
      const capacity = parseInt(updateFields.Capacity);
      const occupancy = parseInt(updateFields.CurrentOccupancy);
      if (occupancy > capacity) {
        return res.status(400).json({ error: 'Occupancy cannot exceed capacity' });
      }
    }
    
    // If only occupancy is being updated, check against existing capacity
    if (updateFields.CurrentOccupancy !== undefined && updateFields.Capacity === undefined) {
      const [[shelter]] = await db.query('SELECT Capacity FROM Shelters WHERE ShelterID = ?', [id]);
      if (!shelter) {
        return res.status(404).json({ error: 'Shelter not found' });
      }
      const occupancy = parseInt(updateFields.CurrentOccupancy);
      if (occupancy > shelter.Capacity) {
        return res.status(400).json({ error: `Occupancy (${occupancy}) cannot exceed capacity (${shelter.Capacity})` });
      }
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    values.push(id);
    
    const [result] = await db.query(
      `UPDATE Shelters SET ${setClause} WHERE ShelterID = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Shelter not found' });
    }
    
    // Fetch updated shelter with calculated fields
    const [updatedShelter] = await db.query(
      `SELECT s.*, 
        (s.Capacity - s.CurrentOccupancy) as AvailableSpace,
        ROUND((s.CurrentOccupancy / NULLIF(s.Capacity, 0)) * 100, 2) as OccupancyPercent
      FROM Shelters s WHERE s.ShelterID = ?`,
      [id]
    );
    
    res.json({ 
      message: 'Shelter updated successfully',
      shelter: updatedShelter[0]
    });
  } catch (error) {
    console.error('Error updating shelter:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete shelter
exports.deleteShelter = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query(
      'DELETE FROM Shelters WHERE ShelterID = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Shelter not found' });
    }
    
    res.json({ message: 'Shelter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get shelter statistics with detailed breakdown
exports.getShelterStats = async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT 
        COUNT(*) as totalShelters,
        SUM(Capacity) as totalCapacity,
        SUM(CurrentOccupancy) as totalOccupancy,
        SUM(Capacity - CurrentOccupancy) as availableSpace,
        ROUND(AVG((CurrentOccupancy / NULLIF(Capacity, 0)) * 100), 2) as avgOccupancyPercent,
        SUM(CASE WHEN Status = 'Available' THEN 1 ELSE 0 END) as availableShelters,
        SUM(CASE WHEN Status = 'Full' THEN 1 ELSE 0 END) as fullShelters,
        SUM(CASE WHEN Status = 'Closed' THEN 1 ELSE 0 END) as closedShelters,
        SUM(CASE WHEN Status = 'Under Maintenance' THEN 1 ELSE 0 END) as maintenanceShelters
      FROM Shelters
    `);
    
    // Get shelters by type
    const [byType] = await db.query(`
      SELECT 
        ShelterType,
        COUNT(*) as count,
        SUM(Capacity) as totalCapacity,
        SUM(CurrentOccupancy) as totalOccupancy
      FROM Shelters
      GROUP BY ShelterType
      ORDER BY count DESC
    `);
    
    // Get shelters by city
    const [byCity] = await db.query(`
      SELECT 
        City,
        COUNT(*) as count,
        SUM(Capacity) as totalCapacity,
        SUM(CurrentOccupancy) as totalOccupancy
      FROM Shelters
      GROUP BY City
      ORDER BY count DESC
      LIMIT 10
    `);
    
    // Get near-capacity shelters (>= 90% occupancy)
    const [nearCapacity] = await db.query(`
      SELECT 
        ShelterID,
        ShelterName,
        Capacity,
        CurrentOccupancy,
        ROUND((CurrentOccupancy / NULLIF(Capacity, 0)) * 100, 2) as OccupancyPercent
      FROM Shelters
      WHERE (CurrentOccupancy / NULLIF(Capacity, 0)) >= 0.9
      ORDER BY OccupancyPercent DESC
      LIMIT 5
    `);
    
    res.json({
      summary: stats,
      byType,
      byCity,
      nearCapacity
    });
  } catch (error) {
    console.error('Error fetching shelter stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Activate shelter for disaster with occupancy management
exports.activateShelterForDisaster = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { shelterId, disasterId, initialOccupancy } = req.body;
    
    if (!shelterId || !disasterId) {
      await connection.rollback();
      return res.status(400).json({ error: 'shelterId and disasterId are required' });
    }
    
    // Check if shelter exists and has capacity
    const [[shelter]] = await connection.query(
      'SELECT * FROM Shelters WHERE ShelterID = ? FOR UPDATE',
      [shelterId]
    );
    
    if (!shelter) {
      await connection.rollback();
      return res.status(404).json({ error: 'Shelter not found' });
    }
    
    if (shelter.Status === 'Closed' || shelter.Status === 'Under Maintenance') {
      await connection.rollback();
      return res.status(400).json({ 
        error: `Shelter is ${shelter.Status} and cannot be activated` 
      });
    }
    
    const availableSpace = shelter.Capacity - shelter.CurrentOccupancy;
    if (availableSpace <= 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Shelter is at full capacity' });
    }
    
    // Check if disaster exists
    const [[disaster]] = await connection.query(
      'SELECT * FROM Disasters WHERE DisasterID = ?',
      [disasterId]
    );
    
    if (!disaster) {
      await connection.rollback();
      return res.status(404).json({ error: 'Disaster not found' });
    }
    
    // Check if already activated for this disaster
    const [[existing]] = await connection.query(
      `SELECT * FROM DisasterShelters 
       WHERE DisasterID = ? AND ShelterID = ? AND DeactivatedAt IS NULL`,
      [disasterId, shelterId]
    );
    
    if (existing) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'Shelter is already activated for this disaster' 
      });
    }
    
    // Activate shelter for disaster
    await connection.query(
      'INSERT INTO DisasterShelters (DisasterID, ShelterID) VALUES (?, ?)',
      [disasterId, shelterId]
    );
    
    // Update occupancy if provided
    if (initialOccupancy && parseInt(initialOccupancy) > 0) {
      const newOccupancy = parseInt(shelter.CurrentOccupancy) + parseInt(initialOccupancy);
      if (newOccupancy <= shelter.Capacity) {
        await connection.query(
          'UPDATE Shelters SET CurrentOccupancy = ? WHERE ShelterID = ?',
          [newOccupancy, shelterId]
        );
      }
    }
    
    await connection.commit();
    
    res.status(201).json({ 
      message: 'Shelter activated for disaster successfully',
      availableSpace,
      shelterName: shelter.ShelterName,
      disasterName: disaster.DisasterName
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error activating shelter:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Update shelter occupancy (check-in/check-out people)
exports.updateOccupancy = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { occupancyChange, action } = req.body; // action: 'checkin' or 'checkout'
    
    const [[shelter]] = await connection.query(
      'SELECT * FROM Shelters WHERE ShelterID = ? FOR UPDATE',
      [id]
    );
    
    if (!shelter) {
      await connection.rollback();
      return res.status(404).json({ error: 'Shelter not found' });
    }
    
    const change = parseInt(occupancyChange) || 0;
    if (change === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Invalid occupancy change value' });
    }
    
    let newOccupancy = parseInt(shelter.CurrentOccupancy);
    
    if (action === 'checkin') {
      newOccupancy += Math.abs(change);
      if (newOccupancy > shelter.Capacity) {
        await connection.rollback();
        return res.status(400).json({ 
          error: `Cannot check in ${Math.abs(change)} people. Only ${shelter.Capacity - shelter.CurrentOccupancy} spaces available.` 
        });
      }
    } else if (action === 'checkout') {
      newOccupancy -= Math.abs(change);
      if (newOccupancy < 0) {
        await connection.rollback();
        return res.status(400).json({ 
          error: `Cannot check out ${Math.abs(change)} people. Only ${shelter.CurrentOccupancy} people currently sheltered.` 
        });
      }
    } else {
      await connection.rollback();
      return res.status(400).json({ error: 'Invalid action. Use "checkin" or "checkout"' });
    }
    
    await connection.query(
      'UPDATE Shelters SET CurrentOccupancy = ? WHERE ShelterID = ?',
      [newOccupancy, id]
    );
    
    await connection.commit();
    
    // Fetch updated shelter
    const [updatedShelter] = await db.query(
      `SELECT s.*, 
        (s.Capacity - s.CurrentOccupancy) as AvailableSpace,
        ROUND((s.CurrentOccupancy / NULLIF(s.Capacity, 0)) * 100, 2) as OccupancyPercent
      FROM Shelters s WHERE s.ShelterID = ?`,
      [id]
    );
    
    res.json({
      message: `Successfully ${action === 'checkin' ? 'checked in' : 'checked out'} ${Math.abs(change)} people`,
      shelter: updatedShelter[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating occupancy:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Get available shelters near a location
exports.getNearestAvailableShelters = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const distance = parseFloat(maxDistance) || 50; // Default 50km
    
    // Using Haversine formula for distance calculation
    const [shelters] = await db.query(`
      SELECT 
        s.*,
        (s.Capacity - s.CurrentOccupancy) as AvailableSpace,
        ROUND((s.CurrentOccupancy / NULLIF(s.Capacity, 0)) * 100, 2) as OccupancyPercent,
        ROUND(
          6371 * 2 * ASIN(SQRT(
            POWER(SIN((s.Latitude - ?) * PI() / 180 / 2), 2) +
            COS(? * PI() / 180) * COS(s.Latitude * PI() / 180) *
            POWER(SIN((s.Longitude - ?) * PI() / 180 / 2), 2)
          )), 
          2
        ) AS DistanceKM
      FROM Shelters s
      WHERE s.Status IN ('Available', 'Full')
        AND s.Latitude IS NOT NULL 
        AND s.Longitude IS NOT NULL
        AND (s.Capacity - s.CurrentOccupancy) > 0
      HAVING DistanceKM <= ?
      ORDER BY DistanceKM ASC
      LIMIT 10
    `, [lat, lat, lon, distance]);
    
    res.json(shelters);
  } catch (error) {
    console.error('Error finding nearest shelters:', error);
    res.status(500).json({ error: error.message });
  }
};
