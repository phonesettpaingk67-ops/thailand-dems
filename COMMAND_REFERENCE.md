# ⚡ Thailand DEMS - Quick Command Reference

## 🚀 ONE-LINE DEPLOYMENT

```powershell
.\deploy-to-github.ps1
```

---

## 📦 LOCAL DEVELOPMENT

### Start Everything
```powershell
.\start-dems.bat
```

### Start Backend Only
```powershell
cd backend
node server-disaster.js
```

### Start Frontend Only
```powershell
cd frontend
npm run dev
```

---

## 🔧 GIT COMMANDS

### Initialize & First Push
```powershell
git init
git add .
git commit -m "Initial commit - Thailand DEMS v2.0"
git remote add origin https://github.com/YOUR_USERNAME/thailand-dems.git
git branch -M main
git push -u origin main
```

### Update & Push Changes
```powershell
git add .
git commit -m "Update feature X"
git push origin main
```

### Check Status
```powershell
git status
git log --oneline -5
```

### Undo Changes
```powershell
# Undo unstaged changes
git checkout -- filename.js

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

---

## 🌐 DEPLOYMENT COMMANDS

### Railway CLI
```powershell
# Install
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# View logs
railway logs

# Rollback
railway rollback

# Open dashboard
railway open
```

### Vercel CLI
```powershell
# Install
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# View logs
vercel logs

# Rollback
vercel rollback

# Open dashboard
vercel
```

---

## 🗄️ DATABASE COMMANDS

### MySQL Connection
```powershell
# Connect locally
mysql -u root -p

# Connect to Railway
railway connect
```

### Import Schemas
```sql
-- Create database
CREATE DATABASE disaster_management_db;
USE disaster_management_db;

-- Import core schema
SOURCE C:/Users/phone/OneDrive/Desktop/DEMS/backend/db/schema-disaster.sql;

-- Import enhanced schema
SOURCE C:/Users/phone/OneDrive/Desktop/DEMS/backend/db/enhanced_system_schema.sql;

-- Import seed data (optional)
SOURCE C:/Users/phone/OneDrive/Desktop/DEMS/backend/db/seed-disaster.sql;
SOURCE C:/Users/phone/OneDrive/Desktop/DEMS/backend/db/thailand_locations.sql;
```

### Useful Queries
```sql
-- Show all tables
SHOW TABLES;

-- Count records
SELECT 
  'Disasters' as Table_Name, COUNT(*) as Count FROM Disasters
UNION ALL
SELECT 'Shelters', COUNT(*) FROM Shelters
UNION ALL
SELECT 'Volunteers', COUNT(*) FROM Volunteers;

-- View recent disasters
SELECT * FROM Disasters ORDER BY created_at DESC LIMIT 5;

-- Check database size
SELECT 
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'disaster_management_db'
GROUP BY table_schema;

-- Backup database
mysqldump -u root -p disaster_management_db > backup.sql

-- Restore database
mysql -u root -p disaster_management_db < backup.sql
```

---

## 🔍 DEBUGGING COMMANDS

### Check Ports
```powershell
# Check if port is in use
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill process on port
Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### View Logs
```powershell
# Backend logs (if running in background)
Get-Content backend/logs/error.log -Tail 50

# Frontend logs
npm run dev 2>&1 | Tee-Object -FilePath frontend-log.txt
```

### Test API Endpoints
```powershell
# Test health check
curl http://localhost:5000/health

# Test disasters endpoint
curl http://localhost:5000/api/disasters

# Test with POST
curl -X POST http://localhost:5000/api/disasters `
  -H "Content-Type: application/json" `
  -d '{\"type\":\"Flood\",\"severity\":\"High\"}'
```

---

## 📊 MONITORING COMMANDS

### System Status
```powershell
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MySQL status
Get-Service MySQL* | Select-Object Name, Status

# Check disk space
Get-PSDrive C | Select-Object Used, Free
```

### Application Health
```powershell
# Frontend build
cd frontend
npm run build

# Backend test
cd backend
npm test

# Check for updates
npm outdated
```

---

## 🧹 CLEANUP COMMANDS

### Clear Build Files
```powershell
# Frontend
Remove-Item frontend\.next -Recurse -Force
Remove-Item frontend\out -Recurse -Force

# Backend
Remove-Item backend\node_modules -Recurse -Force
```

### Reinstall Dependencies
```powershell
# Frontend
cd frontend
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install

# Backend
cd backend
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
```

---

## 🔐 ENVIRONMENT VARIABLES

### Create .env Files
```powershell
# Backend
Copy-Item backend\.env.example backend\.env
notepad backend\.env

# Frontend
Copy-Item frontend\.env.example frontend\.env.local
notepad frontend\.env.local
```

### View Environment Variables
```powershell
# Current session
Get-ChildItem Env:

# Specific variable
$env:NODE_ENV

# Set temporary variable
$env:NODE_ENV = "production"
```

