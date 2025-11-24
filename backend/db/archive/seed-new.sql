-- Modern Emergency Response System - Realistic Seed Data

-- Teams
INSERT INTO `Teams` (`Name`, `Type`, `ContactPhone`, `ContactEmail`, `Status`, `MemberCount`) VALUES
('Station 1 Fire Brigade', 'Fire', '555-0100', 'station1@fire.gov', 'Active', 12),
('Rapid Response Medical', 'Medical', '555-0200', 'rrm@medical.gov', 'Active', 8),
('Metro Police Squad Alpha', 'Police', '555-0300', 'alpha@police.gov', 'Active', 15),
('Search & Rescue Team', 'Rescue', '555-0400', 'sar@rescue.gov', 'Active', 10),
('Hazmat Specialists', 'Hazmat', '555-0500', 'hazmat@response.gov', 'Standby', 6),
('Emergency Support Services', 'Support', '555-0600', 'support@emergency.gov', 'Active', 20);

-- Locations
INSERT INTO `Locations` (`Name`, `Address`, `City`, `State`, `ZipCode`, `Latitude`, `Longitude`, `Zone`, `Type`) VALUES
('Downtown Plaza', '123 Main Street', 'Metro City', 'CA', '90001', 34.052235, -118.243683, 'Central', 'Commercial'),
('Riverside Apartments', '456 River Road', 'Metro City', 'CA', '90002', 34.048235, -118.253683, 'East', 'Residential'),
('Industrial Park Zone A', '789 Factory Ave', 'Metro City', 'CA', '90003', 34.062235, -118.263683, 'West', 'Industrial'),
('City Hospital', '321 Health Blvd', 'Metro City', 'CA', '90004', 34.058235, -118.238683, 'North', 'Public'),
('Shopping Mall Complex', '654 Commerce Dr', 'Metro City', 'CA', '90005', 34.042235, -118.273683, 'South', 'Commercial'),
('Greenwood Park', '987 Park Lane', 'Metro City', 'CA', '90006', 34.055235, -118.248683, 'Central', 'Public'),
('Tech Campus Building', '147 Innovation Way', 'Metro City', 'CA', '90007', 34.068235, -118.228683, 'North', 'Commercial'),
('Sunset Residential Area', '258 Sunset Blvd', 'Metro City', 'CA', '90008', 34.038235, -118.258683, 'West', 'Residential'),
('Harbor Warehouse District', '369 Port Street', 'Metro City', 'CA', '90009', 34.032235, -118.268683, 'South', 'Industrial'),
('Central Fire Station', '741 Emergency Lane', 'Metro City', 'CA', '90010', 34.054235, -118.244683, 'Central', 'Public');

