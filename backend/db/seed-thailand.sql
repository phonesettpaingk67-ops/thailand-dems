-- THAILAND DISASTER MANAGEMENT SYSTEM - SEED DATA

USE disaster_management_db;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Alerts;
TRUNCATE TABLE RecoveryProjects;
TRUNCATE TABLE AffectedPopulations;
TRUNCATE TABLE DamageAssessments;
TRUNCATE TABLE VolunteerAssignments;
TRUNCATE TABLE Volunteers;
TRUNCATE TABLE SupplyDistributions;
TRUNCATE TABLE ReliefSupplies;
TRUNCATE TABLE DisasterShelters;
TRUNCATE TABLE Shelters;
TRUNCATE TABLE Disasters;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. DISASTERS (Thailand-based with diverse types and locations)
INSERT INTO Disasters (DisasterName, DisasterType, Severity, Description, AffectedRegion, Latitude, Longitude, StartDate, EndDate, Status, EstimatedAffectedPopulation, EstimatedDamage) VALUES
('Bangkok Flooding 2025', 'Flood', 'Severe', 'Severe flooding in Bangkok metropolitan area due to monsoon rains', 'Bangkok Metropolitan', 13.7563, 100.5018, '2025-11-15 02:00:00', NULL, 'Active', 350000, 15000000000.00),
('Chiang Mai Wildfire', 'Wildfire', 'Severe', 'Forest fires in northern mountains affecting air quality and villages', 'Chiang Mai Province', 18.7883, 98.9853, '2025-11-10 08:00:00', NULL, 'Active', 85000, 2500000000.00),
('Phuket Tsunami Warning', 'Tsunami', 'Catastrophic', 'Tsunami warning issued after undersea earthquake', 'Andaman Coast', 7.8804, 98.3923, '2025-11-20 14:30:00', NULL, 'Active', 150000, 8000000000.00),
('Isaan Drought Crisis', 'Drought', 'Catastrophic', 'Severe drought affecting rice farming in northeastern Thailand', 'Isaan Region', 16.0544, 102.8157, '2025-08-01 00:00:00', NULL, 'Active', 2500000, 25000000000.00),
('Krabi Landslide', 'Landslide', 'Moderate', 'Heavy rain triggered landslides blocking roads and damaging homes', 'Krabi Province', 8.0863, 98.9063, '2025-11-18 06:00:00', '2025-11-19 12:00:00', 'Recovery', 12000, 450000000.00),
('Ayutthaya Industrial Fire', 'Industrial Accident', 'Severe', 'Major chemical factory fire in industrial estate', 'Ayutthaya Province', 14.3532, 100.5776, '2025-11-19 11:00:00', NULL, 'Contained', 25000, 3500000000.00),
('Kanchanaburi Flash Flood', 'Flood', 'Moderate', 'Flash flooding from dam overflow affecting riverside communities', 'Kanchanaburi Province', 14.0227, 99.5328, '2025-11-17 03:00:00', '2025-11-19 18:00:00', 'Recovery', 45000, 1200000000.00),
('Nakhon Ratchasima Tornado', 'Tornado', 'Severe', 'Rare tornado outbreak destroying villages in Korat plateau', 'Nakhon Ratchasima', 14.9799, 102.0977, '2025-11-12 16:00:00', '2025-11-12 17:30:00', 'Closed', 8500, 680000000.00),
('Songkhla Hurricane Impact', 'Hurricane', 'Moderate', 'Tropical storm causing coastal flooding and wind damage', 'Songkhla Province', 7.2092, 100.5951, '2025-11-16 20:00:00', NULL, 'Active', 65000, 1800000000.00),
('Chonburi Hazmat Spill', 'Industrial Accident', 'Severe', 'Chemical spill from industrial facility requiring evacuation', 'Chonburi Province', 13.3611, 100.9847, '2025-11-21 09:30:00', NULL, 'Active', 18000, 950000000.00),
('Sukhothai Agricultural Crisis', 'Drought', 'Moderate', 'Water shortage affecting crops and livestock in central plains', 'Sukhothai Province', 17.0077, 99.8231, '2025-10-01 00:00:00', NULL, 'Active', 125000, 2200000000.00),
('Surat Thani Flash Floods', 'Flood', 'Severe', 'Rapid flooding from tropical depression affecting southern region', 'Surat Thani Province', 9.1382, 99.3331, '2025-11-14 05:00:00', NULL, 'Active', 95000, 3800000000.00);

