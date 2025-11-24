-- SEED DATA FOR DISASTER AND EMERGENCY MANAGEMENT SYSTEM

USE disaster_management_db;

-- 1. DISASTERS
INSERT INTO Disasters (DisasterName, DisasterType, Severity, Description, AffectedRegion, Latitude, Longitude, StartDate, EndDate, Status, EstimatedAffectedPopulation, EstimatedDamage) VALUES
('California Wildfire 2025', 'Wildfire', 'Catastrophic', 'Massive wildfire spreading across Northern California counties', 'Northern California', 39.5000, -121.5000, '2025-11-18 06:00:00', NULL, 'Active', 45000, 2500000000.00),
('Hurricane Melissa', 'Hurricane', 'Severe', 'Category 4 hurricane making landfall in Florida Gulf Coast', 'Florida Panhandle', 30.1500, -85.6500, '2025-11-15 14:00:00', '2025-11-17 08:00:00', 'Recovery', 120000, 8500000000.00),
('Central Valley Flood', 'Flood', 'Severe', 'Flash flooding due to dam overflow and heavy rainfall', 'Central Valley, CA', 36.7500, -119.7700, '2025-11-20 02:00:00', NULL, 'Active', 25000, 350000000.00),
('Seattle Earthquake', 'Earthquake', 'Moderate', '6.2 magnitude earthquake centered near Seattle metro area', 'Seattle Metropolitan Area', 47.6062, -122.3321, '2025-11-10 11:23:00', '2025-11-10 11:23:00', 'Recovery', 80000, 1200000000.00),
('Texas Tornado Outbreak', 'Tornado', 'Severe', 'Multiple EF3-EF4 tornadoes across North Texas', 'North Texas', 33.0000, -96.8000, '2025-11-12 18:45:00', '2025-11-13 02:00:00', 'Recovery', 15000, 450000000.00),
('Arizona Drought Crisis', 'Drought', 'Catastrophic', 'Severe water shortage affecting agriculture and urban areas', 'Arizona', 34.0489, -111.0937, '2025-06-01 00:00:00', NULL, 'Active', 200000, 750000000.00),
('Louisiana Chemical Plant Explosion', 'Industrial Accident', 'Severe', 'Major chemical plant explosion with toxic gas release', 'Baton Rouge, LA', 30.4515, -91.1871, '2025-11-19 14:20:00', NULL, 'Contained', 8000, 95000000.00),
('Colorado Landslide', 'Landslide', 'Moderate', 'Major landslide blocking highways and destroying homes', 'Colorado Rockies', 39.5501, -105.7821, '2025-10-28 05:15:00', '2025-10-28 05:15:00', 'Closed', 2500, 35000000.00);

