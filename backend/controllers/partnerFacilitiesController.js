const db = require('../db/connection');

// =====================================================
// PARTNER FACILITIES & MULTI-TIER SHELTER CONTROLLER
// =====================================================

// Get all partner facilities
exports.getAllPartnerFacilities = async (req, res) => {
  try {
    const { type, province, status, available } = req.query;

    let query = `
      SELECT pf.*, a.AgencyName
      FROM PartnerFacilities pf
      LEFT JOIN Agencies a ON pf.PartnerAgencyID = a.AgencyID
      WHERE 1=1
    `;

    const params = [];

    if (type) {
      query += ' AND pf.FacilityType = ?';
      params.push(type);
    }

    if (province) {
      query += ' AND pf.Province = ?';
      params.push(province);
    }

    if (status) {
      query += ' AND pf.Status = ?';
      params.push(status);
    }

    if (available) {
      query += ' AND pf.Status = "Available" AND pf.ActivationAgreement = TRUE';
    }

    query += ' ORDER BY pf.Province, pf.FacilityName';

    const [facilities] = await db.query(query, params);
    res.json(facilities);
  } catch (error) {
    console.error('Error fetching partner facilities:', error);
    res.status(500).json({ message: 'Error fetching partner facilities', error: error.message });
  }
};

// Get facility by ID
exports.getFacilityById = async (req, res) => {
  try {
    const { id } = req.params;

    const [facilities] = await db.query(`
      SELECT pf.*, a.AgencyName, a.ContactPerson as AgencyContact, a.PhoneNumber as AgencyPhone
      FROM PartnerFacilities pf
      LEFT JOIN Agencies a ON pf.PartnerAgencyID = a.AgencyID
      WHERE pf.FacilityID = ?
    `, [id]);

    if (facilities.length === 0) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Get activation history
    const [activations] = await db.query(`
      SELECT sar.*, d.DisasterName, d.DisasterType
      FROM ShelterActivationRequests sar
      JOIN Disasters d ON sar.DisasterID = d.DisasterID
      WHERE sar.FacilityID = ?
      ORDER BY sar.RequestedAt DESC
      LIMIT 10
    `, [id]);

    res.json({
      facility: facilities[0],
      activations
    });
  } catch (error) {
    console.error('Error fetching facility:', error);
    res.status(500).json({ message: 'Error fetching facility', error: error.message });
  }
};

// Create partner facility
exports.createPartnerFacility = async (req, res) => {
  try {
    const {
      FacilityName, FacilityType, PartnerAgencyID, Address, Province, Region,
      Latitude, Longitude, MaxCapacity, ActivationAgreement, ActivationTime,
      ContactPerson, PhoneNumber, Amenities
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO PartnerFacilities 
      (FacilityName, FacilityType, PartnerAgencyID, Address, Province, Region, Latitude, Longitude,
       MaxCapacity, ActivationAgreement, ActivationTime, ContactPerson, PhoneNumber, Amenities)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [FacilityName, FacilityType, PartnerAgencyID, Address, Province, Region, Latitude, Longitude,
        MaxCapacity, ActivationAgreement, ActivationTime, ContactPerson, PhoneNumber, JSON.stringify(Amenities)]);

    res.status(201).json({
      message: 'Partner facility created successfully',
      facilityId: result.insertId
    });
  } catch (error) {
    console.error('Error creating facility:', error);
    res.status(500).json({ message: 'Error creating facility', error: error.message });
  }
};

// Update facility
exports.updatePartnerFacility = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    
    // Handle Amenities JSON
    if (fields.Amenities && typeof fields.Amenities === 'object') {
      fields.Amenities = JSON.stringify(fields.Amenities);
    }

    const updates = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(fields), id];

    await db.query(`UPDATE PartnerFacilities SET ${updates} WHERE FacilityID = ?`, values);
    res.json({ message: 'Facility updated successfully' });
  } catch (error) {
    console.error('Error updating facility:', error);
    res.status(500).json({ message: 'Error updating facility', error: error.message });
  }
};

// =====================================================
// HOST FAMILIES
// =====================================================

