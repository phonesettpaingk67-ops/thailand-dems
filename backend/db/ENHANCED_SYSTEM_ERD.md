# THAILAND DISASTER & EMERGENCY MANAGEMENT SYSTEM (DEMS) - ERD
**Database: disaster_management_db (MySQL)**
**Version: 2.5 (Production) | Last Updated: November 24, 2025**

---

## 📊 QUICK SUMMARY

**Total Database Tables: 31**
- ✅ Core System: 13 tables (FULLY WORKING)
- ✅ Enhanced System: 11 tables (WORKING)
- 🔧 Future Features: 7 tables (CODE EXISTS, NOT WORKING YET)
- ❌ Removed: 3 tables (VolunteerSkills, TrainingPrograms, VolunteerTraining)

**Working Features ✅:**
- 🏢 Multi-Agency Coordination
- 🏠 Partner Facilities & Host Families Management
- 👥 Enhanced Volunteer Management
- 📍 Thailand Geographic Data (Provinces, Cities, Landmarks)
- 📱 Citizen Reporting System

**Future Features 🔧 (Code Exists, Not Working Yet):**
- 4-Tier Response Escalation System
- AI Resource Intelligence & Smart Recommendations
- Auto-Capacity Analysis & Alerts
- Volunteer Authentication Portal & Login System

---

## Database Architecture Overview

### CORE DISASTER MANAGEMENT SYSTEM
```
                    ┌─────────────────────────────────┐
                    │      Disasters                  │
                    │  - DisasterID (PK)              │
                    │  - DisasterName                 │
                    │  - DisasterType (ENUM)          │
                    │  - Severity (ENUM)              │
                    │  - Status (ENUM)                │
                    │  - AffectedRegion               │
                    │  - Latitude, Longitude          │
                    │  - StartDate, EndDate           │
                    │  - EstimatedAffectedPopulation  │
                    │  - EstimatedDamage              │
                    └─────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┬─────────────────┐
         │                         │                         │                 │
         ▼                         ▼                         ▼                 ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐  ┌─────────────────┐
│  Alerts          │   │DisasterShelters  │   │VolunteerAssign   │  │SupplyDistrib    │
│ -AlertID (PK)    │   │ -ID (PK)         │   │ments             │  │utions           │
│ -DisasterID (FK) │   │ -DisasterID (FK) │   │ -AssignmentID(PK)│  │ -DistributionID │
│ -AlertType       │   │ -ShelterID (FK)  │   │ -VolunteerID(FK) │  │  (PK)           │
│ -Severity        │   │ -ActivatedAt     │   │ -DisasterID (FK) │  │ -DisasterID(FK) │
│ -Title, Message  │   │ -PeakOccupancy   │   │ -ShelterID (FK)  │  │ -ShelterID (FK) │
└──────────────────┘   └──────────────────┘   │ -Role, Hours     │  │ -SupplyID (FK)  │
                                              └──────────────────┘  └─────────────────┘
                                                       │                      │
                                                       ▼                      ▼
                                              ┌──────────────────┐  ┌─────────────────┐
                                              │   Volunteers     │  │  ReliefSupplies │
                                              │ -VolunteerID(PK) │  │ -SupplyID (PK)  │
                                              │ -FirstName       │  │ -SupplyName     │
                                              │ -LastName        │  │ -Category       │
                                              │ -Email, Phone    │  │ -TotalQuantity  │
                                              │ -Availability    │  │ -Allocated      │
                                              │  Status (ENUM)   │  │  Quantity       │
                                              │ -Skills          │  │ -Available      │
                                              │ -Certification   │  │  Quantity       │
                                              │ -TotalHours      │  │ -Status (ENUM)  │
                                              └──────────────────┘  └─────────────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────────┐
                                              │VolunteerAccounts     │
                                              │ -AccountID (PK)      │
                                              │ -VolunteerID (FK)    │
                                              │ -Username (UNIQUE)   │
                                              │ -Password            │
                                              │ -IsActive            │
                                              │ -LastLogin           │
                                              └──────────────────────┘

┌─────────────────────┐          ┌──────────────────────┐          ┌────────────────────┐
│   Shelters          │          │  DamageAssessments   │          │AffectedPopulations │
│ -ShelterID (PK)     │          │ -AssessmentID (PK)   │          │ -RecordID (PK)     │
│ -ShelterName        │          │ -DisasterID (FK)     │          │ -DisasterID (FK)   │
│ -ShelterType (ENUM) │          │ -Location            │          │ -Region            │
│ -Address, City      │          │ -AssessmentDate      │          │ -TotalAffected     │
│ -Capacity           │          │ -AssessedBy          │          │ -Displaced         │
│ -CurrentOccupancy   │          │ -StructuralDamage    │          │ -Injured, Deceased │
│ -Status (ENUM)      │          │ -Casualties, Injuries│          │ -Missing           │
│ -Facilities         │          │ -DisplacedPersons    │          │ -InShelters        │
│ -ContactPerson      │          │ -EstimatedCost       │          │ -NeedMedical       │
└─────────────────────┘          │ -Status (ENUM)       │          │ -NeedFood          │
                                 └──────────────────────┘          └────────────────────┘

┌──────────────────────┐         ┌─────────────────────────┐       ┌────────────────────┐
│  RecoveryProjects    │         │   UserReports           │       │ThailandLocations   │
│ -ProjectID (PK)      │         │  -ReportID (PK)         │       │ -LocationID (PK)   │
│ -DisasterID (FK)     │         │  -UserName, Email       │       │ -LocationName      │
│ -ProjectName         │         │  -UserPhone             │       │ -LocationType      │
│ -ProjectType (ENUM)  │         │  -ReportedLocation      │       │  (ENUM)            │
│ -Description         │         │  -DisasterType (ENUM)   │       │ -Province          │
│ -Location            │         │  -Severity (ENUM)       │       │ -Region (ENUM)     │
│ -Budget              │         │  -Description           │       │ -Latitude          │
│ -FundingSource       │         │  -ReportedAt            │       │ -Longitude         │
│ -StartDate, EndDate  │         │  -Status (ENUM)         │       │ -Population        │
│ -Status (ENUM)       │         │  -AdminNotes            │       │ -IsActive          │
│ -ProjectManager      │         │  -VerifiedBy, At        │       └────────────────────┘
│ -ProgressPercentage  │         │  -Latitude, Longitude   │
└──────────────────────┘         └─────────────────────────┘
```

