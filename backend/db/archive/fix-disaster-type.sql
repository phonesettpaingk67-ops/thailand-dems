-- Fix DisasterType ENUM to include Storm
USE disaster_management_db;

ALTER TABLE Disasters 
MODIFY COLUMN DisasterType ENUM(
    'Earthquake', 
    'Flood', 
    'Hurricane', 
    'Wildfire', 
    'Tsunami', 
    'Tornado', 
    'Drought', 
    'Landslide', 
    'Volcanic Eruption', 
    'Industrial Accident', 
    'Storm', 
    'Other'
) NOT NULL;