exports.getAllHostFamilies = async (req, res) => {
  try {
    const { province, status, verified } = req.query;

    let query = 'SELECT * FROM HostFamilies WHERE 1=1';
    const params = [];

    if (province) {
      query += ' AND Province = ?';
      params.push(province);
    }

    if (status) {
      query += ' AND Status = ?';
      params.push(status);
    }

    if (verified) {
      query += ' AND BackgroundCheckStatus = "Verified"';
    }

    query += ' ORDER BY Province, FamilyName';

    const [families] = await db.query(query, params);
    res.json(families);
  } catch (error) {
    console.error('Error fetching host families:', error);
    res.status(500).json({ message: 'Error fetching host families', error: error.message });
  }
};

exports.createHostFamily = async (req, res) => {
  try {
    const {
      FamilyName, ContactPerson, PhoneNumber, Email, Address, Province, District,
      MaxGuests, PreferredGuestType, LanguagesSpoken, Amenities
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO HostFamilies 
      (FamilyName, ContactPerson, PhoneNumber, Email, Address, Province, District, MaxGuests,
       PreferredGuestType, LanguagesSpoken, Amenities)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [FamilyName, ContactPerson, PhoneNumber, Email, Address, Province, District, MaxGuests,
        PreferredGuestType, LanguagesSpoken, JSON.stringify(Amenities)]);

    res.status(201).json({
      message: 'Host family registered successfully',
      hostFamilyId: result.insertId
    });
  } catch (error) {
    console.error('Error creating host family:', error);
    res.status(500).json({ message: 'Error creating host family', error: error.message });
  }
};

exports.verifyHostFamily = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Verified' or 'Rejected'

    await db.query(`
      UPDATE HostFamilies 
      SET BackgroundCheckStatus = ?, VerifiedDate = CURDATE()
      WHERE HostFamilyID = ?
    `, [status, id]);

    res.json({ message: `Host family ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error('Error verifying host family:', error);
    res.status(500).json({ message: 'Error verifying host family', error: error.message });
  }
};

// =====================================================
// SHELTER ACTIVATION REQUESTS
// =====================================================

exports.requestShelterActivation = async (req, res) => {
  try {
    const { DisasterID, FacilityID, ShelterID, ExpectedCapacity, RequestedBy, Notes } = req.body;

    const [result] = await db.query(`
      INSERT INTO ShelterActivationRequests 
      (DisasterID, FacilityID, ShelterID, ExpectedCapacity, RequestedBy, Notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [DisasterID, FacilityID, ShelterID, ExpectedCapacity, RequestedBy, Notes]);

    res.status(201).json({
      message: 'Shelter activation requested successfully',
      requestId: result.insertId
    });
  } catch (error) {
    console.error('Error requesting activation:', error);
    res.status(500).json({ message: 'Error requesting activation', error: error.message });
  }
};

exports.approveActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const { ActualCapacity } = req.body;

    await db.query(`
      UPDATE ShelterActivationRequests 
      SET Status = 'Activated', ActivatedAt = NOW(), ActualCapacity = ?
      WHERE RequestID = ?
    `, [ActualCapacity, id]);

    // Update facility status
    const [requests] = await db.query(
      'SELECT FacilityID FROM ShelterActivationRequests WHERE RequestID = ?',
      [id]
    );

    if (requests[0]?.FacilityID) {
      await db.query(
        'UPDATE PartnerFacilities SET Status = "Activated" WHERE FacilityID = ?',
        [requests[0].FacilityID]
      );
    }

    res.json({ message: 'Shelter activation approved' });
  } catch (error) {
    console.error('Error approving activation:', error);
    res.status(500).json({ message: 'Error approving activation', error: error.message });
  }
};

exports.getActivationRequests = async (req, res) => {
  try {
    const { disasterId, status } = req.query;

    let query = `
      SELECT sar.*, 
        d.DisasterName, d.DisasterType,
        pf.FacilityName, pf.FacilityType,
        s.ShelterName
      FROM ShelterActivationRequests sar
      LEFT JOIN Disasters d ON sar.DisasterID = d.DisasterID
      LEFT JOIN PartnerFacilities pf ON sar.FacilityID = pf.FacilityID
      LEFT JOIN Shelters s ON sar.ShelterID = s.ShelterID
      WHERE 1=1
    `;

    const params = [];

    if (disasterId) {
      query += ' AND sar.DisasterID = ?';
      params.push(disasterId);
    }

    if (status) {
      query += ' AND sar.Status = ?';
      params.push(status);
    }

    query += ' ORDER BY sar.RequestedAt DESC';

    const [requests] = await db.query(query, params);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching activation requests:', error);
    res.status(500).json({ message: 'Error fetching activation requests', error: error.message });
  }
};

