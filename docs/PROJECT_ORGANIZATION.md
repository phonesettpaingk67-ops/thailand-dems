# 📂 DEMS Project Organization Guide

## 🗂️ Current Project Structure

```
DEMS/
│
├── 📁 backend/                    # Backend API server
│   ├── 📁 archive/               # Archived utility scripts (historical)
│   │   ├── adjust-realistic-data.js
│   │   ├── check-*.js (5 files)
│   │   ├── migrate-data.js
│   │   ├── fix-disaster-enum.js
│   │   ├── update-volunteers.js
│   │   └── test-*.js (2 files)
│   │
│   ├── 📁 config/                # Configuration files
│   │   └── (database.js removed - use db/connection.js)
│   │
│   ├── 📁 controllers/           # API controllers (business logic)
│   │   ├── agencyController.js
│   │   ├── alertController.js
│   │   ├── dashboardController-disaster.js
│   │   ├── disasterController.js
│   │   ├── enhancedVolunteerController.js
│   │   ├── locationController.js
│   │   ├── partnerFacilitiesController.js
│   │   ├── resourceIntelligenceController.js
│   │   ├── shelterController.js
│   │   ├── supplyController.js
│   │   ├── tierController.js
│   │   ├── userReportController.js
│   │   ├── volunteerAuthController.js
│   │   └── volunteerController.js
│   │
│   ├── 📁 db/                    # Database files
│   │   ├── 📁 archive/          # Old schemas and seeds
│   │   │   ├── schema.sql
│   │   │   ├── schema-new.sql
│   │   │   ├── seed.sql
│   │   │   ├── seed-new.sql
│   │   │   ├── migrate-data.sql
│   │   │   └── fix-disaster-type.sql
│   │   │
│   │   ├── 🟢 connection.js              # ✅ ACTIVE - DB connection
│   │   ├── 🟢 schema-disaster.sql        # ✅ ACTIVE - Main schema
│   │   ├── 🟢 seed-disaster.sql          # ✅ ACTIVE - Main seed data
│   │   ├── 🟢 enhanced_system_schema.sql # ✅ ACTIVE - Enhanced features
│   │   ├── 🟢 enhanced_system_clean.sql  # ✅ ACTIVE - Clean enhanced
│   │   ├── 🟢 thailand_locations.sql     # ✅ ACTIVE - Thailand data
│   │   ├── 🟢 create-user-reports.sql    # ✅ ACTIVE
│   │   ├── 🟢 create-volunteer-accounts.sql # ✅ ACTIVE
│   │   ├── 🟢 agency-activation-triggers.sql # ✅ ACTIVE
│   │   ├── 🟢 shelter-status-triggers.sql    # ✅ ACTIVE
│   │   ├── 🟢 supply-status-triggers.sql     # ✅ ACTIVE
│   │   ├── 🟢 volunteer-status-triggers.sql  # ✅ ACTIVE
│   │   └── ENHANCED_SYSTEM_ERD.md
│   │
│   ├── 📁 middleware/            # Express middleware
│   │   └── auth.js              # Authentication middleware
│   │
│   ├── 📁 routes/                # API route definitions
│   │   ├── agencies.js
│   │   ├── alerts.js
│   │   ├── dashboard-disaster.js
│   │   ├── disasters.js
│   │   ├── enhancedVolunteers.js
│   │   ├── evacuation.js
│   │   ├── locations.js
│   │   ├── partnerFacilities.js
│   │   ├── resourceIntelligence.js
│   │   ├── shelters.js
│   │   ├── supplies.js
│   │   ├── tiers.js
│   │   ├── userReports.js
│   │   ├── volunteerAuth.js
│   │   ├── volunteers.js
│   │   └── weather.js
│   │
│   ├── 📁 tests/                 # Test files
│   │   ├── concurrency-test.js
│   │   ├── database-health.js
│   │   ├── system-health.js
│   │   └── test-agency-system.js
│   │
│   ├── 🟢 server-disaster.js     # ✅ MAIN SERVER FILE
│   ├── install-triggers.js
│   ├── seed-enhanced-data.js
│   ├── package.json
│   └── .env
│
├── 📁 frontend/                   # Next.js frontend
│   ├── 📁 app/                   # App router pages
│   │   ├── 📁 admin/            # Admin-only pages
│   │   │   ├── 📁 agencies/
│   │   │   │   ├── [id]/page.js
│   │   │   │   └── page.js
│   │   │   ├── 📁 alerts/
│   │   │   │   └── page.js
│   │   │   ├── 📁 disasters/
│   │   │   │   └── create/page.js
│   │   │   ├── 📁 reports/
│   │   │   │   └── page.js
│   │   │   ├── 📁 resource-intelligence/
│   │   │   │   └── page.js
│   │   │   ├── 📁 shelters/
│   │   │   │   └── page.js
│   │   │   ├── 📁 tiers/
│   │   │   │   └── page.js
│   │   │   └── 📁 volunteers/
│   │   │       └── page.js
│   │   │
│   │   ├── 📁 disasters/        # Public disaster view
│   │   │   └── page.js
│   │   ├── 📁 evacuation/       # Evacuation planning
│   │   │   └── page.js
│   │   ├── 📁 login/            # Login page
│   │   │   └── page.js
│   │   ├── 📁 report/           # User reporting
│   │   │   └── page.js
│   │   ├── 📁 shelters/         # Public shelters view
│   │   │   └── page.js
│   │   ├── 📁 supplies/         # Supplies management
│   │   │   └── page.js
│   │   ├── 📁 volunteer-dashboard/ # Volunteer dashboard
│   │   │   └── page.js
│   │   ├── 📁 volunteer-portal/    # Volunteer portal
│   │   │   └── page.js
│   │   ├── 📁 volunteers/       # Public volunteers view
│   │   │   └── page.js
│   │   ├── 📁 weather/          # Weather monitoring
│   │   │   └── page.js
│   │   │
│   │   ├── page.js              # 🏠 Home dashboard
│   │   ├── layout.js            # Root layout
│   │   └── globals.css          # Global styles
│   │
│   ├── 📁 components/            # Reusable components
│   │   ├── AuthGuard.js         # Route protection
│   │   ├── ClientLayout.js      # Main layout with nav
│   │   ├── DeleteConfirmModal.js
│   │   ├── ErrorMessage.js
│   │   ├── LeafletFix.js
│   │   ├── LoadingSpinner.js
│   │   ├── LocationPicker.js
│   │   └── ThailandDisasterMap.js
│   │
│   ├── 📁 contexts/              # React contexts
│   │   └── AuthContext.js
│   │
│   ├── 📁 lib/                   # Utilities
│   │   └── api.js               # API helper functions
│   │
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── next.config.js
│   ├── jsconfig.json
│   └── package.json
│
├── 📁 docs/                       # All project documentation
│   ├── AGENCY_FINAL_SUMMARY.md
│   ├── AGENCY_INTEGRATION_CHECKLIST.md
│   ├── AGENCY_SYSTEM_DOCUMENTATION.md
│   ├── ALERT_SYSTEM_INTEGRATION.md
│   ├── CLEANUP_REPORT.md
│   ├── COMPLETE_FIX_SUMMARY.txt
│   ├── DATABASE_VERIFICATION_REPORT.md
│   ├── LOCATION_PICKER_GUIDE.md
│   ├── PROJECT_ORGANIZATION.md    # 📍 THIS FILE
│   ├── PROJECT_STRUCTURE.md
│   ├── QUICKSTART.md
│   ├── QUICK_START_ALERTS.md
│   ├── README.md
│   ├── SHELTER_MASTERPIECE_SUMMARY.md
│   ├── SHELTER_SYSTEM_DOCUMENTATION.md
│   ├── SYSTEM_FIXES.md
│   ├── UI_ENHANCEMENTS_COMPLETE.md
│   ├── UPDATES_SUMMARY.md
│   ├── VOLUNTEER_AUTHENTICATION_README.md
│   ├── VOLUNTEER_MASTERPIECE_SUMMARY.md
│   └── VOLUNTEER_SYSTEM_DOCUMENTATION.md
│
├── .gitignore
├── CLEANUP_REPORT.md             # Latest cleanup report
├── install-shelter-triggers.bat
├── start-dems.bat
└── start-frontend.bat
```

