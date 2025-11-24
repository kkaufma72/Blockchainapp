# 🚀 Bitcoin Whale Tracker - Vercel Deployment Guide

Complete guide to deploy your Bitcoin Whale Tracker to Vercel for your portfolio.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Vercel Postgres** (or Neon.tech for free tier)

---

## 🗄️ Step 1: Set Up Database

### Option A: Vercel Postgres (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Storage** → **Create Database** → **Postgres**
3. Name it `bitcoin-whale-tracker-db`
4. Select your region (choose closest to your users)
5. Click **Create**
6. Copy the `DATABASE_URL` - you'll need this later

### Option B: Neon (Free Alternative)

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create a new project: `bitcoin-whale-tracker`
4. Copy the connection string
5. It looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb`

---

## 📦 Step 2: Deploy to Vercel

### Method 1: Using Vercel Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Click **Import Project**
   - Select your GitHub repository
   - Framework Preset: **Other**
   - Root Directory: `./` (leave blank)
   - Build Command: `npm run vercel-build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm run install:all`

3. **Configure Environment Variables**
   Click **Environment Variables** and add:

   **Required:**
   ```env
   DATABASE_URL=postgresql://your-connection-string-here
   NODE_ENV=production
   PORT=3001
   ```

   **Optional (but recommended for full features):**
   ```env
   COINGECKO_API_KEY=your-key
   FRED_API_KEY=your-key
   NEWS_API_KEY=your-key
   CRYPTOCOMPARE_API_KEY=your-key
   ALPHA_VANTAGE_KEY=your-key
   ```

   **Frontend Environment Variables:**
   ```env
   VITE_API_URL=/api
   ```

4. **Deploy**
   - Click **Deploy**
   - Wait 2-5 minutes for build
   - Your app will be live! 🎉

### Method 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your username
# - Link to existing project? No
# - Project name? bitcoin-whale-tracker
# - Directory? ./
# - Override settings? Yes
#   - Build Command: npm run vercel-build
#   - Output Directory: frontend/dist
#   - Development Command: npm run dev

# Add environment variables
vercel env add DATABASE_URL
# Paste your database URL
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

---

## 🔧 Step 3: Initialize Database

After deployment, you need to run Prisma migrations:

### Using Vercel CLI:

```bash
# Set up your local .env with production DATABASE_URL
echo "DATABASE_URL=your-vercel-postgres-url" > backend/.env

# Run migrations
cd backend
npx prisma migrate deploy

# Or generate and push schema
npx prisma db push
```

### Alternative: Using Vercel Terminal (Enterprise)

If you have Vercel Enterprise, you can use the terminal in the dashboard:

1. Go to your project → Settings → Functions
2. Enable "Function Terminal"
3. Run migration commands there

---

## 🌐 Step 4: Get Your URLs

After successful deployment:

**Frontend URL:** `https://bitcoin-whale-tracker-[random].vercel.app`
**API Endpoint:** `https://bitcoin-whale-tracker-[random].vercel.app/api`

### Set Up Custom Domain (Optional)

1. Go to Project → Settings → Domains
2. Add your domain (e.g., `whale-tracker.yourdomain.com`)
3. Follow DNS configuration instructions
4. Update environment variable:
   ```env
   FRONTEND_URL=https://whale-tracker.yourdomain.com
   ```

---

## 🔐 Step 5: API Keys Setup

For full functionality, get free API keys:

### 1. CoinGecko (Price Data)
- Visit: https://www.coingecko.com/en/api
- Sign up for free Demo account
- Copy API key
- Add to Vercel env: `COINGECKO_API_KEY`

### 2. FRED (Economic Data)
- Visit: https://fred.stlouisfed.org/docs/api/api_key.html
- Request free API key
- Add to Vercel env: `FRED_API_KEY`

### 3. NewsAPI (Sentiment Analysis)
- Visit: https://newsapi.org/
- Free tier: 100 requests/day
- Add to Vercel env: `NEWS_API_KEY`

### 4. CryptoCompare (Social Metrics)
- Visit: https://www.cryptocompare.com/cryptopian/api-keys
- Free tier available
- Add to Vercel env: `CRYPTOCOMPARE_API_KEY`

### 5. Alpha Vantage (TradFi Correlation)
- Visit: https://www.alphavantage.co/support/#api-key
- Free tier: 25 requests/day
- Add to Vercel env: `ALPHA_VANTAGE_KEY`

