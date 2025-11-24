# ✅ Pre-Deployment Checklist

Before uploading to GitHub and deploying, complete these tasks:

## 🔒 Security & Privacy

- [ ] **Remove sensitive data from .env files**
  - Backend: Check `backend/.env`
  - Frontend: Check `frontend/.env.local`
  - Both should NOT be in Git (already in .gitignore)

- [ ] **Create .env.example files** ✅ (Already done!)
  - `backend/.env.example`
  - `frontend/.env.example`

- [ ] **Remove database password from code**
  - Check all files for hardcoded passwords
  - Ensure using environment variables only

## 📝 Documentation

- [ ] **README.md created** ✅ (Done!)
- [ ] **DEPLOYMENT_GUIDE.md created** ✅ (Done!)  
- [ ] **QUICK_DEPLOY.md created** ✅ (Done!)
- [ ] **Update README with your GitHub username**
  - Find and replace `YOUR_USERNAME` with actual username

## 🗂️ File Organization

- [ ] **All documentation in /docs folder** ✅ (Done!)
- [ ] **.gitignore properly configured** ✅ (Done!)
- [ ] **No unnecessary files in repo**
  - Remove any personal notes
  - Remove test files not needed

## 🔧 Code Preparation

- [ ] **API URLs use environment variables**
  - Check `frontend/lib/api.js`
  - Should use `process.env.NEXT_PUBLIC_API_URL`

- [ ] **Database connection uses environment variables** ✅ (Done!)
  - Check `backend/db/connection.js`

- [ ] **Port configuration flexible**
  - Backend: Uses `process.env.PORT || 5000`
  - Frontend: Uses `process.env.PORT || 3000`

## 🧪 Testing

- [ ] **Test locally one more time**
  - Backend: `cd backend && node server-disaster.js`
  - Frontend: `cd frontend && npm run dev`
  - Login and test all features

- [ ] **Test admin features**
  - Create disaster
  - Manage shelters
  - Assign volunteers

- [ ] **Test user features**
  - View disasters
  - Find shelters
  - Plan evacuation
  - Report emergency

- [ ] **Test AI Assistant**
  - Click robot icon
  - Ask questions
  - Test quick actions

## 📦 Dependencies

- [ ] **All dependencies in package.json**
  - Check `backend/package.json`
  - Check `frontend/package.json`

- [ ] **No missing imports**
  - Run `npm install` in both folders
  - Check for errors

## 🚀 GitHub Preparation

- [ ] **Git initialized**
  ```bash
  git init
  ```

- [ ] **All files added**
  ```bash
  git add .
  ```

- [ ] **Initial commit**
  ```bash
  git commit -m "Initial commit - Thailand DEMS"
  ```

- [ ] **GitHub account ready**
  - Create account at github.com if needed
  - Verify email

## 🌐 Domain & Hosting

- [ ] **Railway account created**
  - Sign up at railway.app
  - Link GitHub account

- [ ] **Domain name chosen**
  - Decide on domain (e.g., thailand-dems.com)
  - Check availability at namecheap.com

- [ ] **Payment method ready**
  - Credit card for domain (~$10)
  - Optional: Railway Pro if needed

## 📊 Database

- [ ] **SQL files ready**
  - `backend/db/schema-disaster.sql`
  - `backend/db/enhanced_system_schema.sql`
  - `backend/db/seed-disaster.sql`
  - `backend/db/thailand_locations.sql`

- [ ] **Database migrations documented**
  - Know the order to run SQL files
  - Have backup of current local database

## 🔐 Admin Accounts

- [ ] **Change default passwords**
  - Update admin password in database
  - Remove test accounts
  - Document new credentials securely

- [ ] **User accounts reviewed**
  - Keep necessary test users
  - Remove personal data

## 📱 Production Settings

- [ ] **CORS configuration**
  - Update to your production domain
  - Remove `localhost` from allowed origins

- [ ] **Error handling**
  - Check all API endpoints have error handlers
  - Verify user-friendly error messages

- [ ] **Rate limiting** (Optional but recommended)
  - Add express-rate-limit
  - Prevent API abuse

## 📸 Screenshots & Media

- [ ] **Take screenshots for README** (Optional)
  - Dashboard view
  - Map interface
  - AI Assistant
  - Admin panel

- [ ] **Create logo** (Optional)
  - Simple logo for GitHub repo
  - Favicon for website

## 🎯 Final Steps

- [ ] **Review QUICK_DEPLOY.md**
  - Read through deployment steps
  - Understand the process

- [ ] **Backup local database**
  ```bash
  mysqldump -u root -p disaster_management_db > backup.sql
  ```

- [ ] **Set aside 2-3 hours**
  - For deployment process
  - Don't rush!

## ✅ Ready to Deploy?

If all above items are checked, you're ready!

Follow these steps:
1. **GitHub Upload** - See QUICK_DEPLOY.md Step 1
2. **Railway Deployment** - See QUICK_DEPLOY.md Step 2  
3. **Custom Domain** - See QUICK_DEPLOY.md Step 3

---

**Current Status:**
- [x] Code is complete and working locally
- [x] Documentation created
- [x] AI Assistant integrated
- [x] Mobile navigation added
- [x] Project cleaned and organized
- [ ] Uploaded to GitHub
- [ ] Deployed to Railway
- [ ] Domain configured

---

**Next Action:** Upload to GitHub using QUICK_DEPLOY.md!