-- 2. SHELTERS
INSERT INTO Shelters (ShelterName, ShelterType, Address, City, Latitude, Longitude, Capacity, CurrentOccupancy, Status, Facilities, ContactPerson, ContactPhone) VALUES
('Central Community Center', 'Evacuation Center', '500 Main Street', 'Santa Rosa', 38.4404, -122.7141, 500, 387, 'Full', 'Showers, Medical station, Kitchen, Sleeping areas, WiFi', 'Maria Garcia', '707-555-0101'),
('North County High School Gym', 'Temporary', '1200 Education Blvd', 'Redding', 40.5865, -122.3917, 800, 623, 'Available', 'Sleeping areas, Meals, First aid, Pet area', 'James Wilson', '530-555-0202'),
('Pensacola Convention Center', 'Relief Camp', '1 Convention Center Dr', 'Pensacola', 30.4213, -87.2169, 1200, 1200, 'Full', 'Full medical, Showers, Meals, Sleeping, Child care, WiFi', 'Sarah Thompson', '850-555-0303'),
('Gulf Shores Temporary Shelter', 'Temporary', '200 Beach Blvd', 'Gulf Shores', 30.2460, -87.7008, 600, 520, 'Available', 'Basic amenities, Meals, Medical screening', 'Robert Martinez', '251-555-0404'),
('Fresno Fairgrounds Relief Camp', 'Relief Camp', '1121 Chance Ave', 'Fresno', 36.7378, -119.7871, 1500, 890, 'Available', 'Full facilities, Showers, Kitchen, Medical, Pet shelters', 'Linda Chen', '559-555-0505'),
('Seattle Emergency Shelter A', 'Evacuation Center', '789 Emergency Way', 'Seattle', 47.6205, -122.3493, 750, 412, 'Available', 'Sleeping, Meals, Medical, Mental health support', 'David Park', '206-555-0606'),
('Seattle Emergency Shelter B', 'Evacuation Center', '321 Harbor Ave', 'Tacoma', 47.2529, -122.4443, 600, 298, 'Available', 'Basic shelter, Meals, First aid', 'Jennifer Lee', '253-555-0707'),
('Dallas North Shelter', 'Temporary', '4500 North St', 'Dallas', 32.7767, -96.7970, 450, 215, 'Available', 'Sleeping areas, Meals, Showers, Medical', 'Michael Brown', '214-555-0808'),
('Phoenix Community Relief Center', 'Community Center', '900 Central Ave', 'Phoenix', 33.4484, -112.0740, 350, 178, 'Available', 'Water distribution, Cooling center, Medical screening', 'Patricia Davis', '602-555-0909'),
('Baton Rouge Emergency Shelter', 'Evacuation Center', '1500 River Rd', 'Baton Rouge', 30.4583, -91.1403, 400, 312, 'Available', 'Decontamination, Medical, Temporary housing', 'Charles Johnson', '225-555-1010');

-- 3. DISASTER_SHELTERS
INSERT INTO DisasterShelters (DisasterID, ShelterID, ActivatedAt, PeakOccupancy) VALUES
(1, 1, '2025-11-18 08:00:00', 450),
(1, 2, '2025-11-18 10:00:00', 680),
(2, 3, '2025-11-15 10:00:00', 1200),
(2, 4, '2025-11-15 12:00:00', 590),
(3, 5, '2025-11-20 06:00:00', 920),
(4, 6, '2025-11-10 13:00:00', 520),
(4, 7, '2025-11-10 14:00:00', 380),
(5, 8, '2025-11-12 20:00:00', 280),
(6, 9, '2025-11-01 00:00:00', 200),
(7, 10, '2025-11-19 15:00:00', 350);

-- 4. RELIEF_SUPPLIES
INSERT INTO ReliefSupplies (SupplyName, Category, Unit, TotalQuantity, AllocatedQuantity, MinimumThreshold, StorageLocation, ExpiryDate, Status) VALUES
('Bottled Water (24-pack)', 'Water', 'cases', 5000, 3200, 1000, 'Warehouse A', '2026-11-01', 'Available'),
('MRE (Meals Ready to Eat)', 'Food', 'boxes', 8000, 6500, 2000, 'Warehouse A', '2027-06-01', 'Available'),
('Emergency Blankets', 'Blankets', 'units', 10000, 7500, 2000, 'Warehouse B', NULL, 'Available'),
('First Aid Kits', 'Medical', 'kits', 2000, 1650, 500, 'Medical Storage', '2026-12-31', 'Available'),
('Tents (4-person)', 'Shelter Materials', 'units', 800, 620, 200, 'Warehouse C', NULL, 'Available'),
('Sleeping Bags', 'Blankets', 'units', 3000, 2100, 500, 'Warehouse B', NULL, 'Available'),
('Hygiene Kits', 'Hygiene Kits', 'kits', 5000, 3800, 1000, 'Warehouse B', '2026-08-31', 'Available'),
('Portable Generators', 'Tools', 'units', 150, 98, 30, 'Equipment Storage', NULL, 'Available'),
('Water Purification Tablets', 'Water', 'bottles', 1000, 720, 200, 'Medical Storage', '2026-05-31', 'Available'),
('Canned Food Assortment', 'Food', 'cases', 6000, 4200, 1500, 'Warehouse A', '2026-12-31', 'Available'),
('Children Clothing Packs', 'Clothing', 'packs', 1500, 980, 300, 'Warehouse B', NULL, 'Available'),
('Adult Clothing Packs', 'Clothing', 'packs', 2000, 1340, 400, 'Warehouse B', NULL, 'Available'),
('Flashlights with Batteries', 'Tools', 'units', 4000, 2800, 800, 'Equipment Storage', NULL, 'Available'),
('Prescription Medication Cache', 'Medical', 'units', 500, 280, 100, 'Medical Storage', '2026-03-31', 'Low Stock'),
('Baby Formula', 'Food', 'cases', 800, 620, 200, 'Warehouse A', '2026-02-28', 'Available');

