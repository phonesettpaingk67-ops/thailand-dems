-- Modern Emergency Response Management System Database Schema
-- Redesigned for better workflow, status tracking, and real-time operations

-- Drop existing tables
DROP TABLE IF EXISTS `Tasks`;
DROP TABLE IF EXISTS `Communications`;
DROP TABLE IF EXISTS `Resources`;
DROP TABLE IF EXISTS `Responders`;
DROP TABLE IF EXISTS `Incidents`;
DROP TABLE IF EXISTS `Locations`;
DROP TABLE IF EXISTS `Teams`;

-- Teams (Modern replacement for Agencies)
CREATE TABLE `Teams` (
  `TeamID` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(100) NOT NULL,
  `Type` ENUM('Fire', 'Medical', 'Police', 'Rescue', 'Hazmat', 'Support') NOT NULL,
  `ContactPhone` VARCHAR(20),
  `ContactEmail` VARCHAR(100),
  `Status` ENUM('Active', 'Standby', 'Offline') DEFAULT 'Active',
  `MemberCount` INT DEFAULT 0,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`Status`),
  INDEX `idx_type` (`Type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Locations (Enhanced with zones)
CREATE TABLE `Locations` (
  `LocationID` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(150) NOT NULL,
  `Address` VARCHAR(300),
  `City` VARCHAR(100),
  `State` VARCHAR(50),
  `ZipCode` VARCHAR(20),
  `Latitude` DECIMAL(10, 8),
  `Longitude` DECIMAL(11, 8),
  `Zone` ENUM('North', 'South', 'East', 'West', 'Central') DEFAULT 'Central',
  `Type` ENUM('Residential', 'Commercial', 'Industrial', 'Public', 'Other') DEFAULT 'Other',
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_zone` (`Zone`),
  INDEX `idx_type` (`Type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Incidents (Core entity with enhanced tracking)
CREATE TABLE `Incidents` (
  `IncidentID` INT AUTO_INCREMENT PRIMARY KEY,
  `Title` VARCHAR(200) NOT NULL,
  `Description` TEXT,
  `Type` ENUM('Fire', 'Medical', 'Accident', 'Natural Disaster', 'Hazmat', 'Security', 'Other') NOT NULL,
  `Priority` ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  `Status` ENUM('Reported', 'Dispatched', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Reported',
  `LocationID` INT,
  `ReportedBy` VARCHAR(150),
  `ReportedPhone` VARCHAR(20),
  `TeamID` INT,
  `EstimatedCasualties` INT DEFAULT 0,
  `ReportedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `DispatchedAt` TIMESTAMP NULL,
  `ResolvedAt` TIMESTAMP NULL,
  `ClosedAt` TIMESTAMP NULL,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`LocationID`) REFERENCES `Locations`(`LocationID`) ON DELETE SET NULL,
  FOREIGN KEY (`TeamID`) REFERENCES `Teams`(`TeamID`) ON DELETE SET NULL,
  INDEX `idx_status` (`Status`),
  INDEX `idx_priority` (`Priority`),
  INDEX `idx_type` (`Type`),
  INDEX `idx_reported_at` (`ReportedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Responders (Personnel with availability)
CREATE TABLE `Responders` (
  `ResponderID` INT AUTO_INCREMENT PRIMARY KEY,
  `FirstName` VARCHAR(100) NOT NULL,
  `LastName` VARCHAR(100) NOT NULL,
  `Badge` VARCHAR(50) UNIQUE,
  `Role` ENUM('Firefighter', 'Paramedic', 'Police Officer', 'Rescue Specialist', 'Coordinator', 'Support Staff') NOT NULL,
  `TeamID` INT,
  `Phone` VARCHAR(20),
  `Email` VARCHAR(100),
  `Status` ENUM('Available', 'On Duty', 'Off Duty', 'Unavailable') DEFAULT 'Available',
  `CertificationLevel` ENUM('Basic', 'Intermediate', 'Advanced', 'Expert') DEFAULT 'Basic',
  `YearsOfExperience` INT DEFAULT 0,
  `CurrentIncidentID` INT NULL,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`TeamID`) REFERENCES `Teams`(`TeamID`) ON DELETE SET NULL,
  FOREIGN KEY (`CurrentIncidentID`) REFERENCES `Incidents`(`IncidentID`) ON DELETE SET NULL,
  INDEX `idx_status` (`Status`),
  INDEX `idx_role` (`Role`),
  INDEX `idx_team` (`TeamID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Resources (Equipment and vehicles)
CREATE TABLE `Resources` (
  `ResourceID` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(150) NOT NULL,
  `Type` ENUM('Vehicle', 'Equipment', 'Medical Supply', 'Communication Device', 'Other') NOT NULL,
  `Category` VARCHAR(100),
  `Quantity` INT DEFAULT 1,
  `Status` ENUM('Available', 'In Use', 'Maintenance', 'Damaged') DEFAULT 'Available',
  `TeamID` INT,
  `CurrentIncidentID` INT NULL,
  `LastMaintenanceDate` DATE NULL,
  `Notes` TEXT,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`TeamID`) REFERENCES `Teams`(`TeamID`) ON DELETE SET NULL,
  FOREIGN KEY (`CurrentIncidentID`) REFERENCES `Incidents`(`IncidentID`) ON DELETE SET NULL,
  INDEX `idx_status` (`Status`),
  INDEX `idx_type` (`Type`),
  INDEX `idx_team` (`TeamID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Communications (Activity log)
CREATE TABLE `Communications` (
  `CommunicationID` INT AUTO_INCREMENT PRIMARY KEY,
  `IncidentID` INT NOT NULL,
  `Message` TEXT NOT NULL,
  `Type` ENUM('Status Update', 'Request', 'Alert', 'Note', 'System') DEFAULT 'Note',
  `Priority` ENUM('Low', 'Normal', 'High', 'Urgent') DEFAULT 'Normal',
  `CreatedBy` VARCHAR(150),
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`IncidentID`) REFERENCES `Incidents`(`IncidentID`) ON DELETE CASCADE,
  INDEX `idx_incident` (`IncidentID`),
  INDEX `idx_created_at` (`CreatedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tasks (Action items with assignment)
CREATE TABLE `Tasks` (
  `TaskID` INT AUTO_INCREMENT PRIMARY KEY,
  `IncidentID` INT NOT NULL,
  `Title` VARCHAR(200) NOT NULL,
  `Description` TEXT,
  `AssignedTo` INT NULL,
  `Status` ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
  `Priority` ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  `DueDate` TIMESTAMP NULL,
  `CompletedAt` TIMESTAMP NULL,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`IncidentID`) REFERENCES `Incidents`(`IncidentID`) ON DELETE CASCADE,
  FOREIGN KEY (`AssignedTo`) REFERENCES `Responders`(`ResponderID`) ON DELETE SET NULL,
  INDEX `idx_incident` (`IncidentID`),
  INDEX `idx_assigned` (`AssignedTo`),
  INDEX `idx_status` (`Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