-- 2. SHELTERS (Thailand locations)
INSERT INTO Shelters (ShelterName, ShelterType, Address, City, Latitude, Longitude, Capacity, CurrentOccupancy, Status, Facilities, ContactPerson, ContactPhone) VALUES
('Bangkok Stadium Evacuation Center', 'Evacuation Center', '154 Rama I Road', 'Bangkok', 13.7465, 100.5345, 2000, 1580, 'Full', 'Medical station, Meals, Showers, WiFi, Childcare', 'Somchai Prasert', '02-555-0101'),
('Chiang Mai University Shelter', 'Temporary', '239 Huay Kaew Road', 'Chiang Mai', 18.8025, 98.9517, 1200, 680, 'Available', 'Sleeping areas, Meals, Medical screening, Air purifiers', 'Apinya Wongsakul', '053-555-0202'),
('Phuket Convention Center', 'Relief Camp', '123 Thepkasattri Road', 'Phuket', 7.9897, 98.3380, 1800, 1800, 'Full', 'Full medical, Showers, Meals, Translation services, Pet area', 'Natthaphon Saengchan', '076-555-0303'),
('Patong Beach Emergency Shelter', 'Evacuation Center', '88 Beach Road', 'Patong', 7.8965, 98.2965, 800, 720, 'Available', 'Basic shelter, Water, Food, First aid', 'Siriporn Tanaka', '076-555-0404'),
('Udon Thani Relief Camp', 'Relief Camp', '456 Pho Si Road', 'Udon Thani', 17.4145, 102.7878, 2500, 1850, 'Available', 'Water distribution, Meals, Medical, Sleeping areas, Showers', 'Wanchai Srisuk', '042-555-0505'),
('Khon Kaen Community Center', 'Community Center', '789 Malai Road', 'Khon Kaen', 16.4322, 102.8236, 1500, 950, 'Available', 'Meals, Medical, Showers, Clothing distribution', 'Pranee Khamsaen', '043-555-0606'),
('Krabi Sports Complex', 'Temporary', '321 Maharaj Road', 'Krabi Town', 8.0522, 98.9155, 600, 380, 'Available', 'Sleeping areas, Meals, First aid, Clean water', 'Surasak Pholdee', '075-555-0707'),
('Ayutthaya Temple Shelter', 'Evacuation Center', '100 Naresuan Road', 'Ayutthaya', 14.3520, 100.5677, 900, 520, 'Available', 'Decontamination, Medical, Meals, Temporary housing', 'Thawatchai Boonyarat', '035-555-0808'),
('Kanchanaburi School Shelter', 'Temporary', '250 Saengchuto Road', 'Kanchanaburi', 14.0042, 99.5450, 750, 420, 'Available', 'Sleeping areas, Meals, Clean water, Medical', 'Jiraporn Kaewkong', '034-555-0909'),
('Hat Yai Emergency Center', 'Evacuation Center', '88 Niphat Uthit Road', 'Hat Yai', 7.0089, 100.4747, 1000, 150, 'Available', 'Full facilities, Medical, Meals, Showers', 'Anong Suttikul', '074-555-1010');