-- 5. SUPPLY_DISTRIBUTIONS
INSERT INTO SupplyDistributions (DisasterID, ShelterID, SupplyID, Quantity, DistributionDate, DistributedBy, ReceivedBy, Notes) VALUES
(1, 1, 1, 500, '2025-11-18 10:00:00', 'Distribution Team A', 'Maria Garcia', 'Initial water distribution'),
(1, 1, 2, 800, '2025-11-18 10:30:00', 'Distribution Team A', 'Maria Garcia', 'Food supplies for evacuees'),
(1, 2, 1, 600, '2025-11-18 12:00:00', 'Distribution Team B', 'James Wilson', 'Water delivery'),
(1, 2, 3, 700, '2025-11-18 13:00:00', 'Distribution Team B', 'James Wilson', 'Emergency blankets'),
(2, 3, 1, 1200, '2025-11-15 14:00:00', 'Distribution Team C', 'Sarah Thompson', 'Urgent water supplies'),
(2, 3, 2, 1500, '2025-11-15 15:00:00', 'Distribution Team C', 'Sarah Thompson', 'Food for hurricane evacuees'),
(2, 4, 7, 600, '2025-11-16 09:00:00', 'Distribution Team D', 'Robert Martinez', 'Hygiene kits distribution'),
(3, 5, 1, 900, '2025-11-20 08:00:00', 'Distribution Team E', 'Linda Chen', 'Flood emergency water'),
(3, 5, 5, 120, '2025-11-20 10:00:00', 'Distribution Team E', 'Linda Chen', 'Tents for displaced families'),
(4, 6, 4, 250, '2025-11-10 15:00:00', 'Distribution Team F', 'David Park', 'Medical supplies - earthquake'),
(4, 7, 3, 400, '2025-11-10 16:00:00', 'Distribution Team G', 'Jennifer Lee', 'Blankets for shelter'),
(5, 8, 2, 350, '2025-11-12 22:00:00', 'Distribution Team H', 'Michael Brown', 'Emergency food - tornado'),
(7, 10, 14, 80, '2025-11-19 17:00:00', 'Medical Team Alpha', 'Charles Johnson', 'Prescription meds for chemical exposure');

