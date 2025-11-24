# 🚀 Thailand DEMS - Deployment Guide

## 📋 Overview
This guide will help you deploy Thailand DEMS to free hosting platforms with a custom domain.

**Recommended Free Stack:**
- **Frontend**: Vercel (Perfect for Next.js)
- **Backend**: Railway.app (Free $5/month credit)
- **Database**: Railway MySQL (Included)
- **Domain**: Free subdomain or custom domain

---

## 🎯 Quick Start Deployment

### Option 1: Vercel + Railway (Recommended)
**Total Time:** 15-20 minutes  
**Cost:** 100% Free (Railway gives $5/month credit)

### Option 2: Netlify + Render
**Total Time:** 20-25 minutes  
**Cost:** 100% Free

---

## 📦 Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)
```bash
cd C:\Users\phone\OneDrive\Desktop\DEMS
git init
git add .
git commit -m "Initial commit - Thailand DEMS v2.0"
```

### 1.2 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `thailand-dems`
3. Description: `Thailand Disaster & Emergency Management System`
4. Keep it **Public** (required for free hosting)
5. DON'T initialize with README (you already have one)
6. Click "Create repository"

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/thailand-dems.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Step 2: Deploy Database (Railway MySQL)

### 2.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (links to your repository)
3. Verify your email

### 2.2 Create MySQL Database
1. Click "New Project"
2. Select "Deploy MySQL"
3. Wait for deployment (2-3 minutes)
4. Click on the MySQL service
5. Go to "Variables" tab
6. Copy these values:
   - `MYSQLHOST`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`
   - `MYSQLPORT`

### 2.3 Import Database Schema
1. Click "Connect" tab
2. Download Railway CLI or use web terminal
3. Run these commands:
```bash
# Connect to Railway MySQL
railway connect

# Import schemas
mysql -u root -p < backend/db/schema-disaster.sql
mysql -u root -p < backend/db/enhanced_system_schema.sql
```

Or use **MySQL Workbench**:
- Host: `MYSQLHOST` (from Railway)
- Port: `MYSQLPORT` (usually 3306)
- Username: `MYSQLUSER`
- Password: `MYSQLPASSWORD`
- Import both `.sql` files

---

## 🖥️ Step 3: Deploy Backend (Railway)

### 3.1 Create Backend Service
1. In Railway dashboard, click "New"
2. Select "GitHub Repo"
3. Choose `thailand-dems` repository
4. Root directory: `/backend`

### 3.2 Configure Environment Variables
In Railway backend service, go to "Variables" and add:

```env
# Database (use Railway MySQL variables)
DATABASE_HOST=${{MySQL.MYSQLHOST}}
DATABASE_USER=${{MySQL.MYSQLUSER}}
DATABASE_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DATABASE_NAME=${{MySQL.MYSQLDATABASE}}
PORT=5000
NODE_ENV=production
```

### 3.3 Configure Build Settings
1. Go to "Settings"
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Root Directory: `backend`

### 3.4 Get Backend URL
1. Go to "Settings" → "Networking"
2. Click "Generate Domain"
3. Copy URL (e.g., `thailand-dems-backend.up.railway.app`)
4. **SAVE THIS URL** - you'll need it for frontend

---

## 🌐 Step 4: Deploy Frontend (Vercel)

### 4.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your `thailand-dems` repository

### 4.2 Configure Project
1. Framework Preset: **Next.js**
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `.next`

### 4.3 Add Environment Variables
In Vercel project settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL.up.railway.app
```
Replace `YOUR-BACKEND-URL` with the Railway backend URL from Step 3.4

### 4.4 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Get your URL: `thailand-dems.vercel.app`

---

## 🎨 Step 5: Custom Domain (Optional)

### Option A: Free Subdomain (Included)
- **Vercel**: `thailand-dems.vercel.app`
- **Railway**: `thailand-dems-backend.up.railway.app`

### Option B: Custom Domain (Free)
1. Get free domain from:
   - Freenom (`.tk`, `.ml`, `.ga` domains)
   - GitHub Student Pack (free `.me` domain)
   - InfinityFree (free subdomain)

2. Add to Vercel:
   - Settings → Domains
   - Add `dems.yourdomain.com`
   - Add DNS records as shown