---

## 📦 NPM COMMANDS

### Install Dependencies
```powershell
npm install                  # Install all
npm install package-name     # Install specific
npm install -g package-name  # Install globally
npm install --save-dev pkg   # Install as dev dependency
```

### Update Dependencies
```powershell
npm outdated                 # Check for updates
npm update                   # Update all
npm update package-name      # Update specific
```

### Script Commands
```powershell
npm run dev                  # Development mode
npm run build                # Build for production
npm start                    # Start production server
npm test                     # Run tests
npm run lint                 # Run linter
```

---

## 🚨 EMERGENCY COMMANDS

### Quick Rollback
```powershell
# Revert to previous commit
git reset --hard HEAD~1
git push -f origin main

# Or restore specific file
git checkout HEAD~1 -- path/to/file
```

### Reset Everything
```powershell
# Nuclear option - reset entire project
git reset --hard origin/main
git clean -fd
npm install
```

### Kill All Node Processes
```powershell
Get-Process node | Stop-Process -Force
```

---

## 🎯 COMMON WORKFLOWS

### Update Feature Workflow
```powershell
# 1. Make changes
code .

# 2. Test locally
.\start-dems.bat

# 3. Commit and push
git add .
git commit -m "Add new feature"
git push origin main

# 4. Auto-deploys to Vercel + Railway
# 5. Verify at production URL
```

### Hotfix Workflow
```powershell
# 1. Create hotfix branch
git checkout -b hotfix/critical-bug

# 2. Fix and test
# ... make changes ...
npm test

# 3. Merge to main
git checkout main
git merge hotfix/critical-bug
git push origin main

# 4. Delete branch
git branch -d hotfix/critical-bug
```

---

## 📱 PLATFORM-SPECIFIC COMMANDS

### Vercel
```powershell
vercel login                 # Login
vercel                       # Deploy preview
vercel --prod                # Deploy production
vercel ls                    # List deployments
vercel rm deployment-url     # Remove deployment
vercel env ls                # List env variables
vercel env add KEY           # Add env variable
vercel domains ls            # List domains
vercel domains add domain    # Add custom domain
```

### Railway
```powershell
railway login                # Login
railway link                 # Link to project
railway up                   # Deploy
railway logs                 # View logs
railway run command          # Run command in container
railway variables            # Manage variables
railway open                 # Open dashboard
railway status               # Check status
railway connect              # Connect to database
```

---

## 🎨 USEFUL ALIASES (Optional)

Add to PowerShell profile (`notepad $PROFILE`):

```powershell
# Quick navigation
function dems { Set-Location "C:\Users\phone\OneDrive\Desktop\DEMS" }
function be { Set-Location "C:\Users\phone\OneDrive\Desktop\DEMS\backend" }
function fe { Set-Location "C:\Users\phone\OneDrive\Desktop\DEMS\frontend" }

# Quick start
function start-backend { cd backend; node server-disaster.js }
function start-frontend { cd frontend; npm run dev }

# Quick deploy
function deploy { .\deploy-to-github.ps1 }

# Git shortcuts
function gs { git status }
function ga { git add . }
function gc { param($message) git commit -m $message }
function gp { git push origin main }
function gl { git log --oneline -10 }

# Quick update
function update { ga; gc "Quick update"; gp }
```

Usage after adding aliases:
```powershell
dems           # Go to DEMS folder
deploy         # Run deployment script
update         # Quick commit and push
gs             # Git status
```

---

## 📚 HELP COMMANDS

```powershell
git --help                   # Git help
npm help                     # NPM help
node --help                  # Node.js help
railway --help               # Railway help
vercel --help                # Vercel help

# Command-specific help
git help commit
npm help install
```

---

## 🎉 QUICK DEPLOY CHECKLIST

```powershell
# ✅ Pre-deployment
git status                   # Check changes
npm run build               # Test build (in frontend/)
node server-disaster.js     # Test backend (in backend/)

# ✅ Deploy
git add .
git commit -m "Deploy v2.0"
git push origin main

# ✅ Verify
curl https://thailand-dems.vercel.app
curl https://your-backend.up.railway.app/health

# ✅ Monitor
vercel logs --follow
railway logs
```

---

**💡 Pro Tips:**

1. **Always test locally** before pushing
2. **Use meaningful commit messages**
3. **Check logs** after deployment
4. **Monitor performance** metrics
5. **Keep backups** of database
6. **Document changes** in commit messages
7. **Use branches** for big features
8. **Test on mobile** devices too

---

**🚨 Emergency Hotlines:**

- System Issues: Check logs first
- Railway Down: Check status.railway.app
- Vercel Down: Check vercel-status.com
- Real Emergency (Thailand): ☎ **1784**

---

**Version**: 2.0.0  
**Last Updated**: November 24, 2025  
**Quick Deploy**: `.\deploy-to-github.ps1`