-- 6. VOLUNTEERS
INSERT INTO Volunteers (FirstName, LastName, Email, Phone, Skills, Certification, AvailabilityStatus, TotalHoursContributed, EmergencyContact, EmergencyPhone, JoinedDate) VALUES
('Emily', 'Rodriguez', 'emily.rodriguez@email.com', '555-0111', 'Registered Nurse, First Aid, CPR', 'RN License, EMT-Basic', 'Deployed', 420, 'Carlos Rodriguez', '555-0112', '2024-03-15'),
('Michael', 'Chang', 'michael.chang@email.com', '555-0113', 'Heavy equipment operation, Construction', 'OSHA 30, Forklift Certified', 'Available', 280, 'Lisa Chang', '555-0114', '2024-06-20'),
('Sarah', 'O\'Connor', 'sarah.oconnor@email.com', '555-0115', 'Social work, Counseling, Spanish', 'MSW, Licensed Counselor', 'Deployed', 350, 'James O\'Connor', '555-0116', '2023-11-10'),
('David', 'Patel', 'david.patel@email.com', '555-0117', 'IT Support, Communications, Ham Radio', 'Amateur Radio License', 'Available', 195, 'Priya Patel', '555-0118', '2024-08-05'),
('Jennifer', 'Washington', 'jennifer.washington@email.com', '555-0119', 'Logistics, Supply chain, Inventory', 'PMP Certified', 'Deployed', 510, 'Marcus Washington', '555-0120', '2023-05-22'),
('Robert', 'Kim', 'robert.kim@email.com', '555-0121', 'Paramedic, Rescue operations', 'Paramedic License, Rescue Certified', 'Available', 445, 'Amy Kim', '555-0122', '2023-09-18'),
('Lisa', 'Martinez', 'lisa.martinez@email.com', '555-0123', 'Cooking, Food service, Nutrition', 'Food Handler License', 'Deployed', 380, 'Jose Martinez', '555-0124', '2024-01-30'),
('James', 'Anderson', 'james.anderson@email.com', '555-0125', 'Shelter management, Organization', 'Emergency Management Certificate', 'Available', 220, 'Karen Anderson', '555-0126', '2024-07-12'),
('Michelle', 'Thompson', 'michelle.thompson@email.com', '555-0127', 'Childcare, Education, First Aid', 'Teaching License, CPR', 'Deployed', 310, 'Brian Thompson', '555-0128', '2024-02-08'),
('Christopher', 'Lee', 'christopher.lee@email.com', '555-0129', 'Medical doctor, Trauma care', 'MD License, ATLS Certified', 'Available', 180, 'Susan Lee', '555-0130', '2024-09-25'),
('Amanda', 'Garcia', 'amanda.garcia@email.com', '555-0131', 'Translation (English/Spanish), Admin', 'Certified Translator', 'Deployed', 265, 'Miguel Garcia', '555-0132', '2024-04-14'),
('Daniel', 'Brown', 'daniel.brown@email.com', '555-0133', 'Search and rescue, K9 handler', 'SAR Certified, K9 Handler', 'On Leave', 520, 'Patricia Brown', '555-0134', '2023-02-20'),
('Jessica', 'Wilson', 'jessica.wilson@email.com', '555-0135', 'Mental health, Crisis counseling', 'Licensed Psychologist', 'Available', 290, 'Thomas Wilson', '555-0136', '2024-05-19'),
('Kevin', 'Nguyen', 'kevin.nguyen@email.com', '555-0137', 'Photography, Documentation, Drone pilot', 'FAA Part 107 Drone License', 'Available', 145, 'Linda Nguyen', '555-0138', '2024-10-03'),
('Rachel', 'Taylor', 'rachel.taylor@email.com', '555-0139', 'Veterinary care, Animal rescue', 'DVM License', 'Deployed', 225, 'Steven Taylor', '555-0140', '2024-06-28');

-- 7. VOLUNTEER_ASSIGNMENTS
INSERT INTO VolunteerAssignments (VolunteerID, DisasterID, ShelterID, Role, AssignedDate, CompletedDate, HoursWorked, Status, Notes) VALUES
(1, 1, 1, 'Medical Support', '2025-11-18 09:00:00', NULL, 72, 'Active', 'Providing medical care at shelter'),
(3, 1, 1, 'Counseling Services', '2025-11-18 12:00:00', NULL, 68, 'Active', 'Mental health support for evacuees'),
(5, 1, 2, 'Supply Coordinator', '2025-11-18 10:00:00', NULL, 70, 'Active', 'Managing supply distribution'),
(7, 2, 3, 'Food Service Manager', '2025-11-15 14:00:00', NULL, 156, 'Active', 'Running shelter kitchen'),
(9, 2, 3, 'Childcare Coordinator', '2025-11-15 16:00:00', NULL, 148, 'Active', 'Caring for displaced children'),
(11, 2, 4, 'Translation Services', '2025-11-16 08:00:00', NULL, 120, 'Active', 'Assisting Spanish-speaking evacuees'),
(15, 3, 5, 'Animal Care', '2025-11-20 07:00:00', NULL, 36, 'Active', 'Pet shelter management'),
(6, 4, 6, 'Emergency Medical', '2025-11-10 14:00:00', '2025-11-18 18:00:00', 96, 'Completed', 'Treated earthquake injuries'),
(10, 4, 6, 'Medical Director', '2025-11-10 13:30:00', '2025-11-18 20:00:00', 102, 'Completed', 'Coordinated medical response'),
(2, 5, 8, 'Debris Removal', '2025-11-13 08:00:00', '2025-11-17 17:00:00', 88, 'Completed', 'Heavy equipment operations'),
(8, 5, 8, 'Shelter Manager', '2025-11-12 21:00:00', '2025-11-19 12:00:00', 156, 'Completed', 'Managed shelter operations'),
(13, 7, 10, 'Crisis Counseling', '2025-11-19 16:00:00', NULL, 48, 'Active', 'Supporting affected families'),
(4, 1, NULL, 'Communications Specialist', '2025-11-18 08:00:00', NULL, 74, 'Active', 'Managing emergency communications');