### ENHANCED FEATURES (IMPLEMENTED & ACTIVE)

#### 1. AGENCY PARTNERSHIP SYSTEM ✅ (4 Tables + APIs)
```
┌──────────────────────────┐
│      Agencies            │
│   - AgencyID (PK)        │
│   - AgencyName           │
│   - AgencyType (ENUM)    │────┐
│   - ResponseCapability   │    │
│   - ContactInfo          │    │
│   - Status (ENUM)        │    │
└──────────────────────────┘    │
         │                      │
    ┌────┴─────┬────────────────┴──────────┬─────────────────┐
    │          │                           │                 │
    ▼          ▼                           ▼                 ▼
┌─────────┐  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│AgencyMOU│  │AgencyResources  │  │AgencyActivations │  │PartnerFacilities │
│-MOUID   │  │-ResourceID (PK) │  │-ActivationID(PK) │  │-FacilityID (PK)  │
│ (PK)    │  │-AgencyID (FK)   │  │-DisasterID (FK)  │  │-FacilityName     │
│-AgencyID│  │-ResourceType    │  │-AgencyID (FK)    │  │-PartnerAgencyID  │
│ (FK)    │  │-Quantity        │  │-ActivatedAt      │  │ (FK)             │
│-MOUType │  │-Availability    │  │-Status (ENUM)    │  │-FacilityType     │
│-Status  │  │-Status (ENUM)   │  │-ResourcesDeployed│  │-MaxCapacity      │
└─────────┘  └─────────────────┘  └──────────────────┘  │-ActivationStatus │
                                                         └──────────────────┘
```
**API Routes:**
- `/api/agencies` - Full CRUD operations
- `/api/partner-facilities` - Facility management

---

