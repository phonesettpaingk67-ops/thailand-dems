-- DATA MIGRATION SCRIPT
-- Migrate data from old tables (Volunteers, Shelters) to enhanced systems
-- Run this script to sync dashboard with admin pages

USE dems;

-- =====================================================
-- 1. MIGRATE VOLUNTEERS
-- =====================================================

-- First, check if we need to create EnhancedVolunteers table or use existing Volunteers
-- The system uses the existing Volunteers table, so no migration needed

-- Just ensure VolunteerSkills table exists
CREATE TABLE IF NOT EXISTS VolunteerSkills (
    VolunteerSkillID INT AUTO_INCREMENT PRIMARY KEY,
    VolunteerID INT NOT NULL,
    SkillID INT NOT NULL,
    ProficiencyLevel ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') DEFAULT 'Beginner',
    YearsOfExperience INT DEFAULT 0,
    CertificationName VARCHAR(200),
    CertificationExpiry DATE,
    AcquiredDate DATE DEFAULT (CURRENT_DATE),
    LastUsedDate DATE,
    FOREIGN KEY (VolunteerID) REFERENCES Volunteers(VolunteerID) ON DELETE CASCADE,
    FOREIGN KEY (SkillID) REFERENCES Skills(SkillID) ON DELETE CASCADE,
    UNIQUE KEY unique_volunteer_skill (VolunteerID, SkillID)
);

-- Ensure Skills table exists
CREATE TABLE IF NOT EXISTS Skills (
    SkillID INT AUTO_INCREMENT PRIMARY KEY,
    SkillName VARCHAR(100) NOT NULL UNIQUE,
    Category ENUM('Medical', 'Logistics', 'Communication', 'Technical', 'Administrative', 'Physical', 'Other') DEFAULT 'Other',
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure VolunteerDeployments table exists
CREATE TABLE IF NOT EXISTS VolunteerDeployments (
    DeploymentID INT AUTO_INCREMENT PRIMARY KEY,
    VolunteerID INT NOT NULL,
    DisasterID INT NOT NULL,
    ShelterID INT,
    Role VARCHAR(100),
    StartDate DATETIME NOT NULL,
    EndDate DATETIME,
    HoursWorked DECIMAL(10,2) DEFAULT 0,
    Status ENUM('Active', 'Completed', 'Cancelled') DEFAULT 'Active',
    Notes TEXT,
    FOREIGN KEY (VolunteerID) REFERENCES Volunteers(VolunteerID) ON DELETE CASCADE,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE CASCADE,
    FOREIGN KEY (ShelterID) REFERENCES Shelters(ShelterID) ON DELETE SET NULL,
    INDEX idx_status (Status),
    INDEX idx_dates (StartDate, EndDate)
);

-- Parse existing volunteer skills from Skills TEXT field
-- This extracts skills and creates proper skill records
INSERT IGNORE INTO Skills (SkillName, Category)
SELECT DISTINCT 
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v.Skills, ',', n.n), ',', -1)) as SkillName,
    CASE 
        WHEN LOWER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v.Skills, ',', n.n), ',', -1))) LIKE '%medical%' THEN 'Medical'
        WHEN LOWER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v.Skills, ',', n.n), ',', -1))) LIKE '%first aid%' THEN 'Medical'
        WHEN LOWER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v.Skills, ',', n.n), ',', -1))) LIKE '%nurse%' THEN 'Medical'
        WHEN LOWER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v.Skills, ',', n.n), ',', -1))) LIKE '%doctor%' THEN 'Medical'
        WHEN LOWER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v.Skills, ',', n.n), ',', -1))) LIKE '%communication%' THEN 'Communication'
        WHEN LOWER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v.Skills, ',', n.n), ',', -1))) LIKE '%logistics%' THEN 'Logistics'
        WHEN LOWER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v.Skills, ',', n.n), ',', -1))) LIKE '%technical%' THEN 'Technical'
        WHEN LOWER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v.Skills, ',', n.n), ',', -1))) LIKE '%admin%' THEN 'Administrative'
        ELSE 'Other'
    END as Category
FROM Volunteers v
CROSS JOIN (
    SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
    UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
) n
WHERE v.Skills IS NOT NULL 
  AND v.Skills != ''
  AND CHAR_LENGTH(v.Skills) - CHAR_LENGTH(REPLACE(v.Skills, ',', '')) >= n.n - 1
  AND TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v.Skills, ',', n.n), ',', -1)) != '';

