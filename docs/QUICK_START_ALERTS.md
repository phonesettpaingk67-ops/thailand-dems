# 🚨 Alert Management System - Quick Start Guide

## ✅ What Has Been Implemented

### Backend System (Complete)
✅ **Alert Controller** (`backend/controllers/alertController.js`)
- Full CRUD operations for alerts
- Auto-creation function for disaster alerts
- Filter by status, severity, disaster type
- Alert expiration management

✅ **Alert Routes** (`backend/routes/alerts.js`)
- GET /api/alerts - Get all alerts
- GET /api/alerts/active - Get active alerts only
- GET /api/alerts/:id - Get single alert
- POST /api/alerts - Create new alert
- PUT /api/alerts/:id - Update alert
- POST /api/alerts/:id/cancel - Cancel alert
- DELETE /api/alerts/:id - Delete alert
- GET /api/alerts/disaster/:disasterId - Get alerts for disaster

✅ **Disaster Integration** (`backend/controllers/disasterController.js`)
- Auto-create alert when disaster is created
- Auto-create alert when disaster status changes
- Severity mapping: Catastrophic/Severe/Moderate/Minor → Emergency/Critical/Warning/Info
- Alert type logic: Severe disasters → Evacuation, Others → Early Warning

✅ **Server Configuration** (`backend/server-disaster.js`)
- Alert routes registered at /api/alerts
- Fully integrated with existing API

### Frontend System (Complete)
✅ **Admin Interface** (`frontend/app/admin/alerts/page.js`)
- Beautiful glass-morphism design
- Create/Edit/Cancel/Delete alerts
- Filter by status and severity
- Link alerts to active disasters
- Real-time alert count
- Color-coded severity badges
- Responsive layout

✅ **Dashboard Integration** (`frontend/app/page.js`)
- "Manage Alerts" button added to Active Alerts section
- Links directly to admin interface
- Maintains existing collapsible dropdown functionality

---

## 🎯 How to Use

### 1️⃣ View Alerts (Public)
```
1. Visit: http://localhost:3000
2. Scroll to "Active Alerts" section
3. Click to expand dropdown
4. View all active alerts with severity colors
```

### 2️⃣ Manage Alerts (Admin)
```
1. Visit: http://localhost:3000
2. Click "Manage Alerts" button in Active Alerts section
   OR directly visit: http://localhost:3000/admin/alerts
3. View all alerts with filters
4. Create/Edit/Cancel/Delete as needed
```

### 3️⃣ Create Alert Manually
```
1. Go to: http://localhost:3000/admin/alerts
2. Click "+ Create New Alert" button
3. Fill in form:
   - Alert Type: Choose from dropdown
   - Severity: Choose level
   - Title: Enter headline
   - Message: Enter details
   - Affected Region: Enter location
   - Issued By: Enter organization
   - Link to Disaster: (Optional) Select from active disasters
   - Expires At: (Optional) Set expiration date
4. Click "Create Alert"
```

### 4️⃣ Test Auto-Alert Creation
```
Method 1: Create New Disaster
1. Use API: POST http://localhost:5000/api/disasters
2. Provide disaster details (name, type, severity, region)
3. System automatically creates matching alert
4. Alert appears on dashboard immediately

Method 2: Update Disaster Status
1. Use API: PUT http://localhost:5000/api/disasters/:id
2. Change Status field (e.g., Active → Under Control)
3. System creates status update alert
4. Alert notifies of status change
```

---

## 🔗 Integration Details

### Disaster → Alert Auto-Creation

**When Disaster Created:**
```javascript
Disaster Input:
- DisasterType: "Flood"
- Severity: "Severe"
- AffectedRegion: "Bangkok Metropolitan"
- DisasterName: "Bangkok Flood 2025"

Automatic Alert Created:
- AlertType: "Evacuation" (because Severe)
- Severity: "Critical" (mapped from Severe)
- Title: "Severe Flood Alert - Bangkok Metropolitan"
- Message: "A severe flood has been reported in Bangkok Metropolitan..."
- AffectedRegion: "Bangkok Metropolitan"
- IssuedBy: "System (Automated)"
- DisasterID: [Linked to disaster]
- ExpiresAt: 7 days from now
```

**When Status Changed:**
```javascript
Disaster Update:
- Status: Active → Under Control

Automatic Alert Created:
- AlertType: "Early Warning"
- Severity: [Matches disaster severity]
- Title: "Disaster Status Update - Bangkok Flood 2025"
- Message: "Status updated to: Under Control. Stay informed..."
- DisasterID: [Linked to disaster]
```

---

## 📊 Alert System Features

### Alert Types
1. **Early Warning** - Initial notifications
2. **Evacuation** - Urgent action required
3. **All Clear** - Situation resolved
4. **Supply Request** - Resources needed
5. **Volunteer Needed** - Help required
6. **Other** - Custom alerts

### Severity Levels (Color Coded)
1. **Emergency** 🔴 - Red badge, highest priority
2. **Critical** 🟠 - Orange badge, high priority
3. **Warning** 🟡 - Yellow badge, medium priority
4. **Info** 🔵 - Blue badge, informational