-- 3. DISASTER_SHELTERS
INSERT INTO DisasterShelters (DisasterID, ShelterID, ActivatedAt, PeakOccupancy) VALUES
(1, 1, '2025-11-15 04:00:00', 1650),
(1, 8, '2025-11-15 06:00:00', 580),
(2, 2, '2025-11-10 10:00:00', 750),
(3, 3, '2025-11-20 15:00:00', 1800),
(3, 4, '2025-11-20 15:30:00', 780),
(4, 5, '2025-08-15 00:00:00', 2100),
(4, 6, '2025-09-01 00:00:00', 1200),
(5, 7, '2025-11-18 08:00:00', 450),
(6, 8, '2025-11-19 12:00:00', 580),
(7, 9, '2025-11-17 05:00:00', 520),
(9, 10, '2025-11-16 22:00:00', 820),
(10, 1, '2025-11-21 10:00:00', 450),
(12, 10, '2025-11-14 07:00:00', 1150);

-- 4. RELIEF_SUPPLIES
INSERT INTO ReliefSupplies (SupplyName, Category, Unit, TotalQuantity, AllocatedQuantity, MinimumThreshold, StorageLocation, ExpiryDate, Status) VALUES
('Drinking Water (20L bottles)', 'Water', 'bottles', 15000, 9800, 3000, 'Bangkok Warehouse', '2026-11-01', 'Available'),
('Rice (50kg bags)', 'Food', 'bags', 10000, 7200, 2500, 'Central Storage', '2026-08-31', 'Available'),
('Instant Noodles (Cases)', 'Food', 'cases', 8000, 5600, 2000, 'Bangkok Warehouse', '2026-06-30', 'Available'),
('Emergency Blankets', 'Blankets', 'units', 12000, 8500, 2500, 'Regional Depot', NULL, 'Available'),
('First Aid Kits', 'Medical', 'kits', 3000, 2100, 800, 'Medical Storage Bangkok', '2026-12-31', 'Available'),
('Tents (6-person)', 'Shelter Materials', 'units', 1200, 850, 300, 'Equipment Depot', NULL, 'Available'),
('Mosquito Nets', 'Shelter Materials', 'units', 5000, 3200, 1000, 'Regional Depot', NULL, 'Available'),
('Water Purification Tablets', 'Water', 'bottles', 2000, 1450, 500, 'Medical Storage Bangkok', '2026-04-30', 'Available'),
('Hygiene Kits', 'Hygiene Kits', 'kits', 6000, 4200, 1500, 'Regional Depot', '2026-07-31', 'Available'),
('Canned Fish (Cases)', 'Food', 'cases', 7000, 4900, 1800, 'Central Storage', '2027-03-31', 'Available'),
('Baby Formula (Thai brands)', 'Food', 'cases', 1200, 820, 300, 'Central Storage', '2026-03-31', 'Available'),
('Face Masks (N95)', 'Medical', 'boxes', 4000, 2800, 1000, 'Medical Storage Bangkok', '2027-12-31', 'Available'),
('Portable Generators', 'Tools', 'units', 200, 145, 50, 'Equipment Depot', NULL, 'Available'),
('Flashlights with Batteries', 'Tools', 'units', 5000, 3500, 1200, 'Equipment Depot', NULL, 'Available'),
('Traditional Medicine Kits', 'Medical', 'kits', 800, 520, 200, 'Medical Storage Bangkok', '2026-06-30', 'Low Stock');