#### 2. ENHANCED VOLUNTEER SYSTEM ✅ (4 Tables - Simplified)
```
┌──────────────────────────┐
│     Volunteers           │
│  - VolunteerID (PK)      │
│  - Skills (TEXT)         │  ← Skills stored as TEXT, not separate table
│  - AvailabilityStatus    │
└──────────────────────────┘
         │
    ┌────┴────┬────────────────┬──────────────────┐
    │         │                │                  │
    ▼         ▼                ▼                  ▼
┌────────────┐ ┌──────────────┐ ┌─────────────────┐ ┌─────────────┐
│Volunteer   │ │Volunteer     │ │Recruitment      │ │Skills       │
│Availability│ │Deployments   │ │Campaigns        │ │             │
│-Availability│ │-DeploymentID│ │-CampaignID (PK) │ │-SkillID(PK) │
│ ID (PK)    │ │ (PK)         │ │-CampaignName    │ │-SkillName   │
│-Volunteer  │ │-DisasterID  │ │-TargetVolunteers│ │-Category    │
│ ID (FK)    │ │ (FK)         │ │-RequiredSkills  │ │-Level       │
│-StartDate  │ │-Role         │ │-StartDate       │ └─────────────┘
│-EndDate    │ │-Status       │ │-Status (ENUM)   │
│-Status     │ └──────────────┘ └─────────────────┘
│ (ENUM)     │
└────────────┘

❌ NOT IMPLEMENTED:
- VolunteerSkills (junction table - removed)
- TrainingPrograms (not needed)
- VolunteerTraining (not needed)
```
**API Routes:**
- `/api/volunteers-enhanced` - Enhanced volunteer features

---

#### 3. DYNAMIC SHELTER NETWORK ✅ (2 Tables)
```
                      ┌──────────────────────────┐
                      │      Disasters           │
                      └──────────────────────────┘
                                   │
                                   ▼
                      ┌──────────────────────────────┐
                      │ ShelterActivationRequests    │
                      │  - RequestID (PK)            │
                      │  - DisasterID (FK)           │
                      │  - FacilityID (FK)           │
                      │  - ShelterID (FK)            │
                      │  - RequestDate               │
                      │  - Status (ENUM)             │
                      │  - ApprovedBy                │
                      └──────────────────────────────┘
                         │                      │
        ┌────────────────┴────┐                │
        │                     │                │
        ▼                     ▼                ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│PartnerFacilities │  │   Shelters       │  │   HostFamilies       │
│  -FacilityID(PK) │  │  -ShelterID(PK)  │  │  -HostFamilyID (PK)  │
│  -FacilityName   │  │  -ShelterName    │  │  -FamilyName         │
│  -FacilityType   │  │  -ShelterType    │  │  -ContactPerson      │
│  -MaxCapacity    │  │  -Capacity       │  │  -MaxGuests          │
│  -Activation     │  │  -Current        │  │  -CurrentGuests      │
│   Agreement      │  │   Occupancy      │  │  -BackgroundCheck    │
│  -ActivationTime │  │  -Status         │  │   Status (ENUM)      │
└──────────────────┘  └──────────────────┘  │  -VerifiedDate       │
                                            └──────────────────────┘
```
**API Routes:**
- `/api/partner-facilities` - Facility activation management

---

#### 4. RESOURCE INTELLIGENCE 🔧 (3 Tables - FUTURE/PLANNED)
```
┌──────────────────────────┐
│      Disasters           │
└──────────────────────────┘
         │
    ┌────┴────┬────────────────┐
    │         │                │
    ▼         ▼                ▼
┌────────────┐ ┌──────────────┐ ┌──────────────┐
│Capacity    │ │Resource      │ │Smart         │
│Alerts      │ │Requests      │ │Recommenda    │
│            │ │              │ │tions         │
│-AlertID    │ │-RequestID    │ │-Recommendation│
│ (PK)       │ │ (PK)         │ │ ID (PK)       │
│-DisasterID │ │-DisasterID   │ │-DisasterID   │
│ (FK)       │ │ (FK)         │ │ (FK)          │
│-AlertType  │ │-ResourceType │ │-Recommenda   │
│-Severity   │ │-QuantityNeed │ │ tionType      │
│-Gap        │ │-Priority     │ │-Priority     │
│-GapPercent │ │-Status (ENUM)│ │-Impact       │
│-Recommend  │ │-AllocatedTo  │ │-Status (ENUM)│
│ ations     │ └──────────────┘ └──────────────┘
└────────────┘

ALERT TYPES:
- Shelter Shortage
- Volunteer Shortage  
- Supply Shortage
- Medical Shortage
- Transport Shortage

RECOMMENDATION TYPES:
- Activate Shelter
- Request Volunteers
- Contact Agency
- Escalate Tier
- Deploy Resources
```
**Status:** 🔧 Backend code and database tables exist, but not fully working on website yet

