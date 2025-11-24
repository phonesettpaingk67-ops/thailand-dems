# Alert Management System - Integration Guide

## Overview
The Alert Management System is fully integrated with the Disaster Management system, automatically creating alerts when disasters are added or updated.

---

## 🔗 System Integration

### Automatic Alert Creation

**When a disaster is created:**
1. User creates a disaster via `/api/disasters` (POST)
2. System automatically creates a corresponding alert
3. Alert severity matches disaster severity:
   - Catastrophic → Emergency Alert
   - Severe → Critical Alert
   - Moderate → Warning Alert
   - Minor → Info Alert
4. Alert type is determined by severity:
   - Catastrophic/Severe → "Evacuation" alert
   - Moderate/Minor → "Early Warning" alert

**When a disaster status changes:**
1. User updates disaster status via `/api/disasters/:id` (PUT)
2. If Status field is changed, system creates status update alert
3. Alert notifies affected region of status change

---

## 📋 Alert Management Features

### 1. View All Alerts
- **Endpoint:** `GET /api/alerts`
- **Filters:** status, severity, disasterType
- **Response:** Array of all alerts with linked disaster info

### 2. View Active Alerts Only
- **Endpoint:** `GET /api/alerts/active`
- **Auto-filters:** Active status + not expired
- **Used by:** Dashboard homepage

### 3. Create Manual Alert
- **Endpoint:** `POST /api/alerts`
- **Access:** Admin UI at `/admin/alerts`
- **Can link to existing disaster:** Optional DisasterID field
- **Fields:**
  - AlertType: Early Warning, Evacuation, All Clear, Supply Request, Volunteer Needed, Other
  - Severity: Info, Warning, Critical, Emergency
  - Title: Alert headline
  - Message: Detailed alert message
  - AffectedRegion: Geographic area
  - IssuedBy: Organization/department name
  - ExpiresAt: Optional expiration date
  - DisasterID: Optional link to disaster

### 4. Update Alert
- **Endpoint:** `PUT /api/alerts/:id`
- **Can update:** Any field including status
- **Use case:** Edit alert details, extend expiration

### 5. Cancel Alert
- **Endpoint:** `POST /api/alerts/:id/cancel`
- **Action:** Sets Status to 'Cancelled'
- **Use case:** Situation resolved, alert no longer needed

### 6. Delete Alert
- **Endpoint:** `DELETE /api/alerts/:id`
- **Action:** Permanently removes alert
- **Use case:** Remove test alerts or errors

### 7. View Alerts by Disaster
- **Endpoint:** `GET /api/alerts/disaster/:disasterId`
- **Returns:** All alerts linked to specific disaster
- **Use case:** View alert history for disaster

---

## 🎯 Usage Workflow

### Scenario 1: New Disaster Event
```
1. Emergency responder reports new flood in Bangkok
2. Admin creates disaster via disaster management system:
   - DisasterType: Flood
   - Severity: Severe
   - AffectedRegion: Bangkok Metropolitan
3. System AUTOMATICALLY creates alert:
   - AlertType: Evacuation
   - Severity: Critical
   - Title: "Severe Flood Alert - Bangkok Metropolitan"
   - Message: "A severe flood has been reported in Bangkok Metropolitan..."
4. Alert appears on public dashboard immediately
5. Optional: Admin can create additional manual alerts for:
   - Evacuation routes
   - Shelter locations
   - Supply requests
```

### Scenario 2: Manual Alert Creation
```
1. Admin accesses /admin/alerts
2. Clicks "Create New Alert"
3. Selects:
   - Alert Type: Supply Request
   - Severity: Critical
   - Title: "Urgent: Medical Supplies Needed"
   - Message: "Critical shortage of medical supplies..."
   - Affected Region: Phuket Province
   - Link to Disaster: [Select active disaster]
4. Alert created and visible to public
```

### Scenario 3: Disaster Status Update
```
1. Flood situation improves
2. Admin updates disaster status: Active → Under Control
3. System AUTOMATICALLY creates alert:
   - AlertType: Early Warning
   - Title: "Disaster Status Update - Bangkok Flood"
   - Message: "Status updated to: Under Control"
4. Public informed of status change
```

---

## 🔐 Access Control

### Public Access (No Auth Required)
- View active alerts on dashboard
- See alert details (severity, message, region)
- Filter alerts by disaster type

### Admin Access (Future: Auth Required)
- Create new alerts
- Edit existing alerts
- Cancel alerts
- Delete alerts
- Link alerts to disasters
- View alert statistics

---

## 🗄️ Database Schema

### Alerts Table
```sql
AlertID (INT, PK, Auto-increment)
AlertType (ENUM: 'Early Warning', 'Evacuation', 'All Clear', 'Supply Request', 'Volunteer Needed', 'Other')
Severity (ENUM: 'Info', 'Warning', 'Critical', 'Emergency')
Title (VARCHAR 200)
Message (TEXT)
AffectedRegion (VARCHAR 100)
IssuedBy (VARCHAR 100)
IssuedAt (DATETIME, default NOW())
ExpiresAt (DATETIME, nullable)
Status (ENUM: 'Active', 'Expired', 'Cancelled', default 'Active')
DisasterID (INT, FK to Disasters, nullable)
```

