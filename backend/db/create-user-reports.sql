-- Create UserReports table for disaster warnings from users
CREATE TABLE IF NOT EXISTS UserReports (
  ReportID INT AUTO_INCREMENT PRIMARY KEY,
  UserName VARCHAR(100),
  UserEmail VARCHAR(100),
  UserPhone VARCHAR(20),
  ReportedLocation VARCHAR(255),
  DisasterType ENUM('Flood', 'Earthquake', 'Fire', 'Storm', 'Landslide', 'Tsunami', 'Drought', 'Other'),
  Severity ENUM('Minor', 'Moderate', 'Severe', 'Critical'),
  Description TEXT,
  ReportedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  Status ENUM('Pending', 'Verified', 'Dismissed', 'Escalated') DEFAULT 'Pending',
  AdminNotes TEXT,
  VerifiedBy VARCHAR(100),
  VerifiedAt DATETIME,
  Latitude DECIMAL(10,8),
  Longitude DECIMAL(11,8),
  INDEX idx_status (Status),
  INDEX idx_reported_at (ReportedAt),
  INDEX idx_disaster_type (DisasterType)
);
