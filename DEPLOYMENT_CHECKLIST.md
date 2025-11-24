# ✅ Vercel Deployment Checklist

Follow this step-by-step checklist to deploy your Bitcoin Whale Tracker to Vercel.

---

## 📝 Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All code committed to Git
- [ ] Repository pushed to GitHub
- [ ] No sensitive data in code (API keys, passwords)
- [ ] `.gitignore` includes `.env`, `node_modules`, `dist`
- [ ] `README.md` updated with your information

```bash
git status                  # Check for uncommitted changes
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Database Setup
Choose ONE option and check when complete:

- [ ] **Option A: Vercel Postgres**
  - [ ] Created database at https://vercel.com/dashboard/stores
  - [ ] Copied `DATABASE_URL`
  - [ ] Database name: `bitcoin-whale-tracker-db`

- [ ] **Option B: Neon (Free)**
  - [ ] Created account at https://neon.tech
  - [ ] Created project: `bitcoin-whale-tracker`
  - [ ] Copied connection string
  - [ ] Verified free tier active

### 3. API Keys (Optional but Recommended)
- [ ] **CoinGecko** - https://www.coingecko.com/en/api
- [ ] **FRED** - https://fred.stlouisfed.org/docs/api/api_key.html
- [ ] **NewsAPI** - https://newsapi.org/
- [ ] **CryptoCompare** - https://www.cryptocompare.com/cryptopian/api-keys
- [ ] **Alpha Vantage** - https://www.alphavantage.co/support/#api-key

---

## 🚀 Deployment Steps

### Step 1: Create Vercel Project
- [ ] Go to https://vercel.com/new
- [ ] Click "Import Git Repository"
- [ ] Select `bitcoin-whale-tracker` repository
- [ ] Click "Import"

### Step 2: Configure Build Settings
- [ ] **Framework Preset:** Other
- [ ] **Root Directory:** `./` (leave blank)
- [ ] **Build Command:** `npm run vercel-build`
- [ ] **Output Directory:** `frontend/dist`
- [ ] **Install Command:** `npm run install:all`

### Step 3: Add Environment Variables

**Required Variables:**
- [ ] `DATABASE_URL` = `your-database-connection-string`
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3001`
- [ ] `VITE_API_URL` = `/api`

**Recommended Variables (if you have API keys):**
- [ ] `COINGECKO_API_KEY` = `your-coingecko-key`
- [ ] `FRED_API_KEY` = `your-fred-key`
- [ ] `NEWS_API_KEY` = `your-newsapi-key`
- [ ] `CRYPTOCOMPARE_API_KEY` = `your-cryptocompare-key`
- [ ] `ALPHA_VANTAGE_KEY` = `your-alphavantage-key`

**For each variable:**
1. Click "Add Another" in Environment Variables section
2. Enter **Name** and **Value**
3. Select: ✅ Production ✅ Preview ✅ Development
4. Click "Add"

### Step 4: Deploy
- [ ] Click "Deploy" button
- [ ] Wait 2-5 minutes for build
- [ ] Build succeeds with ✅ green checkmark

---

## 🗄️ Post-Deployment: Database Setup

After first deployment succeeds:

### Step 1: Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```
- [ ] Vercel CLI installed

### Step 2: Link Project
```bash
vercel link
```
- [ ] Follow prompts to link to your project
- [ ] Select your Vercel account/team
- [ ] Select the project you just deployed

### Step 3: Pull Environment Variables
```bash
vercel env pull
```
- [ ] Creates `.env.local` with all Vercel environment variables

### Step 4: Run Database Migrations
```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```
- [ ] Prisma client generated
- [ ] Migrations applied successfully
- [ ] Database schema created

**Alternative (if migrations fail):**
```bash
npx prisma db push
```
- [ ] Schema pushed to database

---

## ✅ Verification Checklist

### Check Deployment Status
- [ ] Visit Vercel dashboard: https://vercel.com/dashboard
- [ ] Project shows "Ready" status
- [ ] No errors in deployment logs

### Test Frontend
- [ ] Visit your Vercel URL: `https://your-project.vercel.app`
- [ ] Homepage loads successfully
- [ ] No console errors (F12 → Console)
- [ ] Dashboard displays

### Test Backend API
- [ ] Visit: `https://your-project.vercel.app/api/health`
- [ ] Should return: `{"status":"ok","timestamp":"..."}`