**API Routes (Exist but not integrated):**
- `/api/resource-intelligence/disasters/:id/analyze` - Analyze capacity
- `/api/resource-intelligence/disasters/:id/alerts` - Get alerts
- `/api/resource-intelligence/disasters/:id/recommendations` - Get AI suggestions

---

#### 5. EMERGENCY RESPONSE TIERS 🔧 (3 Tables - FUTURE/PLANNED)
```
┌──────────────────────────────┐
│ResponseTierDefinitions       │
│  - TierID (PK)               │
│  - TierLevel (1-4)           │
│  - TierName                  │
│  - TriggerCriteria (JSON)    │
│  - ResourcesAvailable (JSON) │
│  - AgenciesInvolved (JSON)   │
│  - EscalationThreshold       │
└──────────────────────────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌──────────────────┐  ┌───────────────────────┐
│TierEscalations   │  │TierResourceDeployments│
│-EscalationID(PK) │  │-DeploymentID (PK)     │
│-DisasterID (FK)  │  │-DisasterID (FK)       │
│-FromTier         │  │-TierLevel             │
│-ToTier           │  │-ResourceType          │
│-EscalatedAt      │  │-Quantity              │
│-Reason (TEXT)    │  │-DeployedAt            │
│-AutoEscalation   │  │-Status (ENUM)         │
│-ApprovedBy       │  └───────────────────────┘
└──────────────────┘

TIER LEVELS (Framework Design):
┌─────────────────────────────────────────────────────────────┐
│ Tier 1 - Local                                              │
│  Trigger: <5K affected, <50M THB damage, Single district    │
│  Resources: Local shelters, district volunteers             │
│  Agencies: District Office, Local Police                    │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Tier 2 - Regional                                           │
│  Trigger: 5K-50K affected, 50M-500M THB, Multi-district     │
│  Resources: Provincial shelters, regional volunteers, DDPM  │
│  Agencies: Provincial DDPM, Red Cross, Military (if needed) │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Tier 3 - National                                           │
│  Trigger: >50K affected, >500M THB, Multi-province          │
│  Resources: National resources, military, emergency budget  │
│  Agencies: National DDPM, Armed Forces, All ministries      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Tier 4 - International                                      │
│  Trigger: Catastrophic, exceeds national capacity           │
│  Resources: UN agencies, international aid, global resources│
│  Agencies: UN OCHA, ASEAN AHA, Foreign governments          │
└─────────────────────────────────────────────────────────────┘
```
**Status:** 🔧 Backend code and database tables exist, but not fully working on website yet

**API Routes (Exist but not integrated):**
- `/api/tiers/definitions` - Get tier definitions
- `/api/tiers/disasters/:id/evaluate` - Evaluate disaster tier
- `/api/tiers/disasters/:id/escalate` - Escalate to higher tier
- `/api/tiers/check-all-escalations` - Auto-check all disasters

## KEY RELATIONSHIPS (ACTIVE SYSTEM)

