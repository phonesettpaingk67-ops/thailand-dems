-- ============================================
-- SHELTER STATUS AUTO-UPDATE TRIGGERS
-- Automatically manages shelter status based on occupancy
-- ============================================

DELIMITER $$

-- ===========================================
-- Trigger 1: Auto-update status on INSERT
-- ===========================================
DROP TRIGGER IF EXISTS update_shelter_status_insert$$
CREATE TRIGGER update_shelter_status_insert
BEFORE INSERT ON Shelters
FOR EACH ROW
BEGIN
    DECLARE occupancy_percent DECIMAL(5,2);
    
    -- Calculate occupancy percentage
    IF NEW.Capacity > 0 THEN
        SET occupancy_percent = (NEW.CurrentOccupancy / NEW.Capacity) * 100;
    ELSE
        SET occupancy_percent = 0;
    END IF;
    
    -- Auto-set status based on occupancy
    -- Don't override if manually set to Closed or Under Maintenance
    IF NEW.Status NOT IN ('Closed', 'Under Maintenance') THEN
        IF occupancy_percent >= 100 THEN
            SET NEW.Status = 'Full';
        ELSE
            SET NEW.Status = 'Available';
        END IF;
    END IF;
    
    -- Ensure CurrentOccupancy doesn't exceed Capacity
    IF NEW.CurrentOccupancy > NEW.Capacity THEN
        SET NEW.CurrentOccupancy = NEW.Capacity;
    END IF;
    
    -- Ensure non-negative values
    IF NEW.CurrentOccupancy < 0 THEN
        SET NEW.CurrentOccupancy = 0;
    END IF;
    
    IF NEW.Capacity < 0 THEN
        SET NEW.Capacity = 0;
    END IF;
END$$

-- ===========================================
-- Trigger 2: Auto-update status on UPDATE
-- ===========================================
DROP TRIGGER IF EXISTS update_shelter_status_update$$
CREATE TRIGGER update_shelter_status_update
BEFORE UPDATE ON Shelters
FOR EACH ROW
BEGIN
    DECLARE occupancy_percent DECIMAL(5,2);
    
    -- Calculate occupancy percentage
    IF NEW.Capacity > 0 THEN
        SET occupancy_percent = (NEW.CurrentOccupancy / NEW.Capacity) * 100;
    ELSE
        SET occupancy_percent = 0;
    END IF;
    
    -- Auto-set status based on occupancy
    -- Don't override if manually set to Closed or Under Maintenance
    IF NEW.Status NOT IN ('Closed', 'Under Maintenance') THEN
        IF occupancy_percent >= 100 THEN
            SET NEW.Status = 'Full';
        ELSEIF occupancy_percent >= 95 THEN
            -- Near capacity, but still available
            SET NEW.Status = 'Available';
        ELSE
            SET NEW.Status = 'Available';
        END IF;
    END IF;
    
    -- Ensure CurrentOccupancy doesn't exceed Capacity
    IF NEW.CurrentOccupancy > NEW.Capacity THEN
        SET NEW.CurrentOccupancy = NEW.Capacity;
        SET NEW.Status = 'Full';
    END IF;
    
    -- Ensure non-negative values
    IF NEW.CurrentOccupancy < 0 THEN
        SET NEW.CurrentOccupancy = 0;
    END IF;
    
    IF NEW.Capacity < 0 THEN
        SET NEW.Capacity = 0;
    END IF;
    
    -- If capacity increased and was Full, may now be Available
    IF OLD.Status = 'Full' AND NEW.Capacity > OLD.Capacity THEN
        IF NEW.CurrentOccupancy < NEW.Capacity THEN
            SET NEW.Status = 'Available';
        END IF;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- Apply triggers to existing data
-- ============================================
UPDATE Shelters 
SET CurrentOccupancy = LEAST(CurrentOccupancy, Capacity),
    Status = CASE 
        WHEN Status IN ('Closed', 'Under Maintenance') THEN Status
        WHEN CurrentOccupancy >= Capacity THEN 'Full'
        ELSE 'Available'
    END;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify trigger is working:
-- SELECT ShelterID, ShelterName, Capacity, CurrentOccupancy, 
--        ROUND((CurrentOccupancy/Capacity)*100, 2) as OccupancyPercent,
--        Status 
-- FROM Shelters 
-- ORDER BY OccupancyPercent DESC;