### Relationship
- Alerts.DisasterID → Disasters.DisasterID (One-to-Many)
- One disaster can have multiple alerts
- Alert can exist independently (DisasterID = NULL)

---

## 🎨 Frontend Components

### Dashboard Display (`/app/page.js`)
- Shows top 5 active alerts
- Collapsible section with dropdown
- Color-coded by severity
- Displays: Title, Message, Region, Issued time
- "Manage Alerts" button → links to admin page

### Admin Interface (`/app/admin/alerts/page.js`)
- Full CRUD interface
- Filter by status and severity
- Create form with all fields
- Edit existing alerts
- Cancel/Delete buttons
- Shows linked disaster info
- Real-time alert count

---

## 🔄 Auto-Expiration (Future Enhancement)

Currently implemented as a function, can be scheduled:
```javascript
alertController.expireOldAlerts()
```
- Runs periodically (recommend: every hour)
- Checks ExpiresAt field
- Sets Status = 'Expired' for past-due alerts
- Can be triggered via cron job or scheduler

---

## 📊 Alert Statistics

Available metrics:
- Total alerts
- Active alerts count
- Alerts by severity
- Alerts by type
- Alerts by disaster
- Emergency alert count

---

## 🚀 Integration Points

### 1. Disaster Creation Hook
File: `backend/controllers/disasterController.js`
Function: `createDisaster()`
```javascript
// After disaster created
await alertController.autoCreateDisasterAlert(disasterData, 'created');
```

### 2. Disaster Update Hook
File: `backend/controllers/disasterController.js`
Function: `updateDisaster()`
```javascript
// If status changed
if (updateFields.Status) {
  await alertController.autoCreateDisasterAlert(disaster, 'statusChanged');
}
```

### 3. Dashboard Display
File: `frontend/app/page.js`
Fetches: `/api/dashboard` (includes activeAlerts)

### 4. Admin Management
File: `frontend/app/admin/alerts/page.js`
API: `/api/alerts` (all endpoints)

---

## 🎯 Best Practices

1. **Creating Alerts:**
   - Use clear, concise titles
   - Provide actionable information in message
   - Set appropriate severity level
   - Link to disaster when applicable
   - Set expiration for time-sensitive alerts

2. **Managing Alerts:**
   - Cancel alerts when situation resolved
   - Update alerts if information changes
   - Don't delete unless absolutely necessary (audit trail)
   - Review expired alerts periodically

3. **Disaster Integration:**
   - System creates initial alert automatically
   - Create follow-up alerts manually as needed
   - Use different alert types for different purposes:
     - Early Warning: Initial notification
     - Evacuation: Action required
     - Supply Request: Resource needs
     - All Clear: Situation resolved

---

## 📱 User Experience Flow

### Public User:
1. Visits dashboard
2. Sees "Active Alerts" section (collapsed)
3. Clicks to expand → views all active alerts
4. Sees severity badges (color-coded)
5. Reads alert details and takes action

### Admin User:
1. Monitors dashboard
2. Clicks "Manage Alerts" button
3. Views all alerts with filters
4. Creates new alerts as needed
5. Edits/cancels alerts based on situation
6. Links alerts to relevant disasters

---

## 🔧 Maintenance

### Regular Tasks:
- Review active alerts weekly
- Archive expired alerts monthly
- Monitor alert creation patterns
- Update alert templates as needed
- Clean up cancelled alerts quarterly

### Monitoring:
- Track emergency alert count
- Monitor alert response times
- Review alert-to-disaster ratio
- Check for orphaned alerts (no disaster link)

---

## 🎯 Future Enhancements

1. **Authentication & Authorization:**
   - Admin-only access to management
   - Role-based permissions
   - Audit logging

2. **Notifications:**
   - Email alerts for emergency severity
   - SMS integration
   - Push notifications

3. **Templates:**
   - Pre-defined alert templates
   - Quick-create for common scenarios

4. **Analytics:**
   - Alert effectiveness metrics
   - Response time tracking
   - Regional alert density

5. **Multi-language:**
   - Thai/English alerts
   - Automatic translation

---

## ✅ Testing Checklist

- [x] Create disaster → Alert auto-created
- [x] Update disaster status → Status alert created
- [x] Manual alert creation works
- [x] Alert editing works
- [x] Alert cancellation works
- [x] Alert deletion works
- [x] Dashboard displays active alerts
- [x] Filtering by status/severity works
- [x] Disaster linking works
- [x] Alert expiration field works

---

## 📞 API Reference Summary

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| /api/alerts | GET | Get all alerts | Public |
| /api/alerts/active | GET | Get active only | Public |
| /api/alerts/:id | GET | Get single alert | Public |
| /api/alerts | POST | Create alert | Admin |
| /api/alerts/:id | PUT | Update alert | Admin |
| /api/alerts/:id/cancel | POST | Cancel alert | Admin |
| /api/alerts/:id | DELETE | Delete alert | Admin |
| /api/alerts/disaster/:id | GET | Get by disaster | Public |

---

**Last Updated:** November 23, 2025
**Version:** 1.0
**Status:** Production Ready