-- 8. DAMAGE_ASSESSMENTS
INSERT INTO DamageAssessments (DisasterID, Location, AssessmentDate, AssessedBy, StructuralDamage, Casualties, Injuries, DisplacedPersons, EstimatedCost, Description, Status) VALUES
(1, 'Paradise, CA', '2025-11-18 14:00:00', 'CAL FIRE Assessment Team', 'Destroyed', 12, 45, 15000, 850000000.00, '3,200 structures destroyed, entire town evacuated', 'Preliminary'),
(1, 'Redding North District', '2025-11-19 10:00:00', 'CAL FIRE Assessment Team', 'Severe', 3, 28, 8000, 320000000.00, '850 homes damaged or destroyed', 'Preliminary'),
(2, 'Gulf Shores Coastal Area', '2025-11-16 08:00:00', 'FEMA Assessment Team A', 'Severe', 28, 156, 45000, 3200000000.00, 'Widespread flooding, structural damage along coast', 'Confirmed'),
(2, 'Pensacola Downtown', '2025-11-16 11:00:00', 'FEMA Assessment Team B', 'Moderate', 8, 72, 25000, 1500000000.00, 'Wind damage, flooding in low-lying areas', 'Confirmed'),
(3, 'Fresno County Agricultural Zone', '2025-11-20 10:00:00', 'County Assessment Team', 'Moderate', 0, 12, 5000, 180000000.00, 'Crop damage, homes flooded, infrastructure damage', 'Preliminary'),
(3, 'Merced Residential Area', '2025-11-21 09:00:00', 'County Assessment Team', 'Minor', 0, 5, 2500, 45000000.00, '200 homes with water damage', 'Preliminary'),
(4, 'Seattle Downtown Core', '2025-11-10 16:00:00', 'USGS/FEMA Team', 'Moderate', 5, 82, 15000, 680000000.00, 'Several building collapses, infrastructure damage', 'Confirmed'),
(4, 'Tacoma Port Area', '2025-11-11 09:00:00', 'USGS/FEMA Team', 'Minor', 0, 24, 3500, 125000000.00, 'Port infrastructure damage, minor structural issues', 'Final'),
(5, 'Dallas North Suburbs', '2025-11-13 07:00:00', 'NWS Assessment Team', 'Severe', 8, 45, 8500, 280000000.00, 'EF4 tornado path, complete destruction of neighborhoods', 'Confirmed'),
(5, 'Plano Area', '2025-11-13 08:00:00', 'NWS Assessment Team', 'Moderate', 2, 18, 4200, 95000000.00, 'EF3 damage, multiple structures affected', 'Confirmed'),
(7, 'Baton Rouge Industrial Zone', '2025-11-19 16:00:00', 'EPA/FEMA Team', 'Severe', 4, 38, 1500, 75000000.00, 'Chemical contamination zone, structural damage to plant', 'Preliminary');