### Core System Relationships:
1. **Disasters** → creates → **Alerts** (early warnings, evacuation orders)
2. **Disasters** → activates → **Shelters** via **DisasterShelters** (many-to-many)
3. **Disasters** → triggers → **SupplyDistributions** to shelters/affected areas
4. **Disasters** → requires → **Volunteers** via **VolunteerAssignments**
5. **Disasters** → generates → **DamageAssessments** (impact analysis)
6. **Disasters** → tracks → **AffectedPopulations** (casualties, displaced, missing)
7. **Disasters** → initiates → **RecoveryProjects** (long-term rebuilding)
8. **Citizens** → submit → **UserReports** (early disaster warnings)
9. **ReliefSupplies** → distributed via → **SupplyDistributions** to disasters/shelters
10. **Volunteers** → authenticate via → **VolunteerAccounts** (login system)
11. **ThailandLocations** → provides → Geographic reference data (provinces, cities, landmarks)

### Enhanced System Relationships (IMPLEMENTED ✅):
12. **Disasters** → activates → **Agencies** via **AgencyActivations**
13. **Agencies** → manages → **AgencyResources** (vehicles, equipment, personnel)
14. **Agencies** → has → **AgencyMOU** (partnership agreements)
15. **PartnerFacilities** → linked to → **Agencies** (schools, temples, hotels)
16. **Disasters** → triggers → **CapacityAlerts** (auto-generated warnings)
17. **CapacityAlerts** → generates → **ResourceRequests** (allocation requests)
18. **ResourceRequests** → assigned to → **Agencies** for fulfillment
19. **SmartRecommendations** → suggests → Actions (shelter activation, agency contact, tier escalation)
20. **Disasters** → evaluated by → **ResponseTierDefinitions** (1-4 tier framework)
21. **TierEscalations** → records → Tier changes (manual/auto escalation)
22. **TierResourceDeployments** → tracks → Tier-specific resource allocation
23. **HostFamilies** → activated via → **ShelterActivationRequests**
24. **PartnerFacilities** → activated via → **ShelterActivationRequests**
25. **Volunteers** → scheduled via → **VolunteerAvailability**
26. **Volunteers** → deployed via → **VolunteerDeployments** (enhanced tracking)
27. **RecruitmentCampaigns** → targets → Volunteer recruitment by skills

## DATABASE AUTOMATION

### Current Triggers (Active):
```sql
-- Shelter Status Auto-Update
TRIGGER: update_shelter_status_on_insert
WHEN: New occupancy reaches capacity
ACTION: Change shelter status to 'Full'

-- Supply Status Auto-Update  
TRIGGER: update_supply_status
WHEN: Available quantity changes
ACTION: Update status (Available/Low Stock/Out of Stock)

-- Volunteer Status Update
TRIGGER: update_volunteer_status
WHEN: Volunteer assigned/completed assignment
ACTION: Change availability status

-- Agency Auto-Activation
TRIGGER: auto_activate_agencies
WHEN: New disaster severity matches criteria
ACTION: Create activation record for relevant agencies
```

### Intelligent Automation (IMPLEMENTED ✅):
```
NEW DISASTER REPORTED
        │
        ▼
   ANALYZE CAPACITY (Resource Intelligence)
        │
        ├──> Shelter Gap Detected?
        │    ├─> Create CapacityAlert (Shelter Shortage)
        │    ├─> Generate SmartRecommendation (Activate Partner Facilities)
        │    └─> Create ResourceRequest (assigned to agencies)
        │
        ├──> Volunteer Gap Detected?
        │    ├─> Create CapacityAlert (Volunteer Shortage)
        │    ├─> Launch RecruitmentCampaign
        │    └─> Generate SmartRecommendation (Request Volunteers)
        │
        ├──> Supply Gap Detected?
        │    ├─> Create CapacityAlert (Supply Shortage)
        │    ├─> Generate SmartRecommendation (Contact Agency)
        │    └─> Create ResourceRequest (specific supplies)
        │
        └──> Exceeds Tier Threshold?
             ├─> Evaluate ResponseTier
             ├─> Auto-Escalate if criteria met
             ├─> Create TierEscalation record
             ├─> Deploy TierResourceDeployments
             └─> Notify relevant agencies
```