---

## 🎯 Key Directories Explained

### `/backend/archive/`
**Purpose:** Historical utility scripts no longer needed in daily operations
- One-time migration scripts
- Schema verification scripts
- Data adjustment scripts
**Keep or Delete?** Keep for 3-6 months, then can safely delete

### `/backend/db/archive/`
**Purpose:** Old database schemas and seeds
- Previous versions of schema
- Old seed data
- Completed migration files
**Keep or Delete?** Keep for reference, safe to delete after 6 months

### `/backend/tests/`
**Purpose:** All test and validation scripts
- System health checks
- Database health checks
- Feature validation tests
**Keep or Delete?** Keep permanently for testing

### `/docs/`
**Purpose:** All project documentation
- System documentation
- Integration guides
- Feature summaries
- Setup guides
**Keep or Delete?** Keep permanently, update as needed

---

## 🚦 Active vs Archived Files

### ✅ ACTIVE FILES (In Use)

**Database:**
- `db/connection.js` - Database connection pool
- `db/schema-disaster.sql` - Main database schema
- `db/seed-disaster.sql` - Seed data for disasters
- `db/enhanced_system_*.sql` - Enhanced features
- `db/*-triggers.sql` - All trigger files
- `db/create-*.sql` - Creation scripts

**Server:**
- `server-disaster.js` - Main Express server

**All Controllers, Routes, Middleware** - Actively used

### 📦 ARCHIVED FILES (Reference Only)

**Utility Scripts:**
- `archive/check-*.js` - One-time checks
- `archive/migrate-data.js` - Completed migration
- `archive/fix-*.js` - Applied fixes