-- 5. SUPPLY_DISTRIBUTIONS
INSERT INTO SupplyDistributions (DisasterID, ShelterID, SupplyID, Quantity, DistributionDate, DistributedBy, ReceivedBy, Notes) VALUES
(1, 1, 1, 1500, '2025-11-15 06:00:00', 'Bangkok Relief Team', 'Somchai Prasert', 'Emergency water distribution'),
(1, 1, 2, 800, '2025-11-15 08:00:00', 'Bangkok Relief Team', 'Somchai Prasert', 'Rice for evacuees'),
(1, 8, 1, 600, '2025-11-15 09:00:00', 'Ayutthaya Team', 'Thawatchai Boonyarat', 'Water supply'),
(2, 2, 12, 500, '2025-11-10 12:00:00', 'Chiang Mai Medical', 'Apinya Wongsakul', 'Face masks for smoke'),
(2, 2, 4, 700, '2025-11-10 14:00:00', 'Chiang Mai Team', 'Apinya Wongsakul', 'Blankets distribution'),
(3, 3, 1, 2000, '2025-11-20 16:00:00', 'Phuket Emergency', 'Natthaphon Saengchan', 'Urgent water for tsunami evacuees'),
(3, 3, 3, 1200, '2025-11-20 17:00:00', 'Phuket Emergency', 'Natthaphon Saengchan', 'Emergency food supplies'),
(3, 4, 9, 800, '2025-11-20 18:00:00', 'Patong Team', 'Siriporn Tanaka', 'Hygiene kits'),
(4, 5, 1, 1800, '2025-08-20 08:00:00', 'Isaan Relief', 'Wanchai Srisuk', 'Drought emergency water'),
(4, 6, 2, 1500, '2025-09-05 10:00:00', 'Khon Kaen Team', 'Pranee Khamsaen', 'Rice distribution'),
(5, 7, 6, 80, '2025-11-18 10:00:00', 'Krabi Team', 'Surasak Pholdee', 'Tents for displaced families'),
(6, 8, 15, 120, '2025-11-19 14:00:00', 'Medical Response', 'Thawatchai Boonyarat', 'Medical supplies for chemical exposure'),
(7, 9, 1, 650, '2025-11-17 07:00:00', 'Kanchanaburi Team', 'Jiraporn Kaewkong', 'Flood emergency water');

-- 6. VOLUNTEERS (Thai names)
INSERT INTO Volunteers (FirstName, LastName, Email, Phone, Skills, Certification, AvailabilityStatus, TotalHoursContributed, EmergencyContact, EmergencyPhone, JoinedDate) VALUES
('Supawadee', 'Rattanakorn', 'supawadee.r@email.com', '081-555-0111', 'Registered Nurse, Thai traditional medicine', 'RN License, First Aid', 'Deployed', 380, 'Kitti Rattanakorn', '081-555-0112', '2024-03-15'),
('Narong', 'Srisawat', 'narong.s@email.com', '082-555-0113', 'Heavy machinery, Construction', 'Forklift certified, Safety training', 'Available', 295, 'Malee Srisawat', '082-555-0114', '2024-05-20'),
('Pimchanok', 'Thammasat', 'pimchanok.t@email.com', '083-555-0115', 'Social work, Psychology, English/Thai', 'Licensed Social Worker', 'Deployed', 420, 'Somkid Thammasat', '083-555-0116', '2023-09-10'),
('Wuttichai', 'Charoensuk', 'wuttichai.c@email.com', '084-555-0117', 'IT, Communications, Amateur radio', 'Radio Operator License', 'Available', 210, 'Nittaya Charoensuk', '084-555-0118', '2024-07-05'),
('Kanokwan', 'Phongphit', 'kanokwan.p@email.com', '085-555-0119', 'Logistics, Supply chain management', 'Logistics Certificate', 'Deployed', 485, 'Prasert Phongphit', '085-555-0120', '2023-04-22'),
('Thanapol', 'Saetang', 'thanapol.s@email.com', '086-555-0121', 'Paramedic, Water rescue', 'Paramedic License, Rescue Diver', 'Available', 510, 'Suree Saetang', '086-555-0122', '2023-08-18'),
('Sirilak', 'Wongsawat', 'sirilak.w@email.com', '087-555-0123', 'Cooking, Food safety, Nutrition', 'Food Handler License', 'Deployed', 365, 'Boonmee Wongsawat', '087-555-0124', '2024-02-10'),
('Kittipong', 'Nguyen', 'kittipong.n@email.com', '088-555-0125', 'Shelter management, Organization', 'Emergency Management', 'Available', 245, 'Pranee Nguyen', '088-555-0126', '2024-06-15'),
('Rattana', 'Somboon', 'rattana.s@email.com', '089-555-0127', 'Teaching, Childcare, First aid', 'Teacher License, CPR', 'Deployed', 330, 'Chantra Somboon', '089-555-0128', '2024-01-20'),
('Anuwat', 'Kiatprasert', 'anuwat.k@email.com', '090-555-0129', 'Medical doctor, Emergency medicine', 'MD License, ATLS', 'Available', 195, 'Wandee Kiatprasert', '090-555-0130', '2024-08-30'),
('Patcharee', 'Srisuwan', 'patcharee.s@email.com', '091-555-0131', 'Translation (Thai/English/Chinese)', 'Certified Translator', 'Deployed', 280, 'Somsak Srisuwan', '091-555-0132', '2024-03-25'),
('Boonsong', 'Tantiwong', 'boonsong.t@email.com', '092-555-0133', 'Search and rescue, Mountain guide', 'SAR Certified, Mountain Guide', 'On Leave', 550, 'Nuchanart Tantiwong', '092-555-0134', '2023-01-15'),
('Wipada', 'Mongkol', 'wipada.m@email.com', '093-555-0135', 'Mental health counseling, PTSD therapy', 'Licensed Psychologist', 'Available', 310, 'Chai Mongkol', '093-555-0136', '2024-04-18'),
('Somchai', 'Rattanaporn', 'somchai.r@email.com', '094-555-0137', 'Photography, Drone operation', 'Drone Pilot License', 'Available', 160, 'Mali Rattanaporn', '094-555-0138', '2024-09-10'),
('Nuttaporn', 'Sukhum', 'nuttaporn.s@email.com', '095-555-0139', 'Veterinary care, Animal rescue', 'DVM License', 'Deployed', 240, 'Thana Sukhum', '095-555-0140', '2024-05-22');