-- 9. AFFECTED_POPULATIONS
INSERT INTO AffectedPopulations (DisasterID, Region, TotalAffected, Displaced, Injured, Deceased, Missing, InShelters, NeedMedical, NeedFood, RecordedDate) VALUES
(1, 'Butte County', 28000, 15000, 45, 12, 3, 1010, 120, 8500, '2025-11-19 18:00:00'),
(1, 'Shasta County', 17000, 8000, 28, 3, 1, 623, 85, 5200, '2025-11-19 18:00:00'),
(2, 'Escambia County, FL', 75000, 45000, 156, 28, 12, 1720, 420, 32000, '2025-11-17 10:00:00'),
(2, 'Baldwin County, AL', 45000, 25000, 72, 8, 5, 520, 180, 18000, '2025-11-17 10:00:00'),
(3, 'Fresno County', 18000, 5000, 12, 0, 0, 890, 45, 12000, '2025-11-21 12:00:00'),
(3, 'Merced County', 7000, 2500, 5, 0, 0, 0, 15, 4500, '2025-11-21 12:00:00'),
(4, 'King County, WA', 52000, 15000, 82, 5, 2, 412, 220, 8500, '2025-11-11 14:00:00'),
(4, 'Pierce County, WA', 28000, 8500, 24, 0, 0, 298, 95, 4200, '2025-11-11 14:00:00'),
(5, 'Dallas County, TX', 12000, 8500, 45, 8, 0, 215, 128, 6800, '2025-11-13 16:00:00'),
(5, 'Collin County, TX', 5500, 4200, 18, 2, 0, 0, 52, 3200, '2025-11-13 16:00:00'),
(6, 'Maricopa County, AZ', 180000, 12000, 0, 0, 0, 178, 850, 95000, '2025-11-20 08:00:00'),
(7, 'East Baton Rouge Parish', 8000, 1500, 38, 4, 0, 312, 85, 2500, '2025-11-19 20:00:00');

-- 10. RECOVERY_PROJECTS
INSERT INTO RecoveryProjects (DisasterID, ProjectName, ProjectType, Description, Location, Budget, FundingSource, StartDate, ExpectedEndDate, Status, ProjectManager, Beneficiaries, ProgressPercentage) VALUES
(2, 'Gulf Coast Infrastructure Rebuild', 'Infrastructure', 'Rebuild roads, bridges, and utilities damaged by hurricane', 'Gulf Shores, AL', 450000000.00, 'FEMA/State Funds', '2025-11-20', '2026-11-20', 'In Progress', 'Thomas Anderson', 45000, 15),
(2, 'Pensacola Housing Reconstruction', 'Housing', 'Rebuild and repair damaged homes for displaced families', 'Pensacola, FL', 280000000.00, 'HUD/Insurance', '2025-11-25', '2026-08-31', 'Planned', 'Maria Santos', 8500, 5),
(4, 'Seattle Building Retrofit Program', 'Infrastructure', 'Earthquake retrofit for damaged buildings', 'Seattle, WA', 185000000.00, 'State/Federal Funds', '2025-11-15', '2026-05-15', 'In Progress', 'David Chen', 15000, 35),
(4, 'Port of Tacoma Recovery', 'Infrastructure', 'Repair port infrastructure and facilities', 'Tacoma, WA', 95000000.00, 'Port Authority/Insurance', '2025-11-12', '2026-02-28', 'In Progress', 'Jennifer Park', 2500, 55),
(5, 'North Dallas Community Rebuilding', 'Housing', 'Rebuild homes destroyed by tornado', 'Dallas, TX', 120000000.00, 'FEMA/Donations', '2025-11-18', '2026-06-18', 'In Progress', 'Robert Williams', 2800, 20),
(5, 'Plano Schools Reconstruction', 'Education', 'Rebuild damaged schools and educational facilities', 'Plano, TX', 45000000.00, 'School District/FEMA', '2025-12-01', '2026-07-31', 'Planned', 'Linda Martinez', 3500, 0),
(1, 'Paradise Town Rebuilding Initiative', 'Infrastructure', 'Complete town infrastructure rebuild after wildfire', 'Paradise, CA', 680000000.00, 'State/Federal/Insurance', '2026-01-15', '2028-12-31', 'Planned', 'Michael Brown', 15000, 0),
(3, 'Central Valley Agricultural Recovery', 'Livelihood', 'Support farmers with crop recovery and soil restoration', 'Fresno/Merced Counties', 85000000.00, 'USDA/State Grants', '2025-11-25', '2026-10-31', 'Planned', 'Patricia Green', 5000, 0);

