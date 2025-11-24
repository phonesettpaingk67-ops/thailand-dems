-- ============================================
-- VOLUNTEER STATUS AUTO-UPDATE TRIGGERS
-- Automatically manages volunteer availability based on assignments
-- ============================================

DELIMITER $$

-- ===========================================
-- Trigger 1: Auto-update volunteer status when assignment created
-- ===========================================
DROP TRIGGER IF EXISTS update_volunteer_on_assignment_insert$$
CREATE TRIGGER update_volunteer_on_assignment_insert
AFTER INSERT ON VolunteerAssignments
FOR EACH ROW
BEGIN
    -- If assignment is Active, set volunteer to Deployed
    IF NEW.Status = 'Active' THEN
        UPDATE Volunteers 
        SET AvailabilityStatus = 'Deployed'
        WHERE VolunteerID = NEW.VolunteerID;
    END IF;
END$$

-- ===========================================
-- Trigger 2: Auto-update volunteer status when assignment status changes
-- ===========================================
DROP TRIGGER IF EXISTS update_volunteer_on_assignment_update$$
CREATE TRIGGER update_volunteer_on_assignment_update
AFTER UPDATE ON VolunteerAssignments
FOR EACH ROW
BEGIN
    DECLARE active_assignments INT;
    
    -- If assignment was just completed or cancelled
    IF (OLD.Status = 'Active' AND NEW.Status IN ('Completed', 'Cancelled')) THEN
        -- Check if volunteer has any other active assignments
        SELECT COUNT(*) INTO active_assignments
        FROM VolunteerAssignments
        WHERE VolunteerID = NEW.VolunteerID 
          AND Status = 'Active'
          AND AssignmentID != NEW.AssignmentID;
        
        -- If no other active assignments, make volunteer available
        IF active_assignments = 0 THEN
            UPDATE Volunteers 
            SET AvailabilityStatus = 'Available'
            WHERE VolunteerID = NEW.VolunteerID;
        END IF;
    END IF;
    
    -- If assignment was just activated
    IF (OLD.Status != 'Active' AND NEW.Status = 'Active') THEN
        UPDATE Volunteers 
        SET AvailabilityStatus = 'Deployed'
        WHERE VolunteerID = NEW.VolunteerID;
    END IF;
END$$

-- ===========================================
-- Trigger 3: Auto-update hours when assignment completed
-- ===========================================
DROP TRIGGER IF EXISTS update_volunteer_hours_on_completion$$
CREATE TRIGGER update_volunteer_hours_on_completion
AFTER UPDATE ON VolunteerAssignments
FOR EACH ROW
BEGIN
    -- When assignment is completed, add hours to volunteer total
    IF (OLD.Status != 'Completed' AND NEW.Status = 'Completed' AND NEW.HoursWorked > 0) THEN
        UPDATE Volunteers 
        SET TotalHoursContributed = TotalHoursContributed + NEW.HoursWorked
        WHERE VolunteerID = NEW.VolunteerID;
    END IF;
    
    -- If hours were updated on already completed assignment, adjust total
    IF (OLD.Status = 'Completed' AND NEW.Status = 'Completed' AND OLD.HoursWorked != NEW.HoursWorked) THEN
        UPDATE Volunteers 
        SET TotalHoursContributed = TotalHoursContributed - OLD.HoursWorked + NEW.HoursWorked
        WHERE VolunteerID = NEW.VolunteerID;
    END IF;
END$$

-- ===========================================
-- Trigger 4: Auto-update hours when assignment deleted
-- ===========================================
DROP TRIGGER IF EXISTS update_volunteer_hours_on_delete$$
CREATE TRIGGER update_volunteer_hours_on_delete
AFTER DELETE ON VolunteerAssignments
FOR EACH ROW
BEGIN
    DECLARE active_assignments INT;
    
    -- Subtract hours if assignment was completed
    IF OLD.Status = 'Completed' AND OLD.HoursWorked > 0 THEN
        UPDATE Volunteers 
        SET TotalHoursContributed = GREATEST(0, TotalHoursContributed - OLD.HoursWorked)
        WHERE VolunteerID = OLD.VolunteerID;
    END IF;
    
    -- If deleted assignment was Active, check if volunteer should become Available
    IF OLD.Status = 'Active' THEN
        SELECT COUNT(*) INTO active_assignments
        FROM VolunteerAssignments
        WHERE VolunteerID = OLD.VolunteerID 
          AND Status = 'Active';
        
        IF active_assignments = 0 THEN
            UPDATE Volunteers 
            SET AvailabilityStatus = 'Available'
            WHERE VolunteerID = OLD.VolunteerID;
        END IF;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- Cleanup existing data to match current assignments
-- ============================================
-- Set all volunteers to Available initially
UPDATE Volunteers SET AvailabilityStatus = 'Available';

-- Set to Deployed if they have active assignments
UPDATE Volunteers v
INNER JOIN (
    SELECT DISTINCT VolunteerID 
    FROM VolunteerAssignments 
    WHERE Status = 'Active'
) va ON v.VolunteerID = va.VolunteerID
SET v.AvailabilityStatus = 'Deployed';

-- Recalculate total hours from completed assignments
UPDATE Volunteers v
SET TotalHoursContributed = (
    SELECT COALESCE(SUM(HoursWorked), 0)
    FROM VolunteerAssignments
    WHERE VolunteerID = v.VolunteerID 
      AND Status = 'Completed'
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify triggers are working:
/*
-- Check volunteer statuses match their assignments
SELECT 
    v.VolunteerID,
    CONCAT(v.FirstName, ' ', v.LastName) as Name,
    v.AvailabilityStatus,
    COUNT(CASE WHEN va.Status = 'Active' THEN 1 END) as ActiveAssignments,
    v.TotalHoursContributed,
    SUM(CASE WHEN va.Status = 'Completed' THEN va.HoursWorked ELSE 0 END) as CalculatedHours
FROM Volunteers v
LEFT JOIN VolunteerAssignments va ON v.VolunteerID = va.VolunteerID
GROUP BY v.VolunteerID
ORDER BY v.LastName;
*/