### Data Flow Example:
```
1. DISASTER REPORTED
   ├─> Create Disaster record
   ├─> Auto-create Alert (if severity ≥ Warning)
   ├─> Check UserReports for related incidents
   ├─> Link to ThailandLocations (affected regions)
   ├─> Evaluate ResponseTier (Tier 1-4)
   └─> Auto-activate matching Agencies

2. CAPACITY ANALYSIS (Auto-triggered)
   ├─> Calculate shelter capacity gap
   ├─> Calculate volunteer gap  
   ├─> Calculate supply needs
   ├─> Create CapacityAlerts for gaps
   ├─> Generate SmartRecommendations
   └─> Create ResourceRequests

3. ADMIN ACTIVATES SHELTERS
   ├─> Create DisasterShelters records
   ├─> Update Shelter.Status = 'Available'
   ├─> Track CurrentOccupancy
   └─> If full → Trigger recommendation for more shelters

4. TIER ESCALATION (Manual or Auto)
   ├─> Evaluate disaster against tier criteria
   ├─> If threshold exceeded → Create TierEscalation
   ├─> Update Disaster.ResponseTier
   ├─> Deploy tier-specific resources
   ├─> Activate tier-appropriate agencies
   └─> Notify command center

5. AGENCY DEPLOYMENT
   ├─> Create AgencyActivation record
   ├─> Link AgencyResources to deployment
   ├─> Update resource availability
   └─> Track deployment status

6. SMART RECOMMENDATIONS
   ├─> AI analyzes capacity gaps
   ├─> Suggests: Activate Shelter, Request Volunteers, Contact Agency
   ├─> Prioritize by impact and urgency
   ├─> Admin can implement with one click
   └─> Track implementation status
```

## DATABASE SUMMARY

### **CORE SYSTEM (ACTIVE): 13 Tables**

#### **Disaster Management Core (10 tables)**
1. **Disasters** - Main disaster/emergency events tracking
2. **Alerts** - Warning system and notifications
3. **Shelters** - Emergency shelters and evacuation centers
4. **DisasterShelters** - Links disasters to active shelters
5. **Volunteers** - Volunteer workforce registry
6. **VolunteerAssignments** - Volunteer deployment to disasters
7. **ReliefSupplies** - Supply inventory management
8. **SupplyDistributions** - Supply delivery tracking
9. **DamageAssessments** - Impact and damage reports
10. **AffectedPopulations** - Population statistics (casualties, displaced)

#### **Recovery & Planning (1 table)**
12. **RecoveryProjects** - Long-term rebuilding projects

#### **Public Engagement (1 table)**
13. **UserReports** - Citizen-submitted disaster reports

#### **Geographic Reference (1 table)**
14. **ThailandLocations** - Thailand provinces, cities, landmarks, universities

---

### **ENHANCED SYSTEM (WORKING): 11 Tables**
*These are ACTIVE and working on the website*

#### **Agency Partnership System (4 tables)** ✅ WORKING
15. **Agencies** - Partner organizations and government agencies
16. **AgencyMOU** - Memorandums of Understanding
17. **AgencyResources** - Resources available from each agency
18. **AgencyActivations** - Agency deployment records

#### **Partner Facilities & Shelter Network (3 tables)** ✅ WORKING
19. **PartnerFacilities** - Schools, temples, hotels for emergency shelters
20. **HostFamilies** - Home-based temporary shelters
21. **ShelterActivationRequests** - Requests to activate facilities

#### **Enhanced Volunteers (4 tables)** ✅ WORKING
22. **VolunteerAvailability** - Volunteer scheduling
23. **VolunteerDeployments** - Enhanced deployment tracking
24. **RecruitmentCampaigns** - Volunteer recruitment drives
25. **Skills** - Skill categories for volunteers

---

### **FUTURE FEATURES (CODE EXISTS): 7 Tables**
*Tables created, APIs exist, but features not fully integrated into website yet*

#### **Volunteer Portal & Authentication (1 table)** 🔧 PLANNED
26. **VolunteerAccounts** - Volunteer authentication/login system

#### **Resource Intelligence (3 tables)** 🔧 PLANNED
27. **CapacityAlerts** - Auto-generated capacity warnings
28. **ResourceRequests** - Resource allocation requests
29. **SmartRecommendations** - AI-powered action suggestions