-- 11. ALERTS
INSERT INTO Alerts (AlertType, Severity, Title, Message, AffectedRegion, IssuedBy, IssuedAt, ExpiresAt, Status, DisasterID) VALUES
('Evacuation', 'Emergency', 'Immediate Evacuation Order - Wildfire', 'Mandatory evacuation for all residents in Paradise and surrounding areas due to rapidly spreading wildfire. Leave immediately via Highway 99 South.', 'Paradise, CA', 'CAL FIRE Emergency Operations', '2025-11-18 06:30:00', NULL, 'Active', 1),
('Early Warning', 'Critical', 'Red Flag Warning - High Fire Danger', 'Extreme fire danger conditions. Winds gusting to 50mph. Avoid all outdoor burning. Be prepared to evacuate.', 'Northern California', 'National Weather Service', '2025-11-18 05:00:00', '2025-11-23 18:00:00', 'Active', 1),
('Evacuation', 'Emergency', 'Hurricane Evacuation Order', 'Mandatory evacuation for coastal areas. Hurricane Melissa approaching as Category 4. Evacuate to designated shelters immediately.', 'Florida Panhandle', 'Florida Emergency Management', '2025-11-15 08:00:00', '2025-11-15 20:00:00', 'Expired', 2),
('All Clear', 'Info', 'Hurricane All Clear - Limited Return', 'Hurricane has passed. Residents may return to assess damage. Use caution - power lines down, flooding present.', 'Gulf Coast FL/AL', 'FEMA Region 4', '2025-11-17 14:00:00', NULL, 'Active', 2),
('Evacuation', 'Critical', 'Flash Flood Warning - Immediate Action', 'Flash flooding in progress. Move to higher ground immediately. Do not attempt to cross flooded roads.', 'Fresno County, CA', 'National Weather Service', '2025-11-20 02:15:00', '2025-11-21 12:00:00', 'Active', 3),
('Supply Request', 'Warning', 'Critical Supply Shortage', 'Urgent need for bottled water, emergency food, and medical supplies at evacuation shelters. Donations needed.', 'Northern California', 'CA Emergency Services', '2025-11-19 14:00:00', '2025-11-25 23:59:00', 'Active', 1),
('Volunteer Needed', 'Warning', 'Volunteers Urgently Needed', 'Seeking medical professionals, shelter workers, and logistics coordinators for disaster relief operations.', 'Florida/Alabama Gulf Coast', 'American Red Cross', '2025-11-16 10:00:00', '2025-11-30 23:59:00', 'Active', 2),
('Early Warning', 'Critical', 'Aftershock Warning', 'Multiple aftershocks expected following 6.2 magnitude earthquake. Stay clear of damaged structures. Be prepared.', 'Seattle Metropolitan Area', 'USGS Earthquake Center', '2025-11-10 12:00:00', '2025-11-15 23:59:00', 'Expired', 4),
('Evacuation', 'Emergency', 'Chemical Contamination - Evacuate Now', 'Chemical release from industrial facility. Evacuate 2-mile radius immediately. Avoid exposure to fumes.', 'East Baton Rouge, LA', 'Louisiana HAZMAT', '2025-11-19 14:25:00', NULL, 'Active', 7),
('Early Warning', 'Warning', 'Severe Drought - Water Restrictions', 'Stage 4 drought emergency. Mandatory water restrictions in effect. Conservation required for all users.', 'Arizona', 'Arizona Dept of Water Resources', '2025-11-15 00:00:00', '2026-05-01 00:00:00', 'Active', 6);
