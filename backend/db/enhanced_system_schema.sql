-- =====================================================
-- ENHANCED DISASTER MANAGEMENT SYSTEM - COMPLETE SCHEMA
-- =====================================================
-- Comprehensive database for Multi-Agency Partnership, 
-- Enhanced Volunteers, Dynamic Shelters, Resource Intelligence,
-- and Emergency Response Tiers
-- =====================================================

USE disaster_management_db;

-- =====================================================
-- 1. AGENCY PARTNERSHIP SYSTEM
-- =====================================================

-- Agencies table (Government, NGO, International, Private Sector)
CREATE TABLE IF NOT EXISTS Agencies (
    AgencyID INT PRIMARY KEY AUTO_INCREMENT,
    AgencyName VARCHAR(255) NOT NULL,
    AgencyType ENUM('Government', 'NGO', 'International', 'Private Sector', 'Military', 'Medical') NOT NULL,
    ContactPerson VARCHAR(255),
    PhoneNumber VARCHAR(20),
    Email VARCHAR(255),
    Address TEXT,
    Province VARCHAR(100),
    Region VARCHAR(100),
    ResponseCapability TEXT, -- What they can provide
    ActivationTime INT, -- Hours needed to mobilize
    Status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_agency_type (AgencyType),
    INDEX idx_province (Province),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MOU (Memorandum of Understanding) tracking
CREATE TABLE IF NOT EXISTS AgencyMOU (
    MOUID INT PRIMARY KEY AUTO_INCREMENT,
    AgencyID INT NOT NULL,
    MOUTitle VARCHAR(255) NOT NULL,
    SignedDate DATE,
    ExpiryDate DATE,
    DocumentPath VARCHAR(500),
    ResourcesPledged TEXT, -- JSON or text describing pledged resources
    TermsAndConditions TEXT,
    Status ENUM('Active', 'Expired', 'Pending Renewal', 'Cancelled') DEFAULT 'Active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AgencyID) REFERENCES Agencies(AgencyID) ON DELETE CASCADE,
    INDEX idx_agency (AgencyID),
    INDEX idx_status (Status),
    INDEX idx_expiry (ExpiryDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Agency Resource Pledges (what agencies can provide)
CREATE TABLE IF NOT EXISTS AgencyResources (
    ResourceID INT PRIMARY KEY AUTO_INCREMENT,
    AgencyID INT NOT NULL,
    ResourceType ENUM('Volunteers', 'Shelter Space', 'Medical Supplies', 'Food', 'Water', 'Transport', 'Equipment', 'Financial', 'Other') NOT NULL,
    ResourceName VARCHAR(255) NOT NULL,
    Quantity INT,
    Unit VARCHAR(50), -- e.g., 'beds', 'people', 'vehicles', 'THB'
    AvailabilityStatus ENUM('Available', 'Deployed', 'Reserved', 'Unavailable') DEFAULT 'Available',
    DeploymentTime INT, -- Hours to deploy
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (AgencyID) REFERENCES Agencies(AgencyID) ON DELETE CASCADE,
    INDEX idx_agency (AgencyID),
    INDEX idx_type (ResourceType),
    INDEX idx_status (AvailabilityStatus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Agency Activation (when agencies are called into action)
CREATE TABLE IF NOT EXISTS AgencyActivations (
    ActivationID INT PRIMARY KEY AUTO_INCREMENT,
    DisasterID INT NOT NULL,
    AgencyID INT NOT NULL,
    RequestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ActivatedAt TIMESTAMP NULL,
    Status ENUM('Requested', 'Confirmed', 'Deployed', 'Completed', 'Cancelled') DEFAULT 'Requested',
    ResourcesDeployed TEXT, -- What they actually provided
    PersonnelDeployed INT,
    Notes TEXT,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE CASCADE,
    FOREIGN KEY (AgencyID) REFERENCES Agencies(AgencyID) ON DELETE CASCADE,
    INDEX idx_disaster (DisasterID),
    INDEX idx_agency (AgencyID),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 2. ENHANCED VOLUNTEER SYSTEM
-- =====================================================

-- Volunteer Skills (many-to-many with Volunteers)
CREATE TABLE IF NOT EXISTS Skills (
    SkillID INT PRIMARY KEY AUTO_INCREMENT,
    SkillName VARCHAR(100) NOT NULL UNIQUE,
    Category ENUM('Medical', 'Logistics', 'Communication', 'Construction', 'Food Service', 'Translation', 'Technical', 'Administrative', 'Other') NOT NULL,
    Description TEXT,
    RequiresCertification BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Junction table for Volunteer Skills
CREATE TABLE IF NOT EXISTS VolunteerSkills (
    VolunteerID INT NOT NULL,
    SkillID INT NOT NULL,
    ProficiencyLevel ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') DEFAULT 'Intermediate',
    CertificationNumber VARCHAR(100),
    CertifiedDate DATE,
    ExpiryDate DATE,
    PRIMARY KEY (VolunteerID, SkillID),
    FOREIGN KEY (VolunteerID) REFERENCES Volunteers(VolunteerID) ON DELETE CASCADE,
    FOREIGN KEY (SkillID) REFERENCES Skills(SkillID) ON DELETE CASCADE,
    INDEX idx_skill (SkillID),
    INDEX idx_proficiency (ProficiencyLevel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Volunteer Availability Calendar
CREATE TABLE IF NOT EXISTS VolunteerAvailability (
    AvailabilityID INT PRIMARY KEY AUTO_INCREMENT,
    VolunteerID INT NOT NULL,
    AvailableFrom DATE NOT NULL,
    AvailableTo DATE NOT NULL,
    DaysOfWeek VARCHAR(50), -- e.g., 'Mon,Wed,Fri' or 'All'
    Status ENUM('Available', 'On Deployment', 'Unavailable', 'On Leave') DEFAULT 'Available',
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (VolunteerID) REFERENCES Volunteers(VolunteerID) ON DELETE CASCADE,
    INDEX idx_volunteer (VolunteerID),
    INDEX idx_dates (AvailableFrom, AvailableTo),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Volunteer Training Programs
CREATE TABLE IF NOT EXISTS TrainingPrograms (
    TrainingID INT PRIMARY KEY AUTO_INCREMENT,
    TrainingName VARCHAR(255) NOT NULL,
    Category ENUM('First Aid', 'Search and Rescue', 'Disaster Management', 'Communication', 'Logistics', 'Leadership', 'Other') NOT NULL,
    Duration INT, -- Hours
    Description TEXT,
    CertificationValid INT, -- Months valid
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Volunteer Training Completion
CREATE TABLE IF NOT EXISTS VolunteerTraining (
    VolunteerID INT NOT NULL,
    TrainingID INT NOT NULL,
    CompletedDate DATE NOT NULL,
    ExpiryDate DATE,
    Score INT,
    CertificateNumber VARCHAR(100),
    Status ENUM('Valid', 'Expired', 'Pending Renewal') DEFAULT 'Valid',
    PRIMARY KEY (VolunteerID, TrainingID, CompletedDate),
    FOREIGN KEY (VolunteerID) REFERENCES Volunteers(VolunteerID) ON DELETE CASCADE,
    FOREIGN KEY (TrainingID) REFERENCES TrainingPrograms(TrainingID) ON DELETE CASCADE,
    INDEX idx_volunteer (VolunteerID),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Volunteer Deployment History
CREATE TABLE IF NOT EXISTS VolunteerDeployments (
    DeploymentID INT PRIMARY KEY AUTO_INCREMENT,
    VolunteerID INT NOT NULL,
    DisasterID INT NOT NULL,
    DeployedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReturnedAt TIMESTAMP NULL,
    Role VARCHAR(100),
    Location VARCHAR(255),
    PerformanceRating INT, -- 1-5 scale
    Notes TEXT,
    Status ENUM('Deployed', 'Completed', 'Recalled', 'Unavailable') DEFAULT 'Deployed',
    FOREIGN KEY (VolunteerID) REFERENCES Volunteers(VolunteerID) ON DELETE CASCADE,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE CASCADE,
    INDEX idx_volunteer (VolunteerID),
    INDEX idx_disaster (DisasterID),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Volunteer Recruitment Campaigns
CREATE TABLE IF NOT EXISTS RecruitmentCampaigns (
    CampaignID INT PRIMARY KEY AUTO_INCREMENT,
    CampaignName VARCHAR(255) NOT NULL,
    DisasterID INT, -- Can be linked to specific disaster or general
    TargetVolunteers INT,
    RequiredSkills TEXT, -- JSON array of skill IDs
    StartDate DATE NOT NULL,
    EndDate DATE,
    Status ENUM('Active', 'Completed', 'Cancelled') DEFAULT 'Active',
    VolunteersRecruited INT DEFAULT 0,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE SET NULL,
    INDEX idx_status (Status),
    INDEX idx_disaster (DisasterID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 3. DYNAMIC SHELTER NETWORK
-- =====================================================

-- Expand Shelters table with type classification
ALTER TABLE Shelters 
ADD COLUMN ShelterType ENUM('Primary', 'Secondary', 'Temporary', 'Host Family') DEFAULT 'Primary',
ADD COLUMN PartnerAgencyID INT NULL,
ADD COLUMN ActivationRequired BOOLEAN DEFAULT FALSE,
ADD COLUMN ActivationTime INT DEFAULT 0, -- Hours to activate
ADD COLUMN Amenities TEXT, -- JSON: medical, food, water, electricity, etc.
ADD COLUMN Accessibility TEXT, -- wheelchair, elderly-friendly, etc.
ADD COLUMN CurrentOccupancy INT DEFAULT 0,
ADD COLUMN LastInspectionDate DATE,
ADD INDEX idx_shelter_type (ShelterType),
ADD INDEX idx_partner_agency (PartnerAgencyID),
ADD CONSTRAINT fk_shelter_agency FOREIGN KEY (PartnerAgencyID) REFERENCES Agencies(AgencyID) ON DELETE SET NULL;

-- Partner Facilities (Schools, Hotels, Temples, Community Centers)
CREATE TABLE IF NOT EXISTS PartnerFacilities (
    FacilityID INT PRIMARY KEY AUTO_INCREMENT,
    FacilityName VARCHAR(255) NOT NULL,
    FacilityType ENUM('School', 'University', 'Temple', 'Hotel', 'Community Center', 'Sports Complex', 'Government Building', 'Other') NOT NULL,
    PartnerAgencyID INT,
    Address TEXT NOT NULL,
    Province VARCHAR(100),
    Region VARCHAR(100),
    Latitude DECIMAL(10, 8),
    Longitude DECIMAL(11, 8),
    MaxCapacity INT NOT NULL,
    ActivationAgreement BOOLEAN DEFAULT FALSE, -- Has agreement to use as shelter
    ActivationTime INT, -- Hours needed to convert to shelter
    ContactPerson VARCHAR(255),
    PhoneNumber VARCHAR(20),
    Amenities TEXT,
    Status ENUM('Available', 'Activated', 'Unavailable', 'Under Maintenance') DEFAULT 'Available',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (PartnerAgencyID) REFERENCES Agencies(AgencyID) ON DELETE SET NULL,
    INDEX idx_type (FacilityType),
    INDEX idx_province (Province),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Host Family Network
CREATE TABLE IF NOT EXISTS HostFamilies (
    HostFamilyID INT PRIMARY KEY AUTO_INCREMENT,
    FamilyName VARCHAR(255) NOT NULL,
    ContactPerson VARCHAR(255) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    Email VARCHAR(255),
    Address TEXT NOT NULL,
    Province VARCHAR(100),
    District VARCHAR(100),
    MaxGuests INT NOT NULL,
    CurrentGuests INT DEFAULT 0,
    PreferredGuestType VARCHAR(255), -- e.g., 'families with children', 'elderly', 'any'
    LanguagesSpoken VARCHAR(255),
    Amenities TEXT,
    BackgroundCheckStatus ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
    VerifiedDate DATE,
    Status ENUM('Active', 'Inactive', 'Full', 'Suspended') DEFAULT 'Active',
    Rating DECIMAL(3,2), -- Average rating from guests
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_province (Province),
    INDEX idx_status (Status),
    INDEX idx_verified (BackgroundCheckStatus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Shelter Activation Requests
CREATE TABLE IF NOT EXISTS ShelterActivationRequests (
    RequestID INT PRIMARY KEY AUTO_INCREMENT,
    DisasterID INT NOT NULL,
    FacilityID INT, -- From PartnerFacilities
    ShelterID INT, -- From Shelters (for secondary/temporary)
    RequestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ActivatedAt TIMESTAMP NULL,
    ExpectedCapacity INT,
    ActualCapacity INT,
    Status ENUM('Requested', 'Approved', 'Activated', 'Declined', 'Deactivated') DEFAULT 'Requested',
    RequestedBy VARCHAR(255),
    Notes TEXT,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE CASCADE,
    FOREIGN KEY (FacilityID) REFERENCES PartnerFacilities(FacilityID) ON DELETE SET NULL,
    FOREIGN KEY (ShelterID) REFERENCES Shelters(ShelterID) ON DELETE SET NULL,
    INDEX idx_disaster (DisasterID),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 4. RESOURCE ALLOCATION INTELLIGENCE
-- =====================================================

-- Capacity Alerts (Auto-generated warnings)
CREATE TABLE IF NOT EXISTS CapacityAlerts (
    AlertID INT PRIMARY KEY AUTO_INCREMENT,
    DisasterID INT NOT NULL,
    AlertType ENUM('Shelter Shortage', 'Volunteer Shortage', 'Supply Shortage', 'Medical Shortage', 'Transport Shortage') NOT NULL,
    Severity ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
    CurrentCapacity INT,
    RequiredCapacity INT,
    Gap INT, -- Shortage amount
    GapPercentage DECIMAL(5,2),
    Recommendations TEXT, -- Auto-generated suggestions
    Status ENUM('Active', 'Resolved', 'Acknowledged') DEFAULT 'Active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ResolvedAt TIMESTAMP NULL,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE CASCADE,
    INDEX idx_disaster (DisasterID),
    INDEX idx_type (AlertType),
    INDEX idx_severity (Severity),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Resource Allocation Requests (Auto-generated or manual)
CREATE TABLE IF NOT EXISTS ResourceRequests (
    RequestID INT PRIMARY KEY AUTO_INCREMENT,
    DisasterID INT NOT NULL,
    ResourceType ENUM('Volunteers', 'Shelter Space', 'Medical Supplies', 'Food', 'Water', 'Transport', 'Equipment', 'Other') NOT NULL,
    QuantityNeeded INT NOT NULL,
    Priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
    RequestedBy VARCHAR(255),
    RequiredBy DATETIME, -- When needed
    Status ENUM('Pending', 'Approved', 'Fulfilled', 'Partially Fulfilled', 'Cancelled') DEFAULT 'Pending',
    QuantityFulfilled INT DEFAULT 0,
    AllocatedAgencies TEXT, -- JSON of agency IDs fulfilling this
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE CASCADE,
    INDEX idx_disaster (DisasterID),
    INDEX idx_type (ResourceType),
    INDEX idx_priority (Priority),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Smart Recommendations (AI-like suggestions)
CREATE TABLE IF NOT EXISTS SmartRecommendations (
    RecommendationID INT PRIMARY KEY AUTO_INCREMENT,
    DisasterID INT NOT NULL,
    RecommendationType ENUM('Activate Shelter', 'Request Volunteers', 'Contact Agency', 'Escalate Tier', 'Deploy Resources', 'Evacuate Area') NOT NULL,
    Priority INT NOT NULL, -- 1 = highest
    RecommendationText TEXT NOT NULL,
    ActionRequired TEXT,
    EstimatedImpact TEXT, -- e.g., '+5000 shelter capacity'
    Status ENUM('Pending', 'Implemented', 'Dismissed', 'Deferred') DEFAULT 'Pending',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ImplementedAt TIMESTAMP NULL,
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE CASCADE,
    INDEX idx_disaster (DisasterID),
    INDEX idx_type (RecommendationType),
    INDEX idx_status (Status),
    INDEX idx_priority (Priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 5. EMERGENCY RESPONSE TIERS
-- =====================================================

-- Add ResponseTier to Disasters table
ALTER TABLE Disasters 
ADD COLUMN ResponseTier ENUM('Tier 1 - Local', 'Tier 2 - Regional', 'Tier 3 - National', 'Tier 4 - International') DEFAULT 'Tier 1 - Local',
ADD COLUMN EscalationHistory TEXT, -- JSON log of tier changes
ADD COLUMN CommandCenter VARCHAR(255),
ADD INDEX idx_response_tier (ResponseTier);

-- Response Tier Definitions
CREATE TABLE IF NOT EXISTS ResponseTierDefinitions (
    TierID INT PRIMARY KEY AUTO_INCREMENT,
    TierLevel INT NOT NULL UNIQUE,
    TierName VARCHAR(100) NOT NULL,
    TriggerCriteria TEXT NOT NULL, -- When to activate this tier
    ResourcesAvailable TEXT, -- What resources are available at this tier
    AgenciesInvolved TEXT, -- Which agencies activate
    CommandStructure TEXT,
    EscalationThreshold TEXT, -- When to escalate to next tier
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tier Escalation Log
CREATE TABLE IF NOT EXISTS TierEscalations (
    EscalationID INT PRIMARY KEY AUTO_INCREMENT,
    DisasterID INT NOT NULL,
    FromTier VARCHAR(50) NOT NULL,
    ToTier VARCHAR(50) NOT NULL,
    EscalatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    EscalatedBy VARCHAR(255),
    Reason TEXT NOT NULL,
    AutoEscalation BOOLEAN DEFAULT FALSE, -- Was it auto or manual
    Criteria TEXT, -- What criteria triggered it
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE CASCADE,
    INDEX idx_disaster (DisasterID),
    INDEX idx_to_tier (ToTier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tier Resource Deployment
CREATE TABLE IF NOT EXISTS TierResourceDeployments (
    DeploymentID INT PRIMARY KEY AUTO_INCREMENT,
    DisasterID INT NOT NULL,
    TierLevel INT NOT NULL,
    ResourceType VARCHAR(100) NOT NULL,
    ResourceDescription TEXT,
    Quantity INT,
    DeployedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Deployed', 'Active', 'Withdrawn', 'Completed') DEFAULT 'Deployed',
    FOREIGN KEY (DisasterID) REFERENCES Disasters(DisasterID) ON DELETE CASCADE,
    INDEX idx_disaster (DisasterID),
    INDEX idx_tier (TierLevel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample tier definitions
INSERT INTO ResponseTierDefinitions (TierLevel, TierName, TriggerCriteria, ResourcesAvailable, AgenciesInvolved, EscalationThreshold, Description) VALUES
(1, 'Tier 1 - Local', 'Affected population < 5,000; Single district; Damage < 50M THB', 'Local shelters, district volunteers, local supplies', 'District Disaster Prevention Office, Local Police, Municipal services', 'Population > 5,000 OR Multi-district OR Damage > 50M', 'Local response with district-level resources'),
(2, 'Tier 2 - Regional', 'Affected population 5,000-50,000; Multi-district; Damage 50M-500M THB', 'Provincial shelters, regional volunteers, DDPM support, mobile units', 'Provincial DDPM, Red Cross, Provincial Police, Public Health, Military (if needed)', 'Population > 50,000 OR Multi-province OR Damage > 500M', 'Provincial/regional coordination with enhanced resources'),
(3, 'Tier 3 - National', 'Affected population 50,000+; Multi-province; Damage 500M+ THB; Critical infrastructure', 'All national resources, military, national stockpiles, emergency budget', 'National DDPM, Armed Forces, Ministry of Interior, Ministry of Public Health, All national agencies', 'Cannot meet needs OR International assistance required', 'Full national mobilization, prime minister oversight'),
(4, 'Tier 4 - International', 'Catastrophic; Exceeds national capacity; International declaration', 'UN agencies, international NGOs, foreign aid, global resources', 'UN OCHA, ASEAN AHA Centre, International Red Cross, Foreign governments', 'None (highest tier)', 'International humanitarian response, global coordination');

-- Insert sample skills
INSERT INTO Skills (SkillName, Category, RequiresCertification) VALUES
('First Aid & CPR', 'Medical', TRUE),
('Emergency Medical Technician', 'Medical', TRUE),
('Nursing', 'Medical', TRUE),
('Search and Rescue', 'Technical', TRUE),
('Heavy Equipment Operation', 'Technical', TRUE),
('Logistics Coordination', 'Logistics', FALSE),
('Warehouse Management', 'Logistics', FALSE),
('Thai-English Translation', 'Communication', FALSE),
('Radio Communication', 'Communication', TRUE),
('Cooking (Large Scale)', 'Food Service', FALSE),
('Carpentry', 'Construction', FALSE),
('Electrical Work', 'Construction', TRUE),
('Counseling & Psychological Support', 'Medical', TRUE),
('Data Entry', 'Administrative', FALSE),
('Drone Operation', 'Technical', TRUE);

-- Insert sample training programs
INSERT INTO TrainingPrograms (TrainingName, Category, Duration, CertificationValid) VALUES
('Basic Disaster Response', 'Disaster Management', 16, 24),
('Advanced First Aid', 'First Aid', 24, 24),
('Search and Rescue Level 1', 'Search and Rescue', 40, 36),
('Incident Command System', 'Leadership', 24, 36),
('Emergency Communication', 'Communication', 16, 24),
('Mass Care and Shelter Management', 'Logistics', 20, 24);

-- Insert sample agencies
INSERT INTO Agencies (AgencyName, AgencyType, ContactPerson, PhoneNumber, Email, Province, Region, ResponseCapability, ActivationTime, Status) VALUES
('Department of Disaster Prevention and Mitigation (DDPM)', 'Government', 'Director General', '02-123-4567', 'contact@ddpm.go.th', 'Bangkok', 'Central', 'National coordination, emergency budget, disaster planning', 2, 'Active'),
('Thai Red Cross Society', 'NGO', 'Secretary General', '02-256-4055', 'info@redcross.or.th', 'Bangkok', 'Central', 'Medical aid, shelters, volunteers, supplies', 4, 'Active'),
('Royal Thai Army - Civil Affairs', 'Military', 'Commanding Officer', '02-xxx-xxxx', 'civilaffairs@army.mil.th', 'Bangkok', 'Central', 'Heavy equipment, transport, personnel, mobile hospitals', 6, 'Active'),
('UN OCHA Thailand', 'International', 'Country Director', '02-xxx-xxxx', 'ochathailand@un.org', 'Bangkok', 'Central', 'International coordination, funding, technical support', 24, 'Active'),
('CP ALL (7-Eleven)', 'Private Sector', 'CSR Manager', '02-xxx-xxxx', 'csr@cpall.co.th', 'Bangkok', 'Central', 'Food supplies, water, logistics network, distribution', 12, 'Active'),
('Bangkok Metropolitan Administration', 'Government', 'Governor', '02-224-4141', 'contact@bangkok.go.th', 'Bangkok', 'Central', 'Municipal shelters, transport, local coordination', 4, 'Active'),
('Chulalongkorn University', 'NGO', 'Rector Office', '02-215-3555', 'rector@chula.ac.th', 'Bangkok', 'Central', 'Shelter space (10,000 capacity), medical students, research support', 8, 'Active'),
('ASEAN Coordinating Centre for Humanitarian Assistance', 'International', 'Executive Director', '+62-xxx-xxxx', 'info@ahacentre.org', 'Bangkok', 'Central', 'Regional coordination, rapid assessment, early warning', 48, 'Active');

COMMIT;