-- 7. VOLUNTEER_ASSIGNMENTS
INSERT INTO VolunteerAssignments (VolunteerID, DisasterID, ShelterID, Role, AssignedDate, CompletedDate, HoursWorked, Status, Notes) VALUES
(1, 1, 1, 'Medical Support', '2025-11-15 06:00:00', NULL, 96, 'Active', 'Treating flood-related illnesses'),
(3, 1, 1, 'Counseling Services', '2025-11-15 08:00:00', NULL, 92, 'Active', 'Supporting displaced families'),
(5, 1, 8, 'Supply Coordinator', '2025-11-15 07:00:00', NULL, 94, 'Active', 'Managing relief supplies'),
(7, 3, 3, 'Food Service Manager', '2025-11-20 16:00:00', NULL, 32, 'Active', 'Cooking for tsunami evacuees'),
(9, 3, 3, 'Childcare Coordinator', '2025-11-20 17:00:00', NULL, 30, 'Active', 'Caring for children'),
(11, 3, 4, 'Translation Services', '2025-11-20 16:30:00', NULL, 31, 'Active', 'Helping tourists and locals'),
(15, 2, 2, 'Animal Care', '2025-11-10 11:00:00', NULL, 218, 'Active', 'Pet evacuation support'),
(6, 5, 7, 'Water Rescue', '2025-11-18 07:00:00', '2025-11-20 18:00:00', 58, 'Completed', 'Landslide rescue operations'),
(10, 6, 8, 'Medical Director', '2025-11-19 12:00:00', NULL, 52, 'Active', 'Treating chemical exposure'),
(2, 7, 9, 'Debris Removal', '2025-11-17 06:00:00', '2025-11-19 20:00:00', 62, 'Completed', 'Flood cleanup'),
(8, 4, 5, 'Shelter Manager', '2025-08-20 00:00:00', NULL, 720, 'Active', 'Long-term drought shelter operations'),
(13, 1, 1, 'Crisis Counseling', '2025-11-15 10:00:00', NULL, 88, 'Active', 'Mental health support'),
(4, 2, NULL, 'Communications', '2025-11-10 09:00:00', NULL, 222, 'Active', 'Emergency communications network');

