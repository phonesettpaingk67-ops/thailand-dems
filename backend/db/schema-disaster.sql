-- DISASTER AND EMERGENCY MANAGEMENT SYSTEM (DEMS)
-- Complete database schema for disaster management

DROP DATABASE IF EXISTS disaster_management_db;
CREATE DATABASE disaster_management_db;
USE disaster_management_db;

-- 1. DISASTERS TABLE
-- Tracks natural and man-made disasters
CREATE TABLE Disasters (
    DisasterID INT AUTO_INCREMENT PRIMARY KEY,
    DisasterName VARCHAR(200) NOT NULL,
    DisasterType ENUM('Earthquake', 'Flood', 'Hurricane', 'Wildfire', 'Tsunami', 'Tornado', 'Drought', 'Landslide', 'Volcanic Eruption', 'Industrial Accident', 'Storm', 'Other') NOT NULL,
    Severity ENUM('Minor', 'Moderate', 'Severe', 'Catastrophic') NOT NULL,
    Description TEXT,
    AffectedRegion VARCHAR(255) NOT NULL,
    Latitude DECIMAL(10, 8),
    Longitude DECIMAL(11, 8),
    StartDate DATETIME NOT NULL,
    EndDate DATETIME,
    Status ENUM('Active', 'Contained', 'Recovery', 'Closed') DEFAULT 'Active',
    EstimatedAffectedPopulation INT DEFAULT 0,
    EstimatedDamage DECIMAL(15, 2),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (Status),
    INDEX idx_type (DisasterType),
    INDEX idx_severity (Severity),
    INDEX idx_region (AffectedRegion)
);

-- 2. SHELTERS TABLE
-- Emergency shelters and evacuation centers
CREATE TABLE Shelters (
    ShelterID INT AUTO_INCREMENT PRIMARY KEY,
    ShelterName VARCHAR(200) NOT NULL,
    ShelterType ENUM('Temporary', 'Permanent', 'Evacuation Center', 'Relief Camp', 'Community Center') NOT NULL,
    Address VARCHAR(255) NOT NULL,
    City VARCHAR(100) NOT NULL,
    Latitude DECIMAL(10, 8),
    Longitude DECIMAL(11, 8),
    Capacity INT NOT NULL,
    CurrentOccupancy INT DEFAULT 0,
    Status ENUM('Available', 'Full', 'Closed', 'Under Maintenance') DEFAULT 'Available',
    Facilities TEXT,
    ContactPerson VARCHAR(100),
    ContactPhone VARCHAR(20),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (Status),
    INDEX idx_city (City)
);

-- 3. DISASTER_SHELTERS TABLE
-- Links disasters to active shelters
CREATE TABLE DisasterShelters (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    DisasterID INT NOT NULL,
    ShelterID INT NOT NULL,
    ActivatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    DeactivatedAt DATETIME,
    PeakOccupancy INT DEFAULT 0,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE CASCADE,
    FOREIGN KEY (ShelterID) REFERENCES Shelters(ShelterID) ON DELETE CASCADE,
    UNIQUE KEY unique_disaster_shelter (DisasterID, ShelterID)
);

-- 4. RELIEF_SUPPLIES TABLE
-- Inventory of relief supplies and resources
CREATE TABLE ReliefSupplies (
    SupplyID INT AUTO_INCREMENT PRIMARY KEY,
    SupplyName VARCHAR(200) NOT NULL,
    Category ENUM('Food', 'Water', 'Medical', 'Clothing', 'Blankets', 'Shelter Materials', 'Hygiene Kits', 'Tools', 'Other') NOT NULL,
    Unit VARCHAR(50) NOT NULL,
    TotalQuantity DECIMAL(10, 2) DEFAULT 0,
    AllocatedQuantity DECIMAL(10, 2) DEFAULT 0,
    AvailableQuantity DECIMAL(10, 2) GENERATED ALWAYS AS (TotalQuantity - AllocatedQuantity) STORED,
    MinimumThreshold DECIMAL(10, 2) DEFAULT 0,
    StorageLocation VARCHAR(200),
    ExpiryDate DATE,
    Status ENUM('Available', 'Low Stock', 'Out of Stock', 'Expired') DEFAULT 'Available',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (Category),
    INDEX idx_status (Status)
);

-- 5. SUPPLY_DISTRIBUTIONS TABLE
-- Tracks distribution of supplies to disasters/shelters
CREATE TABLE SupplyDistributions (
    DistributionID INT AUTO_INCREMENT PRIMARY KEY,
    DisasterID INT,
    ShelterID INT,
    SupplyID INT NOT NULL,
    Quantity DECIMAL(10, 2) NOT NULL,
    DistributionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    DistributedBy VARCHAR(100),
    ReceivedBy VARCHAR(100),
    Notes TEXT,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE SET NULL,
    FOREIGN KEY (ShelterID) REFERENCES Shelters(ShelterID) ON DELETE SET NULL,
    FOREIGN KEY (SupplyID) REFERENCES ReliefSupplies(SupplyID) ON DELETE CASCADE,
    INDEX idx_disaster (DisasterID),
    INDEX idx_shelter (ShelterID),
    INDEX idx_date (DistributionDate)
);

