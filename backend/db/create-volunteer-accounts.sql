-- Create VolunteerAccounts table for volunteer authentication
CREATE TABLE IF NOT EXISTS VolunteerAccounts (
    AccountID INT PRIMARY KEY AUTO_INCREMENT,
    VolunteerID INT NOT NULL,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastLogin TIMESTAMP NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (VolunteerID) REFERENCES Volunteers(VolunteerID) ON DELETE CASCADE,
    INDEX idx_username (Username),
    INDEX idx_volunteer_id (VolunteerID)
);

-- Insert demo volunteer accounts for testing
-- Password: volunteer123 for all (in production, these should be hashed)
INSERT INTO VolunteerAccounts (VolunteerID, Username, Password) VALUES
(1, 'john.smith', 'volunteer123'),
(2, 'jane.doe', 'volunteer123'),
(3, 'bob.johnson', 'volunteer123'),
(4, 'alice.wong', 'volunteer123'),
(5, 'charlie.brown', 'volunteer123'),
(6, 'diana.martinez', 'volunteer123'),
(7, 'evan.taylor', 'volunteer123'),
(8, 'fiona.chen', 'volunteer123'),
(9, 'george.kim', 'volunteer123'),
(10, 'hannah.patel', 'volunteer123');