-- 8. DAMAGE_ASSESSMENTS
INSERT INTO DamageAssessments (DisasterID, Location, AssessmentDate, AssessedBy, StructuralDamage, Casualties, Injuries, DisplacedPersons, EstimatedCost, Description, Status) VALUES
(1, 'Klong Toey District', '2025-11-15 10:00:00', 'Bangkok DDPM Team', 'Moderate', 3, 45, 85000, 4500000000.00, '12,000 homes flooded, infrastructure damage', 'Preliminary'),
(1, 'Thonburi Area', '2025-11-16 09:00:00', 'Bangkok DDPM Team', 'Severe', 8, 82, 120000, 6200000000.00, 'Major flooding, road closures, power outages', 'Preliminary'),
(2, 'Doi Suthep Villages', '2025-11-11 08:00:00', 'Chiang Mai Forestry', 'Severe', 2, 28, 15000, 1800000000.00, 'Multiple villages evacuated, forest destruction', 'Confirmed'),
(3, 'Patong Beach Area', '2025-11-20 17:00:00', 'NDWC Assessment', 'Minor', 0, 12, 45000, 2500000000.00, 'Coastal damage assessment ongoing', 'Preliminary'),
(3, 'Phi Phi Islands', '2025-11-20 18:00:00', 'NDWC Assessment', 'Moderate', 5, 38, 8000, 1200000000.00, 'Resort damage, evacuation completed', 'Preliminary'),
(4, 'Nakhon Ratchasima Province', '2025-09-15 10:00:00', 'Agriculture Ministry', 'Moderate', 0, 0, 180000, 18000000000.00, '500,000 rai of rice fields damaged', 'Confirmed'),
(5, 'Ao Nang District', '2025-11-18 10:00:00', 'Krabi DDPM', 'Moderate', 2, 18, 5000, 280000000.00, 'Road blocked, 50 homes damaged', 'Final'),
(6, 'Rojana Industrial Estate', '2025-11-19 14:00:00', 'DIP/DDPM Joint', 'Severe', 6, 42, 8000, 2800000000.00, 'Chemical contamination zone established', 'Preliminary'),
(7, 'Sangkhlaburi District', '2025-11-17 08:00:00', 'Kanchanaburi DDPM', 'Moderate', 1, 22, 12000, 850000000.00, 'Riverside homes flooded', 'Confirmed');

-- 9. AFFECTED_POPULATIONS
INSERT INTO AffectedPopulations (DisasterID, Region, TotalAffected, Displaced, Injured, Deceased, Missing, InShelters, NeedMedical, NeedFood, RecordedDate) VALUES
(1, 'Bangkok Metropolitan', 350000, 205000, 127, 11, 4, 2160, 850, 180000, '2025-11-16 18:00:00'),
(2, 'Chiang Mai Province', 85000, 15000, 28, 2, 0, 680, 95, 22000, '2025-11-12 14:00:00'),
(3, 'Phuket and Islands', 95000, 53000, 50, 5, 8, 2520, 185, 45000, '2025-11-20 20:00:00'),
(3, 'Krabi Coast', 55000, 8000, 18, 2, 2, 380, 68, 12000, '2025-11-20 20:00:00'),
(4, 'Isaan Region (15 provinces)', 2500000, 180000, 0, 0, 0, 4050, 1200, 850000, '2025-11-01 12:00:00'),
(5, 'Krabi Province', 12000, 5000, 18, 2, 0, 380, 45, 8000, '2025-11-19 10:00:00'),
(6, 'Ayutthaya Industrial Area', 25000, 8000, 42, 6, 0, 520, 128, 15000, '2025-11-19 18:00:00'),
(7, 'Kanchanaburi Province', 45000, 12000, 22, 1, 0, 420, 85, 28000, '2025-11-18 16:00:00'),
(8, 'Nakhon Ratchasima', 8500, 3500, 12, 0, 0, 0, 28, 5000, '2025-11-13 10:00:00'),
(9, 'Songkhla Province', 65000, 18000, 35, 3, 1, 850, 145, 38000, '2025-11-17 12:00:00'),
(10, 'Chonburi Province', 18000, 12000, 15, 2, 0, 450, 78, 10000, '2025-11-21 14:00:00'),
(11, 'Sukhothai Province', 125000, 8000, 5, 0, 0, 320, 85, 65000, '2025-10-15 10:00:00'),
(12, 'Surat Thani Province', 95000, 42000, 68, 7, 3, 1200, 220, 52000, '2025-11-15 08:00:00');

