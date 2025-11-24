# 🌐 DEMS Deployment Guide

## Complete steps to deploy your DEMS system online with a custom domain

---

## 📋 **Prerequisites**

- GitHub account
- Domain name (buy from Namecheap, GoDaddy, or Google Domains)
- Credit card for hosting services (most have free tiers)

---

## 🎯 **Deployment Options**

### **Option 1: Full Stack Deployment (Recommended)**
Deploy both frontend and backend together

**Best Platforms:**
1. **Railway.app** ⭐ (Easiest, Free tier available)
2. **Render.com** (Great free tier)
3. **Heroku** (Easy but paid)
4. **DigitalOcean App Platform**

### **Option 2: Separate Deployment**
- **Frontend**: Vercel/Netlify
- **Backend**: Railway/Render
- **Database**: PlanetScale/Railway/AWS RDS

---

## 🚀 **RECOMMENDED: Railway.app Deployment**

### **Why Railway?**
✅ Easiest setup
✅ Free $5/month credit
✅ Automatic HTTPS
✅ Built-in MySQL database
✅ GitHub integration
✅ Custom domain support
✅ Zero configuration needed

---

## 📝 **Step-by-Step Deployment**

### **STEP 1: Upload to GitHub**

```bash
# In your DEMS folder
git init
git add .
git commit -m "Initial commit - DEMS System"

# Create new repository on GitHub (github.com/new)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/thailand-dems.git
git branch -M main
git push -u origin main
```

### **STEP 2: Deploy on Railway.app**

1. **Go to Railway.app**
   - Visit: https://railway.app
   - Click "Start a New Project"
   - Login with GitHub

2. **Add MySQL Database**
   - Click "+ New"
   - Select "Database" → "MySQL"
   - Wait for deployment
   - Copy connection details

3. **Deploy Backend**
   - Click "+ New"
   - Select "GitHub Repo"
   - Choose your DEMS repository
   - Set root directory: `/backend`
   - Add environment variables:
     ```
     DATABASE_HOST=<from Railway MySQL>
     DATABASE_USER=<from Railway MySQL>
     DATABASE_PASSWORD=<from Railway MySQL>
     DATABASE_NAME=<from Railway MySQL>
     PORT=5000
     ```
   - Click "Deploy"

4. **Deploy Frontend**
   - Click "+ New" again
   - Select same GitHub repo
   - Set root directory: `/frontend`
   - Add environment variables:
     ```
     NEXT_PUBLIC_API_URL=<your-backend-url>
     ```
   - Click "Deploy"

5. **Setup Database**
   - Connect to MySQL using Railway console
   - Run your schema files:
     ```sql
     -- Copy contents of:
     backend/db/schema-disaster.sql
     backend/db/enhanced_system_schema.sql
     backend/db/seed-disaster.sql
     backend/db/thailand_locations.sql
     ```

6. **Get Your URLs**
   - Backend: `https://your-app.railway.app`
   - Frontend: `https://your-frontend.railway.app`

### **STEP 3: Add Custom Domain**

1. **Buy a Domain**
   - Namecheap.com (~$10/year for .com)
   - Google Domains (~$12/year)
   - Example: `thailand-dems.com`

2. **Configure Domain on Railway**
   - Click on your frontend service
   - Go to "Settings" → "Domains"
   - Click "Custom Domain"
   - Enter: `thailand-dems.com` and `www.thailand-dems.com`
   - Railway will show DNS records

3. **Update Domain DNS**
   - Login to your domain registrar
   - Add CNAME records Railway provides:
     ```
     Type: CNAME
     Name: www
     Value: <railway-url>
     
     Type: CNAME
     Name: @
     Value: <railway-url>
     ```
   - Wait 10-60 minutes for DNS propagation

4. **SSL Certificate**
   - Railway automatically provisions SSL
   - Your site will be HTTPS

---

## 🔧 **Required Code Changes Before Deployment**

### **1. Update Backend Database Connection**

Create `/backend/config/production.js`:
```javascript
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
```

### **2. Update Frontend API URL**

Update `/frontend/lib/api.js`:
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

### **3. Add Production Scripts**

Update `backend/package.json`:
```json
{
  "scripts": {
    "start": "node server-disaster.js",
    "dev": "nodemon server-disaster.js"
  }
}
```

Update `frontend/package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

---

## 💰 **Cost Breakdown**

### **Free Option:**
- Railway: $5/month free credit (enough for small traffic)
- Domain: $10-12/year
- **Total: ~$10-12/year**

### **Paid Option (More Traffic):**
- Railway Pro: $20/month
- Domain: $10/year
- **Total: ~$250/year**

---

## 🔒 **Security Checklist**

Before going live:

✅ Remove hardcoded passwords from code
✅ Use environment variables for all secrets
✅ Enable CORS only for your domain
✅ Add rate limiting to API
✅ Setup database backups
✅ Enable HTTPS (automatic on Railway)
✅ Add admin authentication
✅ Sanitize user inputs

---

## 📊 **Alternative Platforms Comparison**

| Platform | Free Tier | Database | Custom Domain | Difficulty |
|----------|-----------|----------|---------------|------------|
| Railway.app | ✅ $5/mo | ✅ Built-in | ✅ Free | ⭐ Easy |
| Render.com | ✅ Limited | ✅ Free tier | ✅ Free | ⭐⭐ Medium |
| Vercel + PlanetScale | ✅ Good | ✅ 5GB free | ✅ Free | ⭐⭐ Medium |
| Heroku | ❌ Paid only | ✅ Paid | ✅ Free | ⭐ Easy |
| AWS/Azure | ✅ 12mo free | ✅ Complex | ✅ Free | ⭐⭐⭐⭐ Hard |
| DigitalOcean | ❌ $5/mo | ✅ Separate | ✅ Free | ⭐⭐⭐ Medium |

---

## 🎯 **Quick Start Commands**

```bash
# 1. Initialize Git
cd C:\Users\phone\OneDrive\Desktop\DEMS
git init
git add .
git commit -m "Initial commit"

# 2. Create GitHub repo at github.com/new

# 3. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/thailand-dems.git
git push -u origin main

# 4. Go to Railway.app and deploy!
```

---

## 🌟 **After Deployment**

Your DEMS will be live at:
- **Main Site**: `https://thailand-dems.com`
- **Admin Panel**: `https://thailand-dems.com/admin/disasters`
- **API**: `https://api.thailand-dems.com` (if you setup subdomain)

---

## 📞 **Need Help?**

Common issues and solutions:
- **Database connection fails**: Check Railway environment variables
- **Frontend can't reach backend**: Update NEXT_PUBLIC_API_URL
- **Domain not working**: Wait 1-2 hours for DNS propagation
- **SSL not working**: Railway auto-provisions, wait 10 minutes

---

## 🚀 **Performance Tips**

1. **Enable Caching**: Add Redis for session management
2. **CDN**: Use Cloudflare (free) for faster global access
3. **Database Optimization**: Add indexes to frequent queries
4. **Image Optimization**: Use Next.js Image component
5. **Monitoring**: Add Sentry for error tracking

---

**Ready to deploy? Start with Step 1 - GitHub upload!** 🎉

---

**Estimated Time:**
- GitHub upload: 5 minutes
- Railway deployment: 15 minutes
- Domain setup: 30 minutes (+ DNS wait time)
- **Total: ~1 hour + DNS wait**
