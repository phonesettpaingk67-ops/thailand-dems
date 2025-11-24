-- Trigger to automatically update supply status based on quantity levels

DELIMITER $$

-- Trigger for INSERT
DROP TRIGGER IF EXISTS update_supply_status_insert$$
CREATE TRIGGER update_supply_status_insert
BEFORE INSERT ON ReliefSupplies
FOR EACH ROW
BEGIN
    DECLARE available DECIMAL(10,2);
    SET available = COALESCE(NEW.TotalQuantity, 0) - COALESCE(NEW.AllocatedQuantity, 0);
    
    -- Check if expired
    IF NEW.ExpiryDate IS NOT NULL AND NEW.ExpiryDate < CURDATE() THEN
        SET NEW.Status = 'Expired';
    -- Check if out of stock
    ELSEIF available <= 0 THEN
        SET NEW.Status = 'Out of Stock';
    -- Check if low stock
    ELSEIF available <= COALESCE(NEW.MinimumThreshold, 0) THEN
        SET NEW.Status = 'Low Stock';
    ELSE
        SET NEW.Status = 'Available';
    END IF;
END$$

-- Trigger for UPDATE
DROP TRIGGER IF EXISTS update_supply_status_update$$
CREATE TRIGGER update_supply_status_update
BEFORE UPDATE ON ReliefSupplies
FOR EACH ROW
BEGIN
    DECLARE available DECIMAL(10,2);
    SET available = COALESCE(NEW.TotalQuantity, 0) - COALESCE(NEW.AllocatedQuantity, 0);
    
    -- Check if expired
    IF NEW.ExpiryDate IS NOT NULL AND NEW.ExpiryDate < CURDATE() THEN
        SET NEW.Status = 'Expired';
    -- Check if out of stock
    ELSEIF available <= 0 THEN
        SET NEW.Status = 'Out of Stock';
    -- Check if low stock
    ELSEIF available <= COALESCE(NEW.MinimumThreshold, 0) THEN
        SET NEW.Status = 'Low Stock';
    ELSE
        SET NEW.Status = 'Available';
    END IF;
END$$

DELIMITER ;
