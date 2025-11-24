-- Emergency Response Management System Seed Data

-- Insert Agencies
INSERT INTO `Agency` (`Name`, `ContactInfo`) VALUES
('Fire Department', 'fire@emergency.gov | (555) 100-1000'),
('Police Department', 'police@emergency.gov | (555) 200-2000'),
('Medical Services', 'medical@emergency.gov | (555) 300-3000'),
('Red Cross', 'info@redcross.org | (555) 400-4000'),
('Coast Guard', 'coastguard@emergency.gov | (555) 500-5000');

-- Insert Locations
INSERT INTO `Location` (`Name`, `Address`, `Latitude`, `Longitude`) VALUES
('Downtown District', '123 Main St, Metro City', 40.7128, -74.0060),
('Harbor Area', '456 Port Blvd, Metro City', 40.7589, -73.9851),
('Northern Suburbs', '789 Oak Ave, Metro City', 40.7794, -73.9632),
('Industrial Zone', '321 Factory Rd, Metro City', 40.7489, -73.9680),
('University Campus', '654 College Dr, Metro City', 40.7308, -73.9973),
('City Park', '987 Green Park Way, Metro City', 40.7812, -73.9665),
('Airport Terminal', '111 Airport Blvd, Metro City', 40.7769, -73.8740);

-- Insert Incident Types
INSERT INTO `IncidentType` (`TypeName`) VALUES
('Fire'),
('Flood'),
('Earthquake'),
('Chemical Spill'),
('Traffic Accident'),
('Medical Emergency'),
('Building Collapse'),
('Power Outage');

-- Insert Resource Types
INSERT INTO `ResourceType` (`TypeName`) VALUES
('Vehicle'),
('Medical Equipment'),
('Communication Device'),
('Shelter Supplies'),
('Food & Water'),
('Rescue Equipment');

-- Insert Incidents
INSERT INTO `Incident` (`Description`, `StartDate`, `EndDate`, `LocationID`, `AgencyID`, `IncidentTypeID`) VALUES
('Major building fire at apartment complex', '2025-11-20 08:30:00', '2025-11-20 14:45:00', 1, 1, 1),
('Flash flooding due to heavy rainfall', '2025-11-19 06:00:00', '2025-11-19 18:00:00', 2, 5, 2),
('Multi-vehicle collision on highway', '2025-11-21 16:20:00', '2025-11-21 19:00:00', 4, 2, 5),
('Chemical leak at industrial facility', '2025-11-18 10:15:00', '2025-11-18 22:30:00', 4, 1, 4),
('Medical emergency - mass food poisoning', '2025-11-22 12:00:00', NULL, 5, 3, 6),
('Structural damage after storm', '2025-11-17 14:30:00', '2025-11-17 20:00:00', 3, 1, 7);

-- Insert Resources
INSERT INTO `Resource` (`ResourceTypeID`, `Name`, `Quantity`, `Status`) VALUES
(1, 'Fire Truck Unit-12', 1, 'In Use'),
(1, 'Ambulance AM-301', 1, 'Available'),
(1, 'Police Patrol Car PC-45', 1, 'In Use'),
(2, 'Defibrillator', 5, 'Available'),
(2, 'Oxygen Tank', 15, 'Available'),
(3, 'Two-Way Radio Set', 25, 'Available'),
(3, 'Satellite Phone', 8, 'Available'),
(4, 'Emergency Blankets', 200, 'Available'),
(4, 'Portable Tents', 20, 'Available'),
(5, 'Water Bottles (Cases)', 100, 'Available'),
(5, 'MRE Meals', 500, 'Available'),
(6, 'Hydraulic Rescue Tool', 4, 'In Use');

-- Insert Personnel
INSERT INTO `Personnel` (`FirstName`, `LastName`, `Role`, `AgencyID`) VALUES
('John', 'Martinez', 'Fire Captain', 1),
('Sarah', 'Johnson', 'Paramedic', 3),
('Michael', 'Chen', 'Police Officer', 2),
('Emily', 'Davis', 'Emergency Coordinator', 4),
('Robert', 'Williams', 'Firefighter', 1),
('Jessica', 'Brown', 'Nurse', 3),
('David', 'Garcia', 'Detective', 2),
('Amanda', 'Miller', 'Relief Worker', 4),
('James', 'Wilson', 'Coast Guard Officer', 5),
('Lisa', 'Anderson', 'EMT', 3);