-- Incidents
INSERT INTO `Incidents` (`Title`, `Description`, `Type`, `Priority`, `Status`, `LocationID`, `ReportedBy`, `ReportedPhone`, `TeamID`, `EstimatedCasualties`, `ReportedAt`, `DispatchedAt`) VALUES
('Multi-vehicle collision on Highway 101', '3-car pileup blocking 2 lanes, injuries reported', 'Accident', 'High', 'In Progress', 1, 'John Doe', '555-1234', 3, 4, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 115 MINUTE)),
('Kitchen fire at Riverside Apartments', 'Smoke visible from unit 305, residents evacuating', 'Fire', 'Critical', 'Dispatched', 2, 'Building Manager', '555-2345', 1, 0, DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
('Cardiac arrest patient at Shopping Mall', 'Male, 60s, unconscious, CPR in progress', 'Medical', 'Critical', 'In Progress', 5, 'Mall Security', '555-3456', 2, 1, DATE_SUB(NOW(), INTERVAL 45 MINUTE), DATE_SUB(NOW(), INTERVAL 43 MINUTE)),
('Chemical spill at Industrial Park', 'Unknown chemical leaked from storage tank', 'Hazmat', 'High', 'Dispatched', 3, 'Plant Supervisor', '555-4567', 5, 0, DATE_SUB(NOW(), INTERVAL 60 MINUTE), DATE_SUB(NOW(), INTERVAL 55 MINUTE)),
('Missing child at Greenwood Park', '7-year-old boy last seen near playground', 'Other', 'High', 'In Progress', 6, 'Parent', '555-5678', 3, 0, DATE_SUB(NOW(), INTERVAL 180 MINUTE), DATE_SUB(NOW(), INTERVAL 170 MINUTE)),
('Elevator stuck at Tech Campus', '6 people trapped between floors 8-9', 'Other', 'Medium', 'Dispatched', 7, 'Security Desk', '555-6789', 4, 0, DATE_SUB(NOW(), INTERVAL 20 MINUTE), DATE_SUB(NOW(), INTERVAL 18 MINUTE)),
('Medical emergency at City Hospital ER', 'Mass casualty preparation needed', 'Medical', 'Critical', 'Reported', 4, 'ER Doctor', '555-7890', 2, 12, DATE_SUB(NOW(), INTERVAL 10 MINUTE), NULL),
('Gas leak reported on Sunset Blvd', 'Strong odor, residents reporting headaches', 'Other', 'High', 'Dispatched', 8, 'Resident', '555-8901', 1, 0, DATE_SUB(NOW(), INTERVAL 40 MINUTE), DATE_SUB(NOW(), INTERVAL 38 MINUTE)),
('Warehouse fire at Harbor District', 'Flames visible, spreading to adjacent buildings', 'Fire', 'Critical', 'In Progress', 9, 'Harbor Patrol', '555-9012', 1, 0, DATE_SUB(NOW(), INTERVAL 90 MINUTE), DATE_SUB(NOW(), INTERVAL 85 MINUTE)),
('Armed robbery at Downtown Plaza', 'Suspect fled on foot, heading north', 'Security', 'High', 'In Progress', 1, 'Store Owner', '555-0123', 3, 0, DATE_SUB(NOW(), INTERVAL 15 MINUTE), DATE_SUB(NOW(), INTERVAL 12 MINUTE)),
('Flood damage assessment needed', 'Heavy rain caused basement flooding in multiple units', 'Natural Disaster', 'Medium', 'Resolved', 2, 'Property Manager', '555-1122', 6, 0, DATE_SUB(NOW(), INTERVAL 300 MINUTE), DATE_SUB(NOW(), INTERVAL 290 MINUTE)),
('Traffic signal malfunction', 'Major intersection lights all red, traffic chaos', 'Other', 'Medium', 'Resolved', 1, 'Traffic Officer', '555-2233', 3, 0, DATE_SUB(NOW(), INTERVAL 480 MINUTE), DATE_SUB(NOW(), INTERVAL 465 MINUTE));

-- Update resolved incidents
UPDATE `Incidents` SET `ResolvedAt` = DATE_SUB(NOW(), INTERVAL 2 HOUR), `Status` = 'Resolved' WHERE `IncidentID` IN (11, 12);

-- Responders
INSERT INTO `Responders` (`FirstName`, `LastName`, `Badge`, `Role`, `TeamID`, `Phone`, `Email`, `Status`, `CertificationLevel`, `YearsOfExperience`, `CurrentIncidentID`) VALUES
('Michael', 'Rodriguez', 'F-1001', 'Firefighter', 1, '555-1001', 'm.rodriguez@fire.gov', 'On Duty', 'Advanced', 8, 2),
('Sarah', 'Chen', 'F-1002', 'Firefighter', 1, '555-1002', 's.chen@fire.gov', 'On Duty', 'Expert', 12, 9),
('David', 'Williams', 'P-2001', 'Paramedic', 2, '555-2001', 'd.williams@medical.gov', 'On Duty', 'Advanced', 6, 3),
('Emma', 'Johnson', 'P-2002', 'Paramedic', 2, '555-2002', 'e.johnson@medical.gov', 'Available', 'Intermediate', 4, NULL),
('James', 'Martinez', 'PO-3001', 'Police Officer', 3, '555-3001', 'j.martinez@police.gov', 'On Duty', 'Advanced', 10, 1),
('Lisa', 'Anderson', 'PO-3002', 'Police Officer', 3, '555-3002', 'l.anderson@police.gov', 'On Duty', 'Basic', 3, 5),
('Robert', 'Taylor', 'R-4001', 'Rescue Specialist', 4, '555-4001', 'r.taylor@rescue.gov', 'On Duty', 'Expert', 15, 6),
('Jennifer', 'Brown', 'R-4002', 'Rescue Specialist', 4, '555-4002', 'j.brown@rescue.gov', 'Available', 'Advanced', 7, NULL),
('Christopher', 'Davis', 'H-5001', 'Coordinator', 5, '555-5001', 'c.davis@response.gov', 'On Duty', 'Expert', 11, 4),
('Amanda', 'Garcia', 'S-6001', 'Support Staff', 6, '555-6001', 'a.garcia@emergency.gov', 'Available', 'Intermediate', 5, NULL),
('Daniel', 'Miller', 'F-1003', 'Firefighter', 1, '555-1003', 'd.miller@fire.gov', 'Off Duty', 'Intermediate', 5, NULL),
('Nicole', 'Wilson', 'P-2003', 'Paramedic', 2, '555-2003', 'n.wilson@medical.gov', 'Off Duty', 'Basic', 2, NULL),
('Kevin', 'Moore', 'PO-3003', 'Police Officer', 3, '555-3003', 'k.moore@police.gov', 'On Duty', 'Advanced', 9, 10),
('Rachel', 'Jackson', 'R-4003', 'Rescue Specialist', 4, '555-4003', 'r.jackson@rescue.gov', 'Available', 'Intermediate', 4, NULL),
('Brian', 'Thompson', 'S-6002', 'Support Staff', 6, '555-6002', 'b.thompson@emergency.gov', 'Available', 'Basic', 3, NULL);

-- Resources
INSERT INTO `Resources` (`Name`, `Type`, `Category`, `Quantity`, `Status`, `TeamID`, `CurrentIncidentID`, `LastMaintenanceDate`) VALUES
('Fire Engine Unit 1', 'Vehicle', 'Fire Response', 1, 'In Use', 1, 2, '2024-11-01'),
('Fire Engine Unit 2', 'Vehicle', 'Fire Response', 1, 'In Use', 1, 9, '2024-10-15'),
('Ambulance Alpha', 'Vehicle', 'Medical Transport', 1, 'In Use', 2, 3, '2024-11-10'),
('Ambulance Beta', 'Vehicle', 'Medical Transport', 1, 'Available', 2, NULL, '2024-11-05'),
('Police Cruiser 101', 'Vehicle', 'Patrol', 1, 'In Use', 3, 1, '2024-10-20'),
('Police Cruiser 102', 'Vehicle', 'Patrol', 1, 'In Use', 3, 10, '2024-11-08'),
('Rescue Truck Alpha', 'Vehicle', 'Technical Rescue', 1, 'In Use', 4, 6, '2024-10-25'),
('Hazmat Response Unit', 'Vehicle', 'Hazmat Operations', 1, 'In Use', 5, 4, '2024-11-12'),
('Hydraulic Rescue Tools', 'Equipment', 'Extrication', 2, 'In Use', 1, 1, '2024-10-01'),
('Defibrillator Units', 'Medical Supply', 'AED', 5, 'Available', 2, NULL, '2024-11-15'),
('Portable Radios', 'Communication Device', 'Two-Way Radio', 25, 'Available', NULL, NULL, '2024-11-01'),
('Breathing Apparatus', 'Equipment', 'SCBA', 12, 'Available', 1, NULL, '2024-10-18'),
('Medical Stretchers', 'Medical Supply', 'Patient Transport', 6, 'Available', 2, NULL, '2024-11-03'),
('Traffic Cones & Barriers', 'Equipment', 'Traffic Control', 50, 'In Use', 3, 1, '2024-09-15'),
('Hazmat Protective Suits', 'Equipment', 'PPE', 8, 'In Use', 5, 4, '2024-10-30');

-- Communications
INSERT INTO `Communications` (`IncidentID`, `Message`, `Type`, `Priority`, `CreatedBy`, `CreatedAt`) VALUES
(1, 'Units dispatched to scene, ETA 5 minutes', 'Status Update', 'High', 'Dispatcher', DATE_SUB(NOW(), INTERVAL 115 MINUTE)),
(1, 'On scene, securing area and providing medical assistance', 'Status Update', 'High', 'Officer Martinez', DATE_SUB(NOW(), INTERVAL 105 MINUTE)),
(1, 'Requesting additional ambulance for injured passengers', 'Request', 'Urgent', 'Officer Martinez', DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(2, 'Fire crews en route to Riverside Apartments', 'Status Update', 'Urgent', 'Dispatcher', DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(2, 'Building evacuation in progress, no injuries reported yet', 'Alert', 'High', 'Rodriguez', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(3, 'Paramedics on scene, patient stabilized', 'Status Update', 'Urgent', 'Williams', DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(3, 'Transporting patient to City Hospital ER', 'Status Update', 'Normal', 'Williams', DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
(4, 'Hazmat team assessing chemical type and containment options', 'Status Update', 'High', 'Davis', DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
(5, 'Search teams deployed in grid pattern around park', 'Status Update', 'High', 'Anderson', DATE_SUB(NOW(), INTERVAL 165 MINUTE)),
(5, 'Child located safe near north entrance, reunited with family', 'Alert', 'Normal', 'Anderson', DATE_SUB(NOW(), INTERVAL 135 MINUTE)),
(9, 'Multiple fire engines on scene, establishing water supply', 'Status Update', 'Urgent', 'Chen', DATE_SUB(NOW(), INTERVAL 80 MINUTE)),
(9, 'Fire spreading to adjacent warehouse, requesting backup', 'Request', 'Urgent', 'Chen', DATE_SUB(NOW(), INTERVAL 70 MINUTE)),
(10, 'Suspect description: Male, 20s, black hoodie, heading north on Main St', 'Alert', 'Urgent', 'Moore', DATE_SUB(NOW(), INTERVAL 12 MINUTE)),
(10, 'K-9 unit requested for suspect tracking', 'Request', 'High', 'Moore', DATE_SUB(NOW(), INTERVAL 10 MINUTE));

-- Tasks
INSERT INTO `Tasks` (`IncidentID`, `Title`, `Description`, `AssignedTo`, `Status`, `Priority`, `DueDate`) VALUES
(1, 'Secure accident scene perimeter', 'Set up traffic cones and redirect traffic', 5, 'Completed', 'High', DATE_SUB(NOW(), INTERVAL 100 MINUTE)),
(1, 'Coordinate with tow trucks', 'Arrange removal of damaged vehicles', 5, 'In Progress', 'Medium', DATE_ADD(NOW(), INTERVAL 30 MINUTE)),
(2, 'Evacuate all residents', 'Ensure all units are cleared and accounted for', 1, 'In Progress', 'Critical', DATE_ADD(NOW(), INTERVAL 10 MINUTE)),
(2, 'Assess fire damage and structural integrity', 'Inspect building safety after fire is extinguished', 1, 'Pending', 'High', DATE_ADD(NOW(), INTERVAL 2 HOUR)),
(3, 'Complete patient handoff documentation', 'Transfer care to hospital ER staff', 3, 'Completed', 'High', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(4, 'Identify chemical composition', 'Test samples and determine hazard level', 9, 'In Progress', 'Critical', DATE_ADD(NOW(), INTERVAL 1 HOUR)),
(4, 'Establish decontamination zone', 'Set up hazmat shower and containment', 9, 'Pending', 'High', DATE_ADD(NOW(), INTERVAL 45 MINUTE)),
(5, 'Interview witnesses', 'Collect information from park visitors', 6, 'Completed', 'Medium', DATE_SUB(NOW(), INTERVAL 150 MINUTE)),
(6, 'Coordinate with building maintenance', 'Get elevator technician on site', 7, 'In Progress', 'Medium', DATE_ADD(NOW(), INTERVAL 20 MINUTE)),
(9, 'Request mutual aid from neighboring stations', 'Need additional apparatus and personnel', 2, 'Completed', 'Critical', DATE_SUB(NOW(), INTERVAL 75 MINUTE)),
(9, 'Evacuate adjacent buildings', 'Clear potential fire spread zone', 2, 'In Progress', 'Critical', DATE_ADD(NOW(), INTERVAL 15 MINUTE)),
(10, 'Review security camera footage', 'Identify suspect escape route', 13, 'In Progress', 'High', DATE_ADD(NOW(), INTERVAL 30 MINUTE));
