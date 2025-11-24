const db = require('../db/connection');

// Get all supplies
exports.getAllSupplies = async (req, res) => {
  try {
    const { category, status } = req.query;
    
    let query = 'SELECT * FROM ReliefSupplies WHERE 1=1';
    const params = [];
    
    if (category) {
      query += ' AND Category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND Status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY SupplyName';
    
    const [supplies] = await db.query(query, params);
    res.json(supplies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get supply by ID
exports.getSupplyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [supplies] = await db.query(
      'SELECT * FROM ReliefSupplies WHERE SupplyID = ?',
      [id]
    );
    
    if (supplies.length === 0) {
      return res.status(404).json({ error: 'Supply not found' });
    }
    
    // Get distribution history
    const [distributions] = await db.query(`
      SELECT sd.*, d.DisasterName, s.ShelterName
      FROM SupplyDistributions sd
      LEFT JOIN Disasters d ON sd.DisasterID = d.DisasterID
      LEFT JOIN Shelters s ON sd.ShelterID = s.ShelterID
      WHERE sd.SupplyID = ?
      ORDER BY sd.DistributionDate DESC
      LIMIT 20
    `, [id]);
    
    res.json({
      ...supplies[0],
      recentDistributions: distributions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create supply
exports.createSupply = async (req, res) => {
  try {
    const {
      SupplyName, Category, Unit, TotalQuantity,
      MinimumThreshold, StorageLocation, ExpiryDate
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO ReliefSupplies 
      (SupplyName, Category, Unit, TotalQuantity, MinimumThreshold, StorageLocation, ExpiryDate)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [SupplyName, Category, Unit, TotalQuantity, MinimumThreshold, StorageLocation, ExpiryDate]
    );
    
    res.status(201).json({
      message: 'Supply created successfully',
      SupplyID: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update supply
exports.updateSupply = async (req, res) => {
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
      `UPDATE ReliefSupplies SET ${setClause} WHERE SupplyID = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Supply not found' });
    }
    
    res.json({ message: 'Supply updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete supply
exports.deleteSupply = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query(
      'DELETE FROM ReliefSupplies WHERE SupplyID = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Supply not found' });
    }
    
    res.json({ message: 'Supply deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get supply statistics
exports.getSupplyStats = async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT 
        COUNT(*) as totalSupplyTypes,
        SUM(CASE WHEN Status = 'Low Stock' OR Status = 'Out of Stock' THEN 1 ELSE 0 END) as lowStockItems,
        SUM(AvailableQuantity) as totalAvailableUnits
      FROM ReliefSupplies
    `);
    
    const [byCategory] = await db.query(`
      SELECT Category, COUNT(*) as items, SUM(AvailableQuantity) as available
      FROM ReliefSupplies
      GROUP BY Category
      ORDER BY Category
    `);
    
    res.json({
      summary: stats,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Distribute supply
exports.distributeSupply = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      DisasterID, ShelterID, SupplyID, Quantity,
      DistributedBy, ReceivedBy, Notes
    } = req.body;
    
    await connection.beginTransaction();
    
    // Check available quantity with lock
    const [[supply]] = await connection.query(
      'SELECT TotalQuantity, AllocatedQuantity FROM ReliefSupplies WHERE SupplyID = ? FOR UPDATE',
      [SupplyID]
    );
    
    if (!supply) {
      await connection.rollback();
      return res.status(404).json({ error: 'Supply not found' });
    }
    
    const availableQuantity = parseFloat(supply.TotalQuantity || 0) - parseFloat(supply.AllocatedQuantity || 0);
    
    if (availableQuantity < Quantity) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'Insufficient quantity available',
        available: availableQuantity,
        requested: Quantity
      });
    }
    
    // Create distribution record
    await connection.query(
      `INSERT INTO SupplyDistributions 
      (DisasterID, ShelterID, SupplyID, Quantity, DistributedBy, ReceivedBy, Notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [DisasterID, ShelterID, SupplyID, Quantity, DistributedBy, ReceivedBy, Notes]
    );
    
    // Update allocated quantity
    await connection.query(
      'UPDATE ReliefSupplies SET AllocatedQuantity = AllocatedQuantity + ? WHERE SupplyID = ?',
      [Quantity, SupplyID]
    );
    
    await connection.commit();
    res.status(201).json({ message: 'Supply distributed successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};
