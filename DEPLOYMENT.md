# Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/posture-perfect-crm.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect settings
   - Click "Deploy"

### Method 2: Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow prompts:**
   - Set up and deploy? `Y`
   - Which scope? Choose your account
   - Link to existing project? `N`
   - Project name? `posture-perfect-crm`
   - Directory? `./` (current directory)

## 🔧 Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```
NODE_ENV=production
SESSION_SECRET=your-super-secret-key-here
```

## 📁 Project Structure

```
posture-perfect-crm/
├── public/           # Frontend files
├── server.js         # Backend API
├── database.js       # Database setup
├── vercel.json       # Vercel configuration
├── package.json      # Dependencies
└── *.sql            # Database schemas
```

## 🌐 Live URLs

After deployment, you'll get:
- **Production:** `https://your-project.vercel.app`
- **Preview:** `https://your-project-git-branch.vercel.app`

## 🔄 Auto-Deploy

Every push to `main` branch will automatically deploy to production.

## 📊 Features Available

- ✅ Patient Management Dashboard
- ✅ Modern Tailwind UI
- ✅ Responsive Design
- ✅ Authentication System (commented out)
- ✅ Admin Panel
- ✅ Calendar, Invoices, Reports
- ✅ Treatment Templates

## 🛠️ Local Development

```bash
npm install
npm run dev
# Visit http://localhost:3000
```

## 📝 Notes

- Database is in-memory for demo (resets on deployment)
- Authentication is commented out for easy demo
- All features work without login required
- Production-ready with proper error handling