3. Add to Railway (Backend):
   - Settings → Networking
   - Add custom domain
   - Update CNAME records

---

## ✅ Step 6: Verify Deployment

### 6.1 Test Backend API
Visit: `https://YOUR-BACKEND-URL.up.railway.app/api/disasters`

Should return:
```json
{
  "success": true,
  "data": []
}
```

### 6.2 Test Frontend
Visit: `https://thailand-dems.vercel.app`

Should show:
- ✅ Login page with animations
- ✅ Roadmap tab working
- ✅ Background animations smooth

### 6.3 Test Full Integration
1. Login as admin (admin/admin123)
2. Go to Disasters page
3. Create test disaster
4. Check if data saves (refresh page)

---

## 🔧 Troubleshooting

### Frontend can't connect to backend
**Error:** `Network Error` or `CORS error`

**Fix:** Update backend CORS settings
1. Edit `backend/server-disaster.js`
2. Update CORS:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://thailand-dems.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```
3. Commit and push to GitHub
4. Railway will auto-deploy

### Database connection failed
**Error:** `ECONNREFUSED` or `Access denied`

**Fix:** 
1. Verify Railway MySQL variables in backend
2. Check if database is running (Railway dashboard)
3. Verify firewall allows Railway IPs

### Build failed on Vercel
**Error:** `Module not found` or `Build failed`

**Fix:**
1. Ensure `package.json` is in `/frontend`
2. Verify build command: `npm run build`
3. Check Next.js version compatibility

---

## 📊 Free Tier Limits

### Vercel (Frontend)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited sites
- ✅ Automatic HTTPS
- ✅ Custom domains

### Railway (Backend + Database)
- ✅ $5 credit/month (free tier)
- ✅ ~500 hours uptime
- ✅ 1 GB RAM
- ✅ 1 GB disk
- ⚠️ Enough for 1000+ users/day

---

## 🎯 Post-Deployment Checklist

- [ ] Backend API responding (test `/api/disasters`)
- [ ] Frontend loads with animations
- [ ] Login works (admin/admin123)
- [ ] Database operations work (create/read/update/delete)
- [ ] Maps display correctly (Leaflet)
- [ ] Roadmap tab expands properly
- [ ] Mobile responsive (test on phone)
- [ ] CORS configured for production
- [ ] Environment variables set correctly
- [ ] Custom domain configured (optional)

---

## 🌟 Alternative Free Hosting Options

### Backend Alternatives:
1. **Render.com** (750 hours/month free)
2. **Fly.io** (3 small VMs free)
3. **Cyclic.sh** (Unlimited free apps)

### Frontend Alternatives:
1. **Netlify** (100 GB bandwidth)
2. **GitHub Pages** (Static only, needs export)
3. **Cloudflare Pages** (Unlimited bandwidth)

### Database Alternatives:
1. **PlanetScale** (Free MySQL, 5 GB)
2. **Supabase** (Free PostgreSQL, 500 MB)
3. **MongoDB Atlas** (Free 512 MB)

---

## 📞 Support

### Deployment Issues
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- GitHub Actions: https://docs.github.com/actions

### DEMS System Issues
- Check browser console (F12)
- Check Railway logs (backend errors)
- Check Vercel logs (frontend errors)

---

## 🚀 Quick Commands Reference

```bash
# Update code and deploy
git add .
git commit -m "Update feature X"
git push origin main
# Both Railway and Vercel auto-deploy from GitHub

# Check deployment status
railway status  # Backend
vercel --prod   # Frontend

# View logs
railway logs    # Backend logs
vercel logs     # Frontend logs

# Rollback if needed
railway rollback
vercel rollback
```

---

## 🎉 Success!

Your Thailand DEMS is now live at:
- **Frontend**: `https://thailand-dems.vercel.app`
- **Backend**: `https://thailand-dems-backend.up.railway.app`
- **API Docs**: `https://thailand-dems-backend.up.railway.app/api`

Share your deployment URL with stakeholders and emergency response teams! 🚨

---

**Version:** 2.0  
**Last Updated:** November 24, 2025  
**Deployment Stack:** Vercel + Railway + MySQL