#### **Response Tier System (3 tables)** 🔧 PLANNED
30. **ResponseTierDefinitions** - 4-tier escalation framework (Local/Regional/National/International)
31. **TierEscalations** - Tier escalation history
32. **TierResourceDeployments** - Tier-specific resource deployments

---

### **NOT IMPLEMENTED (Removed/Skipped): 3 Tables** ❌
- ~~VolunteerSkills~~ - Removed (skills stored in Volunteers.Skills TEXT field)
- ~~TrainingPrograms~~ - Not implemented
- ~~VolunteerTraining~~ - Not implemented

---

## **TOTAL DATABASE TABLES: 31**
- ✅ Core System: 13 tables (WORKING)
- ✅ Enhanced System: 11 tables (WORKING)
- 🔧 Future Features: 7 tables (CODE EXISTS, NOT WORKING YET)

**Total Working Now: 24 tables**  
**Total Planned: 7 tables**

---

## ENUM VALUES REFERENCE

### Disaster Types:
- Earthquake, Flood, Hurricane, Wildfire, Tsunami, Tornado, Drought, Landslide, Volcanic Eruption, Industrial Accident, Storm, Other

### Severity Levels:
- Minor, Moderate, Severe, Catastrophic

### Disaster Status:
- Active, Contained, Recovery, Closed

### Shelter Types:
- Temporary, Permanent, Evacuation Center, Relief Camp, Community Center

### Shelter Status:
- Available, Full, Closed, Under Maintenance

### Supply Categories:
- Food, Water, Medical, Clothing, Blankets, Shelter Materials, Hygiene Kits, Tools, Other

### Supply Status:
- Available, Low Stock, Out of Stock, Expired

### Volunteer Availability:
- Available, Deployed, On Leave, Inactive

### Alert Types:
- Early Warning, Evacuation, All Clear, Supply Request, Volunteer Needed, Other

### Alert Severity:
- Info, Warning, Critical, Emergency

### Project Types:
- Infrastructure, Housing, Healthcare, Education, Livelihood, Community Services, Other

### Project Status:
- Planned, In Progress, Completed, On Hold, Cancelled

### Thailand Regions:
- Northern, Northeastern, Central, Eastern, Western, Southern

---

## FILE STRUCTURE

```
backend/db/
├── schema-disaster.sql           # Main database schema (14 tables)
├── seed-disaster.sql             # Sample data for testing
├── seed-thailand.sql             # Thailand locations seed data
├── create-user-reports.sql       # UserReports table
├── create-volunteer-accounts.sql # VolunteerAccounts table
├── thailand_locations.sql        # Thailand geographic data
├── enhanced_system_schema.sql    # Enhanced features (20 tables)
├── shelter-status-triggers.sql   # Auto-update shelter status
├── supply-status-triggers.sql    # Auto-update supply status
├── volunteer-status-triggers.sql # Auto-update volunteer status
├── agency-activation-triggers.sql# Auto-activate agencies
└── ENHANCED_SYSTEM_ERD.md        # This file
```

---

## SETUP INSTRUCTIONS

### **1. Create Core Database (Required)**
```bash
mysql -u root -p < schema-disaster.sql
mysql -u root -p disaster_management_db < seed-disaster.sql
mysql -u root -p disaster_management_db < create-user-reports.sql
mysql -u root -p disaster_management_db < create-volunteer-accounts.sql
mysql -u root -p disaster_management_db < thailand_locations.sql
mysql -u root -p disaster_management_db < seed-thailand.sql
```

### **2. Add Automation (Optional but Recommended)**
```bash
mysql -u root -p disaster_management_db < shelter-status-triggers.sql
mysql -u root -p disaster_management_db < supply-status-triggers.sql
mysql -u root -p disaster_management_db < volunteer-status-triggers.sql
mysql -u root -p disaster_management_db < agency-activation-triggers.sql
```

### **3. Enhanced Features (Optional - Future)**
```bash
mysql -u root -p disaster_management_db < enhanced_system_schema.sql
```

---

## API ENDPOINTS ALIGNMENT