-- 10. RECOVERY_PROJECTS
INSERT INTO RecoveryProjects (DisasterID, ProjectName, ProjectType, Description, Location, Budget, FundingSource, StartDate, ExpectedEndDate, Status, ProjectManager, Beneficiaries, ProgressPercentage) VALUES
(1, 'Bangkok Flood Barrier System', 'Infrastructure', 'Install permanent flood barriers and drainage improvements', 'Bangkok Metropolitan', 28000000000.00, 'Government/World Bank', '2025-12-01', '2027-12-31', 'Planned', 'Narong Chalermsuk', 350000, 0),
(1, 'Klong Toey Housing Restoration', 'Housing', 'Rebuild damaged homes for flood victims', 'Klong Toey, Bangkok', 5500000000.00, 'Government/NGOs', '2025-11-25', '2026-08-31', 'Planned', 'Wanpen Suksa', 15000, 5),
(2, 'Northern Forest Restoration', 'Infrastructure', 'Reforest burned areas and prevent future fires', 'Chiang Mai Mountains', 1200000000.00, 'Forestry Dept/UN', '2025-12-15', '2028-12-31', 'Planned', 'Somkid Panya', 85000, 0),
(4, 'Isaan Water Management', 'Infrastructure', 'Build reservoirs and irrigation systems', 'Northeastern Thailand', 45000000000.00, 'Government/ADB', '2026-01-01', '2029-12-31', 'Planned', 'Prasit Boonma', 2500000, 0),
(4, 'Agricultural Recovery Program', 'Livelihood', 'Support farmers with new crops and water-saving techniques', 'Isaan Region', 8500000000.00, 'Agriculture Ministry', '2025-12-01', '2026-12-31', 'Planned', 'Suwan Kaewkong', 500000, 0),
(5, 'Krabi Road Reconstruction', 'Infrastructure', 'Rebuild mountain roads damaged by landslide', 'Krabi Province', 650000000.00, 'Department of Highways', '2025-11-25', '2026-05-31', 'In Progress', 'Thawee Sombat', 12000, 25),
(6, 'Ayutthaya Industrial Decontamination', 'Infrastructure', 'Clean up chemical contamination and rebuild factory', 'Ayutthaya Province', 4200000000.00, 'Company/Insurance', '2025-12-01', '2026-11-30', 'Planned', 'Amnuay Techakul', 25000, 0);

