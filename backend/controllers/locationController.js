const db = require('../db/connection');

// Search locations by name (autocomplete)
exports.searchLocations = async (req, res) => {
  try {
    const { query, type, province, limit = 10 } = req.query;
    
    if (!query || query.length < 2) {
      return res.json([]);
    }
    
    let sql = `
      SELECT LocationID, LocationName, LocationType, Province, Region, 
             Latitude, Longitude, Address, PostalCode
      FROM ThailandLocations
      WHERE IsActive = TRUE
      AND (
        LocationName LIKE ? 
        OR Address LIKE ?
        OR Province LIKE ?
      )
    `;
    
    const params = [`%${query}%`, `%${query}%`, `%${query}%`];
    
    if (type) {
      sql += ' AND LocationType = ?';
      params.push(type);
    }
    
    if (province) {
      sql += ' AND Province = ?';
      params.push(province);
    }
    
    sql += ' ORDER BY CASE WHEN LocationName LIKE ? THEN 0 ELSE 1 END, LocationName LIMIT ?';
    params.push(`${query}%`, parseInt(limit));
    
    const [locations] = await db.query(sql, params);
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get location by coordinates (reverse geocoding)
exports.getLocationByCoordinates = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }
    
    // Find nearest location using Haversine formula
    const [locations] = await db.query(`
      SELECT LocationID, LocationName, LocationType, Province, Region,
             Latitude, Longitude, Address,
             (6371 * acos(cos(radians(?)) * cos(radians(Latitude)) * 
             cos(radians(Longitude) - radians(?)) + sin(radians(?)) * 
             sin(radians(Latitude)))) AS distance
      FROM ThailandLocations
      WHERE IsActive = TRUE
      HAVING distance < ?
      ORDER BY distance
      LIMIT 5
    `, [lat, lng, lat, radius]);
    
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all provinces
exports.getProvinces = async (req, res) => {
  try {
    const [provinces] = await db.query(`
      SELECT DISTINCT Province, Region, 
             MIN(Latitude) as Latitude, 
             MIN(Longitude) as Longitude
      FROM ThailandLocations
      WHERE LocationType = 'Province' AND IsActive = TRUE
      GROUP BY Province, Region
      ORDER BY Province
    `);
    
    res.json(provinces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get locations by type
exports.getLocationsByType = async (req, res) => {
  try {
    const { type, province } = req.query;
    
    let sql = `
      SELECT LocationID, LocationName, LocationType, Province, Region,
             Latitude, Longitude, Address
      FROM ThailandLocations
      WHERE IsActive = TRUE
    `;
    
    const params = [];
    
    if (type) {
      sql += ' AND LocationType = ?';
      params.push(type);
    }
    
    if (province) {
      sql += ' AND Province = ?';
      params.push(province);
    }
    
    sql += ' ORDER BY LocationName';
    
    const [locations] = await db.query(sql, params);
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get location details by ID
exports.getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [locations] = await db.query(
      'SELECT * FROM ThailandLocations WHERE LocationID = ?',
      [id]
    );
    
    if (locations.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(locations[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add custom location
exports.addCustomLocation = async (req, res) => {
  try {
    const {
      LocationName, LocationType, Province, Region,
      Latitude, Longitude, Address, PostalCode
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO ThailandLocations 
      (LocationName, LocationType, Province, Region, Latitude, Longitude, Address, PostalCode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [LocationName, LocationType, Province, Region, Latitude, Longitude, Address, PostalCode]
    );
    
    res.status(201).json({
      message: 'Location added successfully',
      LocationID: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