-- Link volunteers to their skills
INSERT IGNORE INTO VolunteerSkills (VolunteerID, SkillID, ProficiencyLevel)
SELECT DISTINCT 
    v.VolunteerID,
    s.SkillID,
    'Intermediate' as ProficiencyLevel
FROM Volunteers v
CROSS JOIN (
    SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
    UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
) n
JOIN Skills s ON s.SkillName = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v.Skills, ',', n.n), ',', -1))
WHERE v.Skills IS NOT NULL 
  AND v.Skills != ''
  AND CHAR_LENGTH(v.Skills) - CHAR_LENGTH(REPLACE(v.Skills, ',', '')) >= n.n - 1;

-- Migrate volunteer assignments to deployments
INSERT IGNORE INTO VolunteerDeployments (
    VolunteerID, DisasterID, ShelterID, Role, StartDate, EndDate, HoursWorked, Status, Notes
)
SELECT 
    va.VolunteerID,
    va.DisasterID,
    va.ShelterID,
    va.AssignedRole,
    va.AssignedDate,
    NULL as EndDate,
    va.HoursWorked,
    CASE 
        WHEN va.Status = 'Active' THEN 'Active'
        WHEN va.Status = 'Completed' THEN 'Completed'
        ELSE 'Cancelled'
    END as Status,
    NULL as Notes
FROM VolunteerAssignments va
WHERE NOT EXISTS (
    SELECT 1 FROM VolunteerDeployments vd 
    WHERE vd.VolunteerID = va.VolunteerID 
      AND vd.DisasterID = va.DisasterID 
      AND vd.StartDate = va.AssignedDate
);

-- =====================================================
-- 2. MIGRATE SHELTERS TO PARTNER FACILITIES
-- =====================================================

-- Create PartnerFacilities table if not exists
CREATE TABLE IF NOT EXISTS PartnerFacilities (
    FacilityID INT AUTO_INCREMENT PRIMARY KEY,
    FacilityName VARCHAR(255) NOT NULL,
    FacilityType ENUM('Shelter', 'Warehouse', 'Medical Center', 'Community Center', 'School', 'Other') DEFAULT 'Shelter',
    PartnerOrganization VARCHAR(255),
    ContactPerson VARCHAR(255),
    PhoneNumber VARCHAR(20),
    Email VARCHAR(255),
    Address TEXT,
    Province VARCHAR(100),
    District VARCHAR(100),
    Latitude DECIMAL(10, 8),
    Longitude DECIMAL(11, 8),
    Capacity INT DEFAULT 0,
    CurrentOccupancy INT DEFAULT 0,
    ActivationStatus ENUM('Available', 'Requested', 'Active', 'Inactive', 'Full') DEFAULT 'Available',
    Amenities TEXT,
    AccessibilityFeatures TEXT,
    OperatingHours VARCHAR(100),
    LastInspectionDate DATE,
    InspectionStatus ENUM('Passed', 'Failed', 'Pending', 'Not Inspected') DEFAULT 'Not Inspected',
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (FacilityType),
    INDEX idx_status (ActivationStatus),
    INDEX idx_province (Province)
);

-- Migrate shelters to partner facilities
INSERT INTO PartnerFacilities (
    FacilityName, FacilityType, ContactPerson, PhoneNumber, Address, 
    Province, Latitude, Longitude, Capacity, CurrentOccupancy, 
    ActivationStatus, Amenities, Notes, CreatedAt, UpdatedAt
)
SELECT 
    s.ShelterName,
    'Shelter' as FacilityType,
    s.ContactPerson,
    s.ContactNumber,
    s.Address,
    s.Province,
    s.Latitude,
    s.Longitude,
    s.Capacity,
    s.CurrentOccupancy,
    CASE 
        WHEN s.Status = 'Available' THEN 'Available'
        WHEN s.Status = 'Full' THEN 'Full'
        WHEN s.Status = 'Closed' THEN 'Inactive'
        WHEN s.Status = 'Under Maintenance' THEN 'Inactive'
        ELSE 'Available'
    END as ActivationStatus,
    CONCAT_WS(', ', 
        IF(s.WaterSupply = 1, 'Water Supply', NULL),
        IF(s.Electricity = 1, 'Electricity', NULL),
        IF(s.MedicalFacilities = 1, 'Medical Facilities', NULL),
        IF(s.SanitationFacilities = 1, 'Sanitation', NULL),
        IF(s.FoodStorage = 1, 'Food Storage', NULL)
    ) as Amenities,
    NULL as Notes,
    s.CreatedAt,
    s.UpdatedAt
