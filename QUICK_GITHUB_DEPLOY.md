# 🚀 Quick GitHub Deployment - 5 Minutes

## Step 1: Push to GitHub (2 minutes)

```powershell
# Open PowerShell in DEMS folder
cd C:\Users\phone\OneDrive\Desktop\DEMS

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "🚨 Thailand DEMS v2.0 - Ready for deployment"

# Create GitHub repo and push
# Go to https://github.com/new first, create repo, then:
git remote add origin https://github.com/YOUR_USERNAME/thailand-dems.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend on Railway (2 minutes)

1. **Go to Railway**: https://railway.app
2. **Sign in with GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. **Select** `thailand-dems`
5. **Add MySQL Database**:
   - Click "New" → "Database" → "MySQL"
   - Wait for provisioning
6. **Add Backend Service**:
   - Click "New" → "GitHub Repo"
   - Root Directory: `backend`
   - Add Environment Variables:
     ```
     DATABASE_HOST=${{MySQL.MYSQLHOST}}
     DATABASE_USER=${{MySQL.MYSQLUSER}}
     DATABASE_PASSWORD=${{MySQL.MYSQLPASSWORD}}
     DATABASE_NAME=${{MySQL.MYSQLDATABASE}}
     PORT=5000
     NODE_ENV=production
     ```
7. **Generate Domain** → Copy URL (e.g., `backend-xxx.up.railway.app`)

---

## Step 3: Deploy Frontend on Vercel (1 minute)

1. **Go to Vercel**: https://vercel.com
2. **Sign in with GitHub**
3. **Import Project** → Select `thailand-dems`
4. **Configure**:
   - Framework: Next.js
   - Root Directory: `frontend`
   - Add Environment Variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
     ```
     (Use Railway URL from Step 2)
5. **Deploy** → Wait 2 minutes
6. **Done!** Your site: `thailand-dems.vercel.app`

---

## Step 4: Import Database Schema

### Option A: Railway CLI
```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Connect to project
railway link

# Import schema
railway run mysql -u root -p < backend/db/schema-disaster.sql
railway run mysql -u root -p < backend/db/enhanced_system_schema.sql
```

### Option B: MySQL Workbench
1. Open MySQL Workbench
2. New Connection:
   - Host: (from Railway MySQL variables)
   - Port: 3306
   - User: (from Railway)
   - Password: (from Railway)
3. File → Run SQL Script
4. Select `backend/db/schema-disaster.sql`
5. Repeat for `backend/db/enhanced_system_schema.sql`

---

## ✅ Verify Deployment

1. **Backend API**: `https://your-backend.up.railway.app/api/disasters`
   - Should return: `{"success": true, "data": []}`

2. **Frontend**: `https://thailand-dems.vercel.app`
   - Login page should load with animations
   - Roadmap tab should expand

3. **Test Login**: admin / admin123

---

## 🎯 Your Live URLs

**Frontend**: `https://thailand-dems.vercel.app`  
**Backend**: `https://your-backend.up.railway.app`  
**Database**: Railway MySQL (internal)

---

## 🔄 Update Deployment

Every time you push to GitHub:
```powershell
git add .
git commit -m "Update feature"
git push origin main
```

Both Vercel and Railway will **auto-deploy** in 2-3 minutes!

---

## 🆘 Troubleshooting

**Frontend can't connect to backend?**
- Check `NEXT_PUBLIC_API_URL` in Vercel settings
- Update CORS in `backend/server-disaster.js`:
  ```javascript
  app.use(cors({
    origin: ['https://thailand-dems.vercel.app'],
    credentials: true
  }));
  ```

**Database connection failed?**
- Verify Railway MySQL variables in backend service
- Check Railway logs for errors

---

## 🎉 Done!

Share your deployment:
- **Public URL**: `https://thailand-dems.vercel.app`
- **Admin Login**: admin / admin123
- **User Login**: user / user123

**Total Cost**: $0 (100% Free!)  
**Total Time**: ~5 minutes

🚨 Thailand DEMS is now live!
