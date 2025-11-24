# 🚀 Quick GitHub Upload & Deployment Guide

## Step 1: Upload to GitHub (5 minutes)

### Open PowerShell in your DEMS folder:

```powershell
cd C:\Users\phone\OneDrive\Desktop\DEMS

# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Thailand DEMS System"
```

### Create GitHub Repository:
1. Go to: https://github.com/new
2. Repository name: `thailand-dems`
3. Description: "Disaster and Emergency Management System for Thailand"
4. **Keep it Private** (for now, until you remove sensitive data)
5. Click "Create repository"

### Push to GitHub:
```powershell
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/thailand-dems.git
git branch -M main
git push -u origin main
```

✅ **Done! Your code is now on GitHub**

---

## Step 2: Deploy on Railway.app (15 minutes)

### A. Sign Up for Railway
1. Go to: https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your repositories

### B. Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `thailand-dems` repository

### C. Add MySQL Database
1. Click "New" → "Database" → "Add MySQL"
2. Wait for deployment (~1 minute)
3. Click on MySQL service
4. Go to "Variables" tab
5. **Copy these values** (you'll need them):
   - MYSQLHOST
   - MYSQLUSER
   - MYSQLPASSWORD
   - MYSQLDATABASE
   - MYSQLPORT

### D. Deploy Backend
1. Click "New" → "GitHub Repo" → Select `thailand-dems`
2. Click "Add Variables":
   ```
   DATABASE_HOST = <MYSQLHOST from above>
   DATABASE_USER = <MYSQLUSER from above>
   DATABASE_PASSWORD = <MYSQLPASSWORD from above>
   DATABASE_NAME = <MYSQLDATABASE from above>
   PORT = 5000
   NODE_ENV = production
   ```
3. In "Settings":
   - Root Directory: `/backend`
   - Start Command: `node server-disaster.js`
4. Click "Deploy"
5. Wait for deployment (~2 minutes)
6. **Copy the URL** (looks like: `https://your-app.railway.app`)

### E. Setup Database
1. In Railway, click on MySQL service
2. Click "Data" tab
3. Click "Query" 
4. Run these SQL files in order:
   
   **First, copy/paste contents of:**
   - `backend/db/schema-disaster.sql`
   - Click "Run"
   
   **Then:**
   - `backend/db/enhanced_system_schema.sql`
   - Click "Run"
   
   **Then:**
   - `backend/db/seed-disaster.sql`
   - Click "Run"
   
   **Finally:**
   - `backend/db/thailand_locations.sql`
   - Click "Run"

### F. Deploy Frontend
1. Click "New" → "GitHub Repo" → Select `thailand-dems` again
2. Click "Add Variables":
   ```
   NEXT_PUBLIC_API_URL = <your-backend-url-from-step-D>
   ```
3. In "Settings":
   - Root Directory: `/frontend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
4. Click "Deploy"
5. Wait for deployment (~3 minutes)
6. **Your site is live!** Copy the frontend URL

✅ **Your DEMS is now online!**

---

## Step 3: Add Custom Domain (30 minutes + DNS wait)

### A. Buy a Domain
**Option 1: Namecheap** (Cheapest)
1. Go to: https://namecheap.com
2. Search for your domain (e.g., `thailand-dems.com`)
3. Buy domain (~$10/year)

**Option 2: Google Domains**
1. Go to: https://domains.google.com
2. Search and buy (~$12/year)

### B. Configure Domain on Railway
1. In Railway, click your **frontend** service
2. Click "Settings" → "Domains"
3. Click "Custom Domain"
4. Enter your domain: `thailand-dems.com`
5. Railway will show DNS records like:
   ```
   Type: CNAME
   Name: @
   Value: your-app.railway.app
   ```

### C. Update DNS at Domain Registrar
1. Login to Namecheap/Google Domains
2. Find "DNS Settings" or "Manage DNS"
3. Add the CNAME record Railway showed you:
   - **Type**: CNAME
   - **Host**: @
   - **Value**: your-app.railway.app
   - **TTL**: Automatic
4. Add another for www:
   - **Type**: CNAME  
   - **Host**: www
   - **Value**: your-app.railway.app
   - **TTL**: Automatic
5. Save changes

### D. Wait for DNS Propagation
- Usually takes 10-30 minutes
- Can take up to 24 hours
- Check status: https://dnschecker.org

### E. SSL Certificate (Automatic)
- Railway automatically provisions SSL
- Your site will be HTTPS
- Wait ~10 minutes after DNS propagates

✅ **Your DEMS is now live with custom domain!**

---

## 🎉 Final Result

Your system will be accessible at:
- **Main Site**: https://thailand-dems.com
- **Dashboard**: https://thailand-dems.com/
- **Admin Panel**: https://thailand-dems.com/admin/disasters
- **API**: https://your-backend.railway.app

---

## ⚠️ IMPORTANT: Before Going Live

### Remove Sensitive Data:
1. In `backend/.env`:
   - Remove any real passwords
   - Use environment variables

2. In database:
   - Change default admin password
   - Remove test data

3. Update CORS:
   ```javascript
   // backend/server-disaster.js
   app.use(cors({
     origin: 'https://thailand-dems.com'
   }));
   ```

### Security Checklist:
- [ ] Change admin password
- [ ] Remove test accounts
- [ ] Update CORS to your domain only
- [ ] Add rate limiting
- [ ] Enable database backups (Railway auto-backups)
- [ ] Add monitoring (Railway has built-in)

---

## 💰 Cost Summary

- **Domain**: $10-12/year
- **Railway Free Tier**: $5/month credit (enough for low traffic)
- **Railway Pro** (if you need more): $20/month

**Total for small site**: ~$10-20/year
**Total for production**: ~$250-300/year

---

## 🆘 Troubleshooting

**Backend won't start:**
- Check environment variables are set correctly
- View logs in Railway dashboard

**Frontend can't connect to backend:**
- Make sure NEXT_PUBLIC_API_URL is set to backend URL
- Check CORS settings in backend

**Database errors:**
- Make sure you ran all SQL files in correct order
- Check database credentials in environment variables

**Domain not working:**
- Wait longer (DNS can take 24hrs)
- Check DNS settings are correct
- Use https://dnschecker.org to verify

**Need help?**
- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app

---

## 📞 Quick Commands Reference

```powershell
# Check Git status
git status

# Add new changes
git add .
git commit -m "Update message"
git push

# View logs
git log --oneline

# Create new branch
git checkout -b feature-name
```

---

**Ready to deploy? Start with Step 1!** 🚀

Estimated total time: **1-2 hours** (excluding DNS wait time)