**Old Schemas:**
- `db/archive/schema*.sql` - Previous versions
- `db/archive/seed*.sql` - Old seed data

---

## 🔧 Development Workflow

### Starting the Application

```bash
# Start backend (from /backend/)
node server-disaster.js

# Start frontend (from /frontend/)
npm run dev

# Or use batch files (from root)
start-dems.bat        # Start both servers
start-frontend.bat    # Start frontend only
```

### Running Tests

```bash
# From /backend/tests/
node system-health.js
node database-health.js
node test-agency-system.js
```

### Database Setup

```bash
# From /backend/
# 1. Create schema
mysql -u root -p disaster_management_db < db/schema-disaster.sql

# 2. Add enhanced features
mysql -u root -p disaster_management_db < db/enhanced_system_schema.sql

# 3. Install triggers
node install-triggers.js

# 4. Seed data
mysql -u root -p disaster_management_db < db/seed-disaster.sql
mysql -u root -p disaster_management_db < db/thailand_locations.sql
node seed-enhanced-data.js
```

---

## 📋 File Naming Conventions

### Backend Files
- **Controllers:** `[resource]Controller.js` (e.g., `disasterController.js`)
- **Routes:** `[resource].js` (e.g., `disasters.js`)
- **Tests:** `[purpose]-test.js` or `test-[feature].js`

### Frontend Files
- **Pages:** `page.js` in appropriate directory
- **Components:** `PascalCase.js` (e.g., `ClientLayout.js`)
- **Utilities:** `camelCase.js` (e.g., `api.js`)

### Database Files
- **Active Schema:** `schema-disaster.sql`
- **Active Seeds:** `seed-disaster.sql`, `seed-thailand.sql`
- **Triggers:** `[resource]-status-triggers.sql`
- **Creation Scripts:** `create-[resource].sql`

---

## 🗑️ What Can Be Deleted?

### After 3 Months:
- `/backend/archive/` - All one-time scripts
- `/backend/db/archive/` - Old schemas

### After 6 Months:
- Old documentation in `/docs/` that's been superseded

### Never Delete:
- Active database files
- All controllers, routes, middleware
- Current components
- Test files
- Active documentation

---

## 🎨 Component Architecture

### Layout Components
- **`ClientLayout.js`** - Main app layout with navigation
  - User menu
  - Notification bell
  - Navigation links
  - Logout functionality

### Utility Components
- **`AuthGuard.js`** - Protects admin routes
- **`LoadingSpinner.js`** - Loading state indicator
- **`ErrorMessage.js`** - Error display
- **`DeleteConfirmModal.js`** - Confirmation dialogs

### Feature Components
- **`ThailandDisasterMap.js`** - Interactive Leaflet map
- **`LocationPicker.js`** - Map-based location selector
- **`LeafletFix.js`** - Leaflet icon fix

---

## 🔐 Authentication Flow

1. User logs in via `/login`
2. Credentials validated against database
3. User data stored in localStorage as `dems_user`
4. `ClientLayout` checks auth on page load
5. `AuthGuard` protects admin routes
6. Admin-only features check user role

---

## 📡 API Routes

### Public Routes
- `GET /api/disasters` - View disasters
- `GET /api/shelters` - View shelters
- `GET /api/volunteers` - View volunteers
- `GET /api/alerts` - View alerts
- `POST /api/reports` - Submit user reports
- `GET /api/weather/:city` - Weather data
- `POST /api/evacuation/routes` - Get evacuation route

### Admin Routes (require auth)
- `POST /api/disasters` - Create disaster
- `PUT /api/disasters/:id` - Update disaster
- `DELETE /api/disasters/:id` - Delete disaster
- `POST /api/shelters` - Create shelter
- `POST /api/volunteers` - Create volunteer
- `POST /api/alerts` - Create alert
- And more... (see route files)

---

## 🚀 Performance Optimizations

1. **Route De-duplication** - Removed duplicate route registrations
2. **Component Cleanup** - Removed unused components
3. **Database Connection Pooling** - Using connection pool (max 10)
4. **Frontend Optimizations:**
   - Dynamic imports for maps (client-side only)
   - Framer Motion animations
   - Responsive design with Tailwind

---

## 📱 Responsive Design

- **Mobile:** Full functionality, adapted layout
- **Tablet:** Grid adjustments
- **Desktop:** Full grid layouts with sidebars

All pages use Tailwind's responsive utilities (`sm:`, `md:`, `lg:`, `xl:`)

---

## 🎯 Best Practices

1. **Always use absolute imports** with `@/` prefix
2. **Use `'use client'`** for components with hooks/state
3. **Dynamic imports** for client-only components
4. **Error handling** in all API calls
5. **Loading states** for async operations
6. **Consistent naming** across files
7. **Archive, don't delete** old code

---

**Last Updated:** November 24, 2025  
**Maintained By:** DEMS Development Team