-- 11. ALERTS
INSERT INTO Alerts (AlertType, Severity, Title, Message, AffectedRegion, IssuedBy, IssuedAt, ExpiresAt, Status, DisasterID) VALUES
('Evacuation', 'Emergency', 'Tsunami Evacuation Order', 'Immediate evacuation to high ground. Tsunami waves expected within 2 hours. Move inland immediately.', 'Andaman Coast', 'Thai Meteorological Department', '2025-11-20 14:35:00', NULL, 'Active', 3),
('Early Warning', 'Critical', 'Severe Flood Warning - Bangkok', 'Water levels rising rapidly. Evacuate low-lying areas. Emergency shelters open citywide.', 'Bangkok Metropolitan', 'Bangkok Metropolitan Administration', '2025-11-15 03:00:00', '2025-11-22 23:59:00', 'Active', 1),
('Early Warning', 'Warning', 'Air Quality Alert - Smoke Haze', 'PM2.5 levels hazardous. Stay indoors, wear N95 masks if going outside. Schools closed.', 'Northern Thailand', 'Pollution Control Department', '2025-11-10 09:00:00', '2025-11-25 23:59:00', 'Active', 2),
('Supply Request', 'Critical', 'Urgent: Water and Food Needed', 'Critical shortage of drinking water and food at Phuket shelters. Donations urgently needed.', 'Phuket Province', 'Department of Disaster Prevention', '2025-11-20 18:00:00', '2025-11-27 23:59:00', 'Active', 3),
('Volunteer Needed', 'Warning', 'Medical Volunteers Required', 'Seeking doctors, nurses, and paramedics for disaster relief in Bangkok and Ayutthaya.', 'Central Thailand', 'Thai Red Cross', '2025-11-15 10:00:00', '2025-11-30 23:59:00', 'Active', 1),
('Early Warning', 'Critical', 'Drought Emergency Declaration', 'Stage 5 drought declared. Water rationing in effect. Critical conservation measures required.', 'Northeastern Thailand', 'National Water Resources', '2025-10-01 00:00:00', '2026-05-31 23:59:00', 'Active', 4),
('Early Warning', 'Warning', 'Storm Surge Warning - Southern Coast', 'High waves and coastal flooding expected. Fishing boats return to port. Beachfront evacuations recommended.', 'Songkhla Province', 'Thai Meteorological Department', '2025-11-16 19:00:00', '2025-11-24 23:59:00', 'Active', 9),
('Evacuation', 'Critical', 'Chemical Spill Evacuation', '2km radius evacuation due to hazardous material release. Decontamination centers operational.', 'Chonburi Industrial Zone', 'Department of Industrial Works', '2025-11-21 09:45:00', NULL, 'Active', 10),
('Supply Request', 'Warning', 'Agricultural Aid Needed', 'Emergency seed and feed distribution required for drought-affected farmers. Relief supplies low.', 'Sukhothai Province', 'Ministry of Agriculture', '2025-10-05 00:00:00', '2025-12-31 23:59:00', 'Active', 11),
('Early Warning', 'Critical', 'Flash Flood Warning - Surat Thani', 'Heavy rainfall continues. Rivers at critical levels. Residents near waterways evacuate immediately.', 'Surat Thani Province', 'Department of Water Resources', '2025-11-14 04:00:00', '2025-11-23 23:59:00', 'Active', 12),
('Volunteer Needed', 'Info', 'Reconstruction Volunteers Needed', 'Seeking volunteers for cleanup and reconstruction in Krabi landslide areas.', 'Krabi Province', 'Thai Red Cross', '2025-11-19 15:00:00', '2025-12-31 23:59:00', 'Active', 5),
('Evacuation', 'Emergency', 'Chemical Hazard - Evacuate Immediately', 'Chemical fire at industrial plant. Evacuate 5km radius immediately. Avoid toxic fumes.', 'Ayutthaya Province', 'Department of Industrial Works', '2025-11-19 11:15:00', NULL, 'Active', 6),
('All Clear', 'Info', 'Flood Waters Receding', 'Flood levels decreasing in Kanchanaburi. Residents may return but use caution. Utilities still limited.', 'Kanchanaburi Province', 'Provincial DDPM Office', '2025-11-19 20:00:00', NULL, 'Active', 7),
('Early Warning', 'Warning', 'Landslide Risk - Heavy Rain', 'Continued heavy rainfall increases landslide risk in mountainous areas. Stay alert, avoid hillsides.', 'Southern Provinces', 'Thai Meteorological Department', '2025-11-18 00:00:00', '2025-11-23 23:59:00', 'Active', 5);
