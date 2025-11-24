-- Emergency Response Management System Database Schema

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS `Log`;
DROP TABLE IF EXISTS `Assignment`;
DROP TABLE IF EXISTS `Victim`;
DROP TABLE IF EXISTS `Shelter`;
DROP TABLE IF EXISTS `Personnel`;
DROP TABLE IF EXISTS `Resource`;
DROP TABLE IF EXISTS `Incident`;
DROP TABLE IF EXISTS `ResourceType`;
DROP TABLE IF EXISTS `IncidentType`;
DROP TABLE IF EXISTS `Location`;
DROP TABLE IF EXISTS `Agency`;

-- Create Agency table
CREATE TABLE `Agency` (
  `AgencyID` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(255) NOT NULL,
  `ContactInfo` VARCHAR(255),
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Location table
CREATE TABLE `Location` (
  `LocationID` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(255) NOT NULL,
  `Address` VARCHAR(500),
  `Latitude` DECIMAL(10, 8),
  `Longitude` DECIMAL(11, 8),
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create IncidentType table
CREATE TABLE `IncidentType` (
  `IncidentTypeID` INT AUTO_INCREMENT PRIMARY KEY,
  `TypeName` VARCHAR(255) NOT NULL,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ResourceType table
CREATE TABLE `ResourceType` (
  `ResourceTypeID` INT AUTO_INCREMENT PRIMARY KEY,
  `TypeName` VARCHAR(255) NOT NULL,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Incident table
CREATE TABLE `Incident` (
  `IncidentID` INT AUTO_INCREMENT PRIMARY KEY,
  `Description` TEXT,
  `StartDate` DATETIME NOT NULL,
  `EndDate` DATETIME,
  `LocationID` INT,
  `AgencyID` INT,
  `IncidentTypeID` INT,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`LocationID`) REFERENCES `Location`(`LocationID`) ON DELETE SET NULL,
  FOREIGN KEY (`AgencyID`) REFERENCES `Agency`(`AgencyID`) ON DELETE SET NULL,
  FOREIGN KEY (`IncidentTypeID`) REFERENCES `IncidentType`(`IncidentTypeID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Resource table
CREATE TABLE `Resource` (
  `ResourceID` INT AUTO_INCREMENT PRIMARY KEY,
  `ResourceTypeID` INT,
  `Name` VARCHAR(255) NOT NULL,
  `Quantity` INT DEFAULT 0,
  `Status` VARCHAR(100) DEFAULT 'Available',
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`ResourceTypeID`) REFERENCES `ResourceType`(`ResourceTypeID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Personnel table
CREATE TABLE `Personnel` (
  `PersonnelID` INT AUTO_INCREMENT PRIMARY KEY,
  `FirstName` VARCHAR(100) NOT NULL,
  `LastName` VARCHAR(100) NOT NULL,
  `Role` VARCHAR(100),
  `AgencyID` INT,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`AgencyID`) REFERENCES `Agency`(`AgencyID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Shelter table
CREATE TABLE `Shelter` (
  `ShelterID` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(255) NOT NULL,
  `Capacity` INT DEFAULT 0,
  `LocationID` INT,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`LocationID`) REFERENCES `Location`(`LocationID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Victim table
CREATE TABLE `Victim` (
  `VictimID` INT AUTO_INCREMENT PRIMARY KEY,
  `IncidentID` INT,
  `FirstName` VARCHAR(100) NOT NULL,
  `LastName` VARCHAR(100) NOT NULL,
  `Age` INT,
  `Gender` VARCHAR(20),
  `Condition` VARCHAR(100),
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`IncidentID`) REFERENCES `Incident`(`IncidentID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Assignment table
CREATE TABLE `Assignment` (
  `AssignmentID` INT AUTO_INCREMENT PRIMARY KEY,
  `IncidentID` INT,
  `PersonnelID` INT,
  `Task` TEXT,
  `Status` VARCHAR(100) DEFAULT 'Pending',
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`IncidentID`) REFERENCES `Incident`(`IncidentID`) ON DELETE CASCADE,
  FOREIGN KEY (`PersonnelID`) REFERENCES `Personnel`(`PersonnelID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Log table
CREATE TABLE `Log` (
  `LogID` INT AUTO_INCREMENT PRIMARY KEY,
  `IncidentID` INT,
  `LogDate` DATETIME NOT NULL,
  `Details` TEXT,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`IncidentID`) REFERENCES `Incident`(`IncidentID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better query performance
CREATE INDEX idx_incident_location ON `Incident`(`LocationID`);
CREATE INDEX idx_incident_agency ON `Incident`(`AgencyID`);
CREATE INDEX idx_incident_type ON `Incident`(`IncidentTypeID`);
CREATE INDEX idx_resource_type ON `Resource`(`ResourceTypeID`);
CREATE INDEX idx_personnel_agency ON `Personnel`(`AgencyID`);
CREATE INDEX idx_shelter_location ON `Shelter`(`LocationID`);
CREATE INDEX idx_victim_incident ON `Victim`(`IncidentID`);
CREATE INDEX idx_assignment_incident ON `Assignment`(`IncidentID`);
CREATE INDEX idx_assignment_personnel ON `Assignment`(`PersonnelID`);
CREATE INDEX idx_log_incident ON `Log`(`IncidentID`);