### Alert Status
1. **Active** 🟢 - Currently valid
2. **Expired** ⚪ - Past expiration date
3. **Cancelled** 🔴 - Manually cancelled

---

## 🎨 Admin Interface Features

### Main View
- **Filters**: Filter by status and severity
- **Alert Count**: Shows total alerts matching filters
- **Create Button**: Quick access to alert creation
- **Back to Dashboard**: Easy navigation

### Each Alert Card Shows
- Severity badge (color-coded)
- Status badge
- Alert type label
- Title and message
- Affected region
- Issued by organization
- Issued timestamp
- Expiration date (if set)
- Linked disaster info (if linked)
- Action buttons: Edit, Cancel, Delete

### Create/Edit Form
- All fields with validation
- Dropdown for types and severity
- Disaster selection dropdown (shows active disasters only)
- Date picker for expiration
- Real-time preview

---

## 🧪 Testing the System

### Test 1: Manual Alert Creation
```
1. Visit: http://localhost:3000/admin/alerts
2. Click "+ Create New Alert"
3. Fill in:
   - Type: Supply Request
   - Severity: Critical
   - Title: "Test Alert - Medical Supplies Needed"
   - Message: "Testing alert system integration"
   - Region: "Test Region"
   - Issued By: "Test Department"
4. Click "Create Alert"
5. Verify alert appears in list
6. Check dashboard - alert should appear
```

### Test 2: Auto-Alert from Disaster (Using API)
```powershell
# Create test disaster
$body = @{
    DisasterName = "Test Earthquake"
    DisasterType = "Earthquake"
    Severity = "Catastrophic"
    Description = "Testing auto-alert creation"
    AffectedRegion = "Northern Thailand"
    Latitude = "18.7883"
    Longitude = "98.9853"
    StartDate = (Get-Date).ToString("yyyy-MM-dd")
    EstimatedAffectedPopulation = 5000
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/disasters" -Method POST -Body $body -ContentType "application/json"

# Check alerts page - should see auto-created Emergency alert
```

### Test 3: Edit Alert
```
1. Click "Edit" on any alert
2. Change title or message
3. Click "Update Alert"
4. Verify changes appear
```

### Test 4: Cancel Alert
```
1. Click "Cancel" on active alert
2. Confirm cancellation
3. Status changes to "Cancelled"
4. Alert no longer appears on dashboard
```

---

## 📱 API Endpoints Reference

### Get All Alerts
```
GET http://localhost:5000/api/alerts
Optional params: ?status=Active&severity=Emergency
```

### Get Active Alerts Only
```
GET http://localhost:5000/api/alerts/active
```

### Create Alert
```
POST http://localhost:5000/api/alerts
Body: {
  "AlertType": "Early Warning",
  "Severity": "Critical",
  "Title": "Alert Title",
  "Message": "Alert Message",
  "AffectedRegion": "Region Name",
  "IssuedBy": "Organization Name",
  "ExpiresAt": "2025-12-31",
  "DisasterID": 1
}
```

### Update Alert
```
PUT http://localhost:5000/api/alerts/:id
Body: { "Title": "Updated Title" }
```

### Cancel Alert
```
POST http://localhost:5000/api/alerts/:id/cancel
```

### Delete Alert
```
DELETE http://localhost:5000/api/alerts/:id
```

---

## ✅ System Status

**Backend Server:** Running on port 5000 ✅
**Frontend Server:** Should be running on port 3000 ✅
**Database:** Connected ✅
**Current Alerts in DB:** 14 alerts ✅
**Alert Routes:** Registered ✅
**Auto-Creation:** Integrated ✅
**Admin UI:** Available at /admin/alerts ✅

---

## 🚀 Next Steps

1. **Start Frontend** (if not running):
   ```powershell
   cd C:\Users\phone\OneDrive\Desktop\DEMS\frontend
   npm run dev
   ```

2. **Access System**:
   - Dashboard: http://localhost:3000
   - Alert Admin: http://localhost:3000/admin/alerts
   - API: http://localhost:5000/api/alerts

3. **Test Integration**:
   - Create a disaster via admin interface or API
   - Check that alert is auto-created
   - View on dashboard
   - Manage via alert admin page

---

## 📝 Key Files Modified/Created

### Created:
- `backend/controllers/alertController.js` - Alert CRUD & auto-creation
- `backend/routes/alerts.js` - Alert API endpoints
- `frontend/app/admin/alerts/page.js` - Alert management UI
- `ALERT_SYSTEM_INTEGRATION.md` - Full documentation

### Modified:
- `backend/controllers/disasterController.js` - Added auto-alert creation
- `backend/server-disaster.js` - Registered alert routes
- `frontend/app/page.js` - Added "Manage Alerts" button

---

**🎉 System is fully integrated and ready to use!**

For detailed documentation, see: `ALERT_SYSTEM_INTEGRATION.md`