-- Insert Shelters
INSERT INTO `Shelter` (`Name`, `Capacity`, `LocationID`) VALUES
('Central Emergency Shelter', 150, 1),
('Community Center Shelter', 100, 3),
('University Gym Shelter', 200, 5),
('Park Recreation Center', 75, 6);

-- Insert Victims
INSERT INTO `Victim` (`IncidentID`, `FirstName`, `LastName`, `Age`, `Gender`, `Condition`) VALUES
(1, 'Maria', 'Rodriguez', 34, 'Female', 'Smoke Inhalation - Stable'),
(1, 'Thomas', 'Lee', 45, 'Male', 'Burns - Critical'),
(1, 'Anna', 'White', 28, 'Female', 'Minor Injuries'),
(2, 'George', 'Taylor', 67, 'Male', 'Hypothermia - Stable'),
(2, 'Patricia', 'Moore', 52, 'Female', 'Stable'),
(3, 'Kevin', 'Hall', 31, 'Male', 'Fractured Leg'),
(3, 'Nancy', 'Allen', 29, 'Female', 'Head Trauma - Serious'),
(4, 'Daniel', 'Young', 41, 'Male', 'Chemical Exposure - Critical'),
(5, 'Michelle', 'King', 22, 'Female', 'Food Poisoning - Stable'),
(5, 'Christopher', 'Wright', 20, 'Male', 'Food Poisoning - Stable');

-- Insert Assignments
INSERT INTO `Assignment` (`IncidentID`, `PersonnelID`, `Task`, `Status`) VALUES
(1, 1, 'Lead firefighting operations and coordinate evacuation', 'Completed'),
(1, 5, 'Support fire suppression and search & rescue', 'Completed'),
(1, 2, 'Provide medical assistance to injured victims', 'Completed'),
(2, 9, 'Coordinate water rescue operations', 'Completed'),
(2, 4, 'Set up temporary shelter for displaced residents', 'Completed'),
(3, 3, 'Investigate accident scene and manage traffic', 'Completed'),
(3, 2, 'Triage and transport injured victims', 'Completed'),
(4, 1, 'Hazmat containment and area evacuation', 'Completed'),
(5, 6, 'Treat affected students and monitor conditions', 'In Progress'),
(5, 10, 'Emergency medical response', 'In Progress');

-- Insert Logs
INSERT INTO `Log` (`IncidentID`, `LogDate`, `Details`) VALUES
(1, '2025-11-20 08:35:00', 'Fire reported at 123 Main St. Fire units dispatched.'),
(1, '2025-11-20 08:50:00', 'First responders on scene. Building evacuation in progress.'),
(1, '2025-11-20 09:30:00', 'Fire under control. 3 victims rescued from second floor.'),
(1, '2025-11-20 14:45:00', 'Fire extinguished. Scene secured. Investigation underway.'),
(2, '2025-11-19 06:15:00', 'Flood warning issued. Emergency shelters opening.'),
(2, '2025-11-19 08:00:00', 'Water levels rising. Evacuation orders for Harbor Area.'),
(2, '2025-11-19 12:30:00', 'Rescue operations ongoing. 45 people evacuated so far.'),
(2, '2025-11-19 18:00:00', 'Water receding. All residents accounted for.'),
(3, '2025-11-21 16:25:00', 'Multiple vehicle collision reported on Highway 101.'),
(3, '2025-11-21 16:40:00', '5 vehicles involved. 2 critical injuries. Life flight requested.'),
(3, '2025-11-21 19:00:00', 'All victims transported. Highway cleared and reopened.'),
(4, '2025-11-18 10:20:00', 'Chemical leak detected at industrial plant. Hazmat team en route.'),
(4, '2025-11-18 11:00:00', 'Evacuation zone established. 500m radius cleared.'),
(4, '2025-11-18 22:30:00', 'Leak contained. Area declared safe. Cleanup to begin tomorrow.'),
(5, '2025-11-22 12:15:00', 'Mass food poisoning reported at university cafeteria.'),
(5, '2025-11-22 13:00:00', '27 students showing symptoms. Medical teams on site.');