### Test Database Connection
- [ ] App loads without database errors
- [ ] Can view whale transactions (if data exists)
- [ ] Can view price data

### Test Real-Time Features
- [ ] Price ticker updates
- [ ] Transaction feed shows activity
- [ ] Charts render properly

---

## 🎨 Portfolio Customization

### Update Branding
- [ ] Update project name in `package.json`
- [ ] Update page title in `frontend/index.html`
- [ ] Add your name in `README.md`
- [ ] Add your contact info in `README.md`

### Add Screenshots
- [ ] Take screenshots of the dashboard
- [ ] Take screenshot of whale leaderboard
- [ ] Take screenshot of pattern detection
- [ ] Save in `docs/` folder
- [ ] Update `README.md` with screenshot links

### Set Up Custom Domain (Optional)
- [ ] Go to Project → Settings → Domains
- [ ] Add custom domain
- [ ] Configure DNS records
- [ ] Wait for SSL certificate
- [ ] Test custom domain

### Enable Analytics (Recommended)
- [ ] Go to Project → Analytics
- [ ] Enable Vercel Analytics
- [ ] (Optional) Install Speed Insights:
  ```bash
  cd frontend
  npm install @vercel/speed-insights
  ```

---

## 📊 Monitoring Setup

### Vercel Dashboard
- [ ] Bookmark deployment URL
- [ ] Enable email notifications for failed deployments
- [ ] Check "Functions" tab for API logs
- [ ] Monitor bandwidth usage

### Database Monitoring
- [ ] Check database connection limits
- [ ] Monitor storage usage
- [ ] Set up alerts for high usage (if available)

---

## 🔄 Continuous Deployment

Now that setup is complete, every push to `main` automatically deploys!

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically builds and deploys
# Check status at https://vercel.com/dashboard
```

- [ ] Test automatic deployment by making a small change
- [ ] Verify deployment succeeds automatically
- [ ] Check that changes appear on live site

---

## 📢 Share Your Project

### Portfolio Website
- [ ] Add project to portfolio with live demo link
- [ ] Include tech stack description
- [ ] Add screenshots or video demo

### Social Media
- [ ] Share on LinkedIn with project description
- [ ] Share on Twitter with #100DaysOfCode or similar
- [ ] Share in developer communities

### Resume/CV
- [ ] Add to projects section
- [ ] Mention technologies used
- [ ] Include live demo link
- [ ] Highlight key features (ML, real-time, multi-source data)

### GitHub
- [ ] Add topics to repository (bitcoin, blockchain, react, typescript, vercel)
- [ ] Pin repository to profile
- [ ] Add shields/badges to README
- [ ] Add "Deploy to Vercel" button to README

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Live URL is accessible
- ✅ Frontend loads without errors
- ✅ API health check returns OK
- ✅ Database is connected and accessible
- ✅ Price data is fetching
- ✅ Charts and visualizations render
- ✅ No errors in Vercel function logs
- ✅ Custom domain configured (if applicable)

---

## 🆘 If Something Goes Wrong

### Build Fails
1. Check Vercel build logs in dashboard
2. Look for error messages
3. Common issues:
   - Missing dependencies → Check `package.json`
   - TypeScript errors → Run `npm run build` locally
   - Missing env variables → Check Vercel settings

### Database Connection Fails
1. Verify `DATABASE_URL` is correct
2. Check database is accessible (not IP-restricted)
3. Test connection locally:
   ```bash
   cd backend
   DATABASE_URL=your-url npx prisma db pull
   ```

### API Routes Return 404
1. Check `vercel.json` routes configuration
2. Verify backend build succeeded
3. Check function logs in Vercel dashboard

### Need Help?
- **Vercel Docs:** https://vercel.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Vercel Support:** https://vercel.com/support
- **Community:** https://github.com/vercel/vercel/discussions

---

## 🎉 Congratulations!

Once all checkboxes are ✅, your Bitcoin Whale Tracker is:
- Live on Vercel
- Publicly accessible
- Ready for your portfolio
- Automatically deploying on every push

**Your live project:**
- 🌐 **URL:** `https://your-project.vercel.app`
- 📊 **Dashboard:** https://vercel.com/dashboard
- 📈 **Analytics:** Vercel Analytics tab

---

**Print this checklist and check off items as you complete them!**

Made with ❤️ | Deployed on Vercel

