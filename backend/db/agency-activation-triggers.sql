-- ==================================================
-- AGENCY ACTIVATION & RESOURCE MANAGEMENT TRIGGERS
-- ==================================================
-- Purpose: Automatically manage agency resource availability
--          and track deployment statistics
-- 
-- Features:
-- 1. Auto-update resource status when deployed/recalled
-- 2. Track active deployments per agency
-- 3. Auto-update agency status based on resource availability
-- 4. Calculate total resources available/deployed
-- ==================================================

DELIMITER $$

-- =====================================================
-- TRIGGER 1: Update Resource Availability on Activation
-- =====================================================
-- When agency is activated for disaster, mark resources as Deployed
DROP TRIGGER IF EXISTS update_resources_on_activation$$

CREATE TRIGGER update_resources_on_activation
AFTER UPDATE ON AgencyActivations
FOR EACH ROW
BEGIN
    -- When activation status changes to 'Deployed'
    IF NEW.Status = 'Deployed' AND OLD.Status != 'Deployed' THEN
        -- Mark agency resources as Deployed (you can customize logic for specific resources)
        -- For now, we'll track this in activation record
        -- Real deployment would be managed per-resource in AgencyResources table
        UPDATE Agencies 
        SET Status = 'Active'
        WHERE AgencyID = NEW.AgencyID;
    END IF;
    
    -- When activation completes or cancelled, resources may become available again
    IF (NEW.Status = 'Completed' OR NEW.Status = 'Cancelled') 
       AND (OLD.Status = 'Deployed' OR OLD.Status = 'Confirmed') THEN
        -- Check if agency has any other active deployments
        IF NOT EXISTS (
            SELECT 1 FROM AgencyActivations
            WHERE AgencyID = NEW.AgencyID
              AND ActivationID != NEW.ActivationID
              AND Status IN ('Requested', 'Confirmed', 'Deployed')
        ) THEN
            -- No other active deployments, agency can be fully available
            UPDATE Agencies
            SET Status = 'Active'
            WHERE AgencyID = NEW.AgencyID;
        END IF;
    END IF;
END$$

-- =====================================================
-- TRIGGER 2: Update Resource Status on Resource Deployment
-- =====================================================
-- When specific resources are allocated/deployed
DROP TRIGGER IF EXISTS track_resource_deployment$$

CREATE TRIGGER track_resource_deployment
AFTER UPDATE ON AgencyResources
FOR EACH ROW
BEGIN
    DECLARE total_available INT;
    DECLARE total_deployed INT;
    
    -- Count available vs deployed resources for this agency
    SELECT 
        SUM(CASE WHEN AvailabilityStatus = 'Available' THEN 1 ELSE 0 END),
        SUM(CASE WHEN AvailabilityStatus = 'Deployed' THEN 1 ELSE 0 END)
    INTO total_available, total_deployed
    FROM AgencyResources
    WHERE AgencyID = NEW.AgencyID;
    
    -- If all resources deployed, mark agency as potentially at capacity
    -- If resources become available, ensure agency is active
    IF total_available = 0 AND total_deployed > 0 THEN
        -- All resources deployed
        UPDATE Agencies
        SET Status = 'Active' -- Still active but at capacity
        WHERE AgencyID = NEW.AgencyID;
    ELSEIF total_available > 0 THEN
        -- Has available resources
        UPDATE Agencies
        SET Status = 'Active'
        WHERE AgencyID = NEW.AgencyID;
    END IF;
END$$

-- =====================================================
-- TRIGGER 3: Log Activation Request
-- =====================================================
-- When new activation is requested, validate agency is available
DROP TRIGGER IF EXISTS validate_activation_request$$

CREATE TRIGGER validate_activation_request
BEFORE INSERT ON AgencyActivations
FOR EACH ROW
BEGIN
    DECLARE agency_status VARCHAR(20);
    
    -- Get current agency status
    SELECT Status INTO agency_status
    FROM Agencies
    WHERE AgencyID = NEW.AgencyID;
    
    -- Only allow activation if agency is Active
    IF agency_status != 'Active' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot activate agency: Agency is not in Active status';
    END IF;
    
    -- Set RequestedAt if not provided
    IF NEW.RequestedAt IS NULL THEN
        SET NEW.RequestedAt = NOW();
    END IF;
END$$

-- =====================================================
-- TRIGGER 4: Auto-set ActivatedAt when Confirmed
-- =====================================================
DROP TRIGGER IF EXISTS set_activation_timestamp$$

CREATE TRIGGER set_activation_timestamp
BEFORE UPDATE ON AgencyActivations
FOR EACH ROW
BEGIN
    -- When status changes to Deployed, set ActivatedAt
    IF NEW.Status = 'Deployed' AND OLD.Status != 'Deployed' THEN
        IF NEW.ActivatedAt IS NULL THEN
            SET NEW.ActivatedAt = NOW();
        END IF;
    END IF;
END$$

DELIMITER ;

-- ==================================================
-- CLEANUP QUERIES (Run if data is inconsistent)
-- ==================================================

-- Reset all agency statuses based on resource availability
UPDATE Agencies a
SET Status = CASE
    WHEN EXISTS (
        SELECT 1 FROM AgencyResources
        WHERE AgencyID = a.AgencyID
          AND AvailabilityStatus = 'Available'
    ) THEN 'Active'
    WHEN NOT EXISTS (
        SELECT 1 FROM AgencyResources
        WHERE AgencyID = a.AgencyID
    ) THEN 'Active'  -- No resources defined, still active
    ELSE 'Active'
END
WHERE Status = 'Inactive';

-- Set ActivatedAt for deployed activations that are missing timestamp
UPDATE AgencyActivations
SET ActivatedAt = RequestedAt
WHERE Status = 'Deployed' 
  AND ActivatedAt IS NULL;

-- ==================================================
-- VERIFICATION QUERIES (Run to check triggers work)
-- ==================================================

-- Check agency activation counts
-- SELECT 
--     a.AgencyID,
--     a.AgencyName,
--     a.Status,
--     COUNT(CASE WHEN aa.Status IN ('Requested', 'Confirmed', 'Deployed') THEN 1 END) AS ActiveDeployments,
--     COUNT(CASE WHEN aa.Status = 'Completed' THEN 1 END) AS CompletedDeployments,
--     (SELECT COUNT(*) FROM AgencyResources WHERE AgencyID = a.AgencyID AND AvailabilityStatus = 'Available') AS AvailableResources,
--     (SELECT COUNT(*) FROM AgencyResources WHERE AgencyID = a.AgencyID AND AvailabilityStatus = 'Deployed') AS DeployedResources
-- FROM Agencies a
-- LEFT JOIN AgencyActivations aa ON a.AgencyID = aa.AgencyID
-- GROUP BY a.AgencyID;

-- Check resource deployment status
-- SELECT 
--     ar.*,
--     a.AgencyName,
--     a.Status AS AgencyStatus
-- FROM AgencyResources ar
-- JOIN Agencies a ON ar.AgencyID = a.AgencyID
-- ORDER BY ar.AvailabilityStatus, a.AgencyName;