-- 6. VOLUNTEERS TABLE
-- Volunteer workforce for disaster response
CREATE TABLE Volunteers (
    VolunteerID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(150) UNIQUE,
    Phone VARCHAR(20) NOT NULL,
    Skills TEXT,
    Certification VARCHAR(200),
    AvailabilityStatus ENUM('Available', 'Deployed', 'On Leave', 'Inactive') DEFAULT 'Available',
    TotalHoursContributed INT DEFAULT 0,
    EmergencyContact VARCHAR(100),
    EmergencyPhone VARCHAR(20),
    JoinedDate DATE NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (AvailabilityStatus),
    INDEX idx_name (LastName, FirstName)
);

-- 7. VOLUNTEER_ASSIGNMENTS TABLE
-- Assigns volunteers to disasters
CREATE TABLE VolunteerAssignments (
    AssignmentID INT AUTO_INCREMENT PRIMARY KEY,
    VolunteerID INT NOT NULL,
    DisasterID INT NOT NULL,
    ShelterID INT,
    Role VARCHAR(100) NOT NULL,
    AssignedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    CompletedDate DATETIME,
    HoursWorked INT DEFAULT 0,
    Status ENUM('Active', 'Completed', 'Cancelled') DEFAULT 'Active',
    Notes TEXT,
    FOREIGN KEY (VolunteerID) REFERENCES Volunteers(VolunteerID) ON DELETE CASCADE,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE CASCADE,
    FOREIGN KEY (ShelterID) REFERENCES Shelters(ShelterID) ON DELETE SET NULL,
    INDEX idx_volunteer (VolunteerID),
    INDEX idx_disaster (DisasterID),
    INDEX idx_status (Status)
);

-- 8. DAMAGE_ASSESSMENTS TABLE
-- Records damage assessments in affected areas
CREATE TABLE DamageAssessments (
    AssessmentID INT AUTO_INCREMENT PRIMARY KEY,
    DisasterID INT NOT NULL,
    Location VARCHAR(255) NOT NULL,
    AssessmentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    AssessedBy VARCHAR(100) NOT NULL,
    StructuralDamage ENUM('None', 'Minor', 'Moderate', 'Severe', 'Destroyed') DEFAULT 'None',
    Casualties INT DEFAULT 0,
    Injuries INT DEFAULT 0,
    DisplacedPersons INT DEFAULT 0,
    EstimatedCost DECIMAL(15, 2),
    Description TEXT,
    Photos TEXT,
    Status ENUM('Preliminary', 'Confirmed', 'Final') DEFAULT 'Preliminary',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE CASCADE,
    INDEX idx_disaster (DisasterID),
    INDEX idx_status (Status)
);

-- 9. AFFECTED_POPULATIONS TABLE
-- Tracks affected population data
CREATE TABLE AffectedPopulations (
    RecordID INT AUTO_INCREMENT PRIMARY KEY,
    DisasterID INT NOT NULL,
    Region VARCHAR(200) NOT NULL,
    TotalAffected INT DEFAULT 0,
    Displaced INT DEFAULT 0,
    Injured INT DEFAULT 0,
    Deceased INT DEFAULT 0,
    Missing INT DEFAULT 0,
    InShelters INT DEFAULT 0,
    NeedMedical INT DEFAULT 0,
    NeedFood INT DEFAULT 0,
    RecordedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE CASCADE,
    INDEX idx_disaster (DisasterID),
    INDEX idx_region (Region)
);

-- 10. RECOVERY_PROJECTS TABLE
-- Long-term recovery and rebuilding projects
CREATE TABLE RecoveryProjects (
    ProjectID INT AUTO_INCREMENT PRIMARY KEY,
    DisasterID INT NOT NULL,
    ProjectName VARCHAR(200) NOT NULL,
    ProjectType ENUM('Infrastructure', 'Housing', 'Healthcare', 'Education', 'Livelihood', 'Community Services', 'Other') NOT NULL,
    Description TEXT,
    Location VARCHAR(255) NOT NULL,
    Budget DECIMAL(15, 2),
    FundingSource VARCHAR(200),
    StartDate DATE,
    ExpectedEndDate DATE,
    ActualEndDate DATE,
    Status ENUM('Planned', 'In Progress', 'Completed', 'On Hold', 'Cancelled') DEFAULT 'Planned',
    ProjectManager VARCHAR(100),
    Beneficiaries INT DEFAULT 0,
    ProgressPercentage INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE CASCADE,
    INDEX idx_disaster (DisasterID),
    INDEX idx_status (Status),
    INDEX idx_type (ProjectType)
);

-- 11. ALERTS TABLE
-- Early warning alerts and notifications
CREATE TABLE Alerts (
    AlertID INT AUTO_INCREMENT PRIMARY KEY,
    AlertType ENUM('Early Warning', 'Evacuation', 'All Clear', 'Supply Request', 'Volunteer Needed', 'Other') NOT NULL,
    Severity ENUM('Info', 'Warning', 'Critical', 'Emergency') NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Message TEXT NOT NULL,
    AffectedRegion VARCHAR(255),
    IssuedBy VARCHAR(100) NOT NULL,
    IssuedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    ExpiresAt DATETIME,
    Status ENUM('Active', 'Expired', 'Cancelled') DEFAULT 'Active',
    DisasterID INT,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE SET NULL,
    INDEX idx_status (Status),
    INDEX idx_severity (Severity),
    INDEX idx_issued (IssuedAt)
);