FROM Shelters s
WHERE NOT EXISTS (
    SELECT 1 FROM PartnerFacilities pf 
    WHERE pf.FacilityName = s.ShelterName 
      AND pf.Address = s.Address
)
ON DUPLICATE KEY UPDATE
    Capacity = VALUES(Capacity),
    CurrentOccupancy = VALUES(CurrentOccupancy),
    ActivationStatus = VALUES(ActivationStatus);

-- Create FacilityActivations table for disaster-facility links
CREATE TABLE IF NOT EXISTS FacilityActivations (
    ActivationID INT AUTO_INCREMENT PRIMARY KEY,
    FacilityID INT NOT NULL,
    DisasterID INT NOT NULL,
    RequestedBy INT,
    RequestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ApprovedBy INT,
    ApprovedAt TIMESTAMP NULL,
    ActivatedAt TIMESTAMP NULL,
    DeactivatedAt TIMESTAMP NULL,
    Status ENUM('Requested', 'Approved', 'Active', 'Deactivated', 'Rejected') DEFAULT 'Requested',
    AllocatedCapacity INT,
    CurrentOccupancy INT DEFAULT 0,
    Notes TEXT,
    FOREIGN KEY (FacilityID) REFERENCES PartnerFacilities(FacilityID) ON DELETE CASCADE,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE CASCADE,
    INDEX idx_status (Status),
    INDEX idx_disaster (DisasterID)
);

-- Migrate disaster-shelter relationships
INSERT INTO FacilityActivations (
    FacilityID, DisasterID, Status, AllocatedCapacity, CurrentOccupancy, ActivatedAt
)
SELECT 
    pf.FacilityID,
    ds.DisasterID,
    CASE 
        WHEN ds.IsActive = 1 THEN 'Active'
        ELSE 'Deactivated'
    END as Status,
    ds.AllocatedCapacity,
    ds.CurrentOccupancy,
    ds.ActivatedAt
FROM DisasterShelters ds
JOIN Shelters s ON ds.ShelterID = s.ShelterID
JOIN PartnerFacilities pf ON pf.FacilityName = s.ShelterName AND pf.Address = s.Address
WHERE NOT EXISTS (
    SELECT 1 FROM FacilityActivations fa 
    WHERE fa.FacilityID = pf.FacilityID 
      AND fa.DisasterID = ds.DisasterID
)
ON DUPLICATE KEY UPDATE
    Status = VALUES(Status),
    CurrentOccupancy = VALUES(CurrentOccupancy);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check migration results
SELECT 'Volunteer Skills Migration' as MigrationType, COUNT(*) as Count FROM VolunteerSkills
UNION ALL
SELECT 'Skills Created', COUNT(*) FROM Skills
UNION ALL
SELECT 'Volunteer Deployments', COUNT(*) FROM VolunteerDeployments
UNION ALL
SELECT 'Partner Facilities', COUNT(*) FROM PartnerFacilities
UNION ALL
SELECT 'Facility Activations', COUNT(*) FROM FacilityActivations;

-- Show volunteer counts comparison
SELECT 
    'Old Volunteers Table' as Source,
    COUNT(*) as Total,
    SUM(CASE WHEN AvailabilityStatus = 'Available' THEN 1 ELSE 0 END) as Available
FROM Volunteers
UNION ALL
SELECT 
    'Enhanced (with skills)',
    COUNT(DISTINCT v.VolunteerID),
    SUM(CASE WHEN v.AvailabilityStatus = 'Available' THEN 1 ELSE 0 END)
FROM Volunteers v
LEFT JOIN VolunteerSkills vs ON v.VolunteerID = vs.VolunteerID;

-- Show shelter counts comparison
SELECT 
    'Old Shelters Table' as Source,
    COUNT(*) as Total,
    SUM(CASE WHEN Status = 'Available' THEN 1 ELSE 0 END) as Available
FROM Shelters
UNION ALL
SELECT 
    'Partner Facilities',
    COUNT(*),
    SUM(CASE WHEN ActivationStatus = 'Available' THEN 1 ELSE 0 END)
FROM PartnerFacilities
WHERE FacilityType = 'Shelter';

COMMIT;