### **Core System APIs (14 tables):**
- `GET/POST/PUT/DELETE /api/disasters` - Disasters CRUD
- `GET/POST/PUT/DELETE /api/shelters` - Shelters management
- `GET/POST/PUT/DELETE /api/volunteers` - Volunteer registry
- `GET/POST/PUT/DELETE /api/supplies` - Supply inventory
- `GET/POST /api/reports` - UserReports (citizen submissions)
- `GET/POST/PUT /api/alerts` - Alert/notification system
- `GET /api/locations` - Thailand geographic data
- `POST /api/volunteer-auth/login` - Volunteer authentication
- `GET /api/weather/:city` - Weather data integration
- `GET /api/dashboard` - Dashboard statistics

### **Enhanced System APIs (17 tables - ACTIVE ✅):**

#### Agency Partnership:
- `GET/POST/PUT/DELETE /api/agencies` - Agency management
- `GET /api/agencies/:id/resources` - Agency resources
- `POST /api/agencies/:id/activate` - Activate agency for disaster
- `GET /api/agencies/activations` - Activation history

#### Partner Facilities:
- `GET/POST/PUT/DELETE /api/partner-facilities` - Facility CRUD
- `POST /api/partner-facilities/:id/activate` - Activate facility
- `GET /api/partner-facilities/available` - Available facilities

#### Resource Intelligence:
- `POST /api/resource-intelligence/disasters/:id/analyze` - Auto-analyze capacity
- `GET /api/resource-intelligence/disasters/:id/summary` - Capacity summary
- `GET /api/resource-intelligence/disasters/:id/alerts` - Get capacity alerts
- `PUT /api/resource-intelligence/alerts/:id/resolve` - Resolve alert
- `GET /api/resource-intelligence/disasters/:id/recommendations` - AI suggestions
- `PUT /api/resource-intelligence/recommendations/:id/implement` - Execute recommendation

#### Response Tiers:
- `GET /api/tiers/definitions` - Get all tier definitions (1-4)
- `GET /api/tiers/statistics` - Tier usage statistics
- `GET /api/tiers/disasters/:id/evaluate` - Evaluate disaster tier
- `POST /api/tiers/disasters/:id/escalate` - Escalate tier manually
- `GET /api/tiers/disasters/:id/history` - Escalation history
- `GET /api/tiers/disasters/:id/deployments` - Tier deployments
- `POST /api/tiers/deploy` - Deploy tier resources
- `GET /api/tiers/check-all-escalations` - Auto-check all disasters

#### Enhanced Volunteers:
- `GET/POST /api/volunteers-enhanced` - Enhanced volunteer features
- `GET /api/volunteers-enhanced/:id/availability` - Volunteer schedule
- `POST /api/volunteers-enhanced/:id/deploy` - Enhanced deployment
- `GET /api/volunteers-enhanced/campaigns` - Recruitment campaigns

---

## VERSION HISTORY

**v2.5** (Current) - November 2025
- **Total: 31 tables** (24 working + 7 future planned)
- ✅ Core disaster management (13 tables) - FULLY WORKING
- ✅ Agency partnership system (4 tables + APIs) - FULLY WORKING
- ✅ Partner facilities & host families (3 tables) - FULLY WORKING
- ✅ Enhanced volunteer system - simplified (4 tables, no training modules) - FULLY WORKING
- ✅ Thailand-specific location data - FULLY WORKING
- ✅ User reporting system - FULLY WORKING
- 🔧 Volunteer authentication portal (1 table) - CODE EXISTS, NOT WORKING YET
- 🔧 Resource intelligence with AI recommendations (3 tables + APIs) - CODE EXISTS, NOT WORKING YET
- 🔧 4-tier response escalation system (3 tables) - CODE EXISTS, NOT WORKING YET
- ❌ Removed: VolunteerSkills junction table, TrainingPrograms, VolunteerTraining

**v2.0** (Previous) - October 2025
- 14 core tables only
- Basic disaster management
- No enhanced features

**v3.0** (Future/Planned)
- Complete integration of tier system and resource intelligence
- Machine learning predictions
- Advanced analytics dashboard
- Mobile app integration
- Real-time disaster mapping
- International aid coordination