---

## 📊 Step 6: Verify Deployment

1. **Check Frontend**
   - Visit your Vercel URL
   - You should see the dashboard load

2. **Check API**
   - Visit `https://your-url.vercel.app/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Check Database Connection**
   - The app should load data
   - Check Vercel logs: Project → Deployments → [Latest] → View Function Logs

4. **Test WebSocket** (if not working, that's normal on Vercel)
   - WebSockets don't work on Vercel's serverless functions
   - Real-time features will fall back to polling

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module 'prisma'"**
```bash
# Make sure postinstall script runs
# Check backend/package.json has:
"postinstall": "prisma generate"
```

**Error: "ENOENT: no such file or directory"**
- Check `vercel.json` includeFiles configuration
- Ensure Prisma schema is included

### Database Connection Issues

**Error: "Can't reach database server"**
```bash
# Test connection locally
cd backend
DATABASE_URL=your-url npx prisma db pull

# If it works locally, check Vercel env vars
vercel env ls
```

**Error: "Migration failed"**
```bash
# Reset database (careful - deletes data!)
npx prisma migrate reset

# Or push schema directly
npx prisma db push --force-reset
```

### API Not Working

**Error: "404 on /api routes"**
- Check `vercel.json` routes configuration
- Verify backend build succeeded in deployment logs

**Error: "CORS policy blocked"**
- Update `FRONTEND_URL` env variable
- Check backend CORS configuration

### Frontend Can't Connect to API

**Error: "Network Error" or "Failed to fetch"**
```bash
# Check frontend env variable
VITE_API_URL=/api  # For same-domain deployment

# Or use full URL for separate deployment
VITE_API_URL=https://your-backend-url.vercel.app
```

---

## 🎨 Customize for Portfolio

### Add Custom Branding

1. **Update Project Name**
   - Edit `package.json` → `name`
   - Edit `frontend/index.html` → `<title>`

2. **Add Your Info**
   - Update README.md with your name
   - Add screenshots of the app
   - Include tech stack description

3. **Add Analytics**
   ```env
   # Add to Vercel env
   VERCEL_ANALYTICS_ID=your-analytics-id
   ```

### Create README for Portfolio

Add to your main README.md:
```markdown
## 🌐 Live Demo
[View Live Demo](https://your-url.vercel.app)

## 💼 About This Project
Built as a portfolio project to demonstrate full-stack development skills using:
- **Frontend:** React, TypeScript, Vite, TailwindCSS
- **Backend:** Node.js, Express, Prisma ORM
- **Database:** PostgreSQL (Vercel Postgres)
- **Deployment:** Vercel
- **Real-time:** WebSocket (Socket.io)
- **APIs:** CoinGecko, FRED, NewsAPI, CryptoCompare
```

---

## 📈 Performance Optimization

### Enable Vercel Speed Insights

```bash
npm install @vercel/speed-insights --prefix frontend
```

Add to `frontend/src/main.tsx`:
```typescript
import { SpeedInsights } from '@vercel/speed-insights/react'

// In your App component
<SpeedInsights />
```

### Enable Edge Caching

Update `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/api/price",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

---

## 🔄 Continuous Deployment

Once set up, every push to `main` branch automatically deploys to production!

```bash
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically builds and deploys
# Check status at https://vercel.com/dashboard
```

---

## 📝 Environment Variables Checklist

Copy this list to your Vercel project settings:

### Required
- [ ] `DATABASE_URL`
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `VITE_API_URL=/api`

### Recommended
- [ ] `COINGECKO_API_KEY`
- [ ] `FRED_API_KEY`
- [ ] `NEWS_API_KEY`
- [ ] `CRYPTOCOMPARE_API_KEY`
- [ ] `ALPHA_VANTAGE_KEY`

### Optional
- [ ] `MESSARI_API_KEY`
- [ ] `GLASSNODE_API_KEY`
- [ ] `GOOGLE_SERP_API_KEY`
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASSWORD`

---

## 🎉 You're Done!

Your Bitcoin Whale Tracker is now live on Vercel!

**Next Steps:**
1. Share your project link on LinkedIn/Twitter
2. Add it to your portfolio website
3. Include it on your resume
4. Keep improving and deploying updates

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Join discussions: https://github.com/vercel/vercel/discussions

---

Made with ❤️ for your portfolio | Deployed on Vercel