// =====================================================
// CAPACITY ANALYTICS
// =====================================================

exports.getShelterCapacityAnalytics = async (req, res) => {
  try {
    const { province } = req.query;

    // Primary shelters
    let primaryQuery = `
      SELECT 
        COUNT(*) as Count,
        SUM(Capacity) as TotalCapacity,
        SUM(CurrentOccupancy) as TotalOccupied,
        SUM(Capacity - CurrentOccupancy) as Available
      FROM Shelters
      WHERE Status = 'Available'
    `;

    const params = [];
    if (province) {
      primaryQuery += ' AND City = ?';
      params.push(province);
    }

    const [primary] = await db.query(primaryQuery, params);

    // Partner facilities
    let facilitiesQuery = `
      SELECT 
        FacilityType,
        COUNT(*) as Count,
        SUM(MaxCapacity) as TotalCapacity,
        Status
      FROM PartnerFacilities
      WHERE ActivationAgreement = TRUE
    `;

    if (province) {
      facilitiesQuery += ' AND Province = ?';
    }

    facilitiesQuery += ' GROUP BY FacilityType, Status';

    const [facilities] = await db.query(facilitiesQuery, province ? [province] : []);

    // Host families
    let familiesQuery = `
      SELECT 
        COUNT(*) as Count,
        SUM(MaxGuests - CurrentGuests) as AvailableCapacity
      FROM HostFamilies
      WHERE Status = 'Active' AND BackgroundCheckStatus = 'Verified'
    `;

    if (province) {
      familiesQuery += ' AND Province = ?';
    }

    const [families] = await db.query(familiesQuery, province ? [province] : []);

    res.json({
      primary: primary[0],
      partnerFacilities: facilities,
      hostFamilies: families[0],
      totalPotentialCapacity: 
        (primary[0]?.Available || 0) + 
        facilities.reduce((sum, f) => sum + (f.Status === 'Available' ? f.TotalCapacity : 0), 0) +
        (families[0]?.AvailableCapacity || 0)
    });
  } catch (error) {
    console.error('Error fetching capacity analytics:', error);
    res.status(500).json({ message: 'Error fetching capacity analytics', error: error.message });
  }
};

// Get nearby shelters and facilities (for disaster response)
exports.getNearbyCapacity = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    // Using Haversine formula to find nearby facilities
    const query = `
      SELECT 
        'Shelter' as Type,
        ShelterID as ID,
        ShelterName as Name,
        Address,
        Capacity as MaxCapacity,
        CurrentOccupancy,
        (Capacity - CurrentOccupancy) as Available,
        Latitude,
        Longitude,
        Status,
        (6371 * acos(cos(radians(?)) * cos(radians(Latitude)) * cos(radians(Longitude) - radians(?)) + sin(radians(?)) * sin(radians(Latitude)))) AS Distance
      FROM Shelters
      WHERE Status = 'Available'
      
      UNION ALL
      
      SELECT 
        'Partner Facility' as Type,
        FacilityID as ID,
        FacilityName as Name,
        Address,
        MaxCapacity,
        0 as CurrentOccupancy,
        MaxCapacity as Available,
        Latitude,
        Longitude,
        Status,
        (6371 * acos(cos(radians(?)) * cos(radians(Latitude)) * cos(radians(Longitude) - radians(?)) + sin(radians(?)) * sin(radians(Latitude)))) AS Distance
      FROM PartnerFacilities
      WHERE Status = 'Available' AND ActivationAgreement = TRUE
      
      HAVING Distance < ?
      ORDER BY Distance
      LIMIT 20
    `;

    const [results] = await db.query(query, [
      latitude, longitude, latitude,
      latitude, longitude, latitude,
      radius || 50 // Default 50km radius
    ]);

    res.json(results);
  } catch (error) {
    console.error('Error fetching nearby capacity:', error);
    res.status(500).json({ message: 'Error fetching nearby capacity', error: error.message });
  }
};
