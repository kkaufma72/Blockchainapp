# 🚀 Quick Start Guide

Get your Bitcoin Whale Tracker running in 5 minutes!

## For Vercel Deployment (Recommended for Portfolio)

### 1️⃣ Create Vercel Account
- Go to [vercel.com](https://vercel.com) and sign up with GitHub

### 2️⃣ Set Up Database
Choose ONE of these options:

#### Option A: Vercel Postgres (Easiest)
1. Go to [Vercel Storage](https://vercel.com/dashboard/stores)
2. Click **Create Database** → **Postgres**
3. Name: `whale-tracker-db`
4. Click **Create**
5. **Copy the `DATABASE_URL`** (you'll need this in step 4)

#### Option B: Neon (Free Forever)
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub (free)
3. Create project: `bitcoin-whale-tracker`
4. **Copy the connection string** (looks like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb`)

### 3️⃣ Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 4️⃣ Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select `bitcoin-whale-tracker`
4. Configure:
   - **Framework Preset:** Other
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `frontend/dist`
   - **Install Command:** `npm run install:all`

5. **Add Environment Variables:**
   Click "Environment Variables" and add these:
   
   ```env
   DATABASE_URL=postgresql://your-connection-string-here
   NODE_ENV=production
   PORT=3001
   VITE_API_URL=/api
   ```

6. Click **Deploy** and wait 2-3 minutes ✨

### 5️⃣ Initialize Database
After deployment succeeds:

```bash
# Install Vercel CLI
npm install -g vercel

# Link to your project
vercel link

# Pull environment variables
vercel env pull

# Run migrations
cd backend
npx prisma migrate deploy
```

### 6️⃣ Done! 🎉
Your app is now live at: `https://your-project.vercel.app`

---

## For Local Development

### Prerequisites
- Node.js 20+ ([download](https://nodejs.org/))
- Docker Desktop ([download](https://www.docker.com/products/docker-desktop/))

### Setup

```bash
# 1. Install dependencies
npm run install:all

# 2. Start PostgreSQL database
docker-compose up -d postgres

# 3. Create .env file
cat > backend/.env << EOF
DATABASE_URL="postgresql://whale:whalepassword@localhost:5434/bitcoinwhale"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF

# 4. Run database migrations
cd backend
npx prisma migrate deploy
cd ..

# 5. Start both frontend and backend
npm run dev
```

Visit: http://localhost:3000

---

## 🔑 Optional: Add API Keys

For full features, get these **free** API keys:

### 1. CoinGecko (Recommended)
- Visit: https://www.coingecko.com/en/api
- Click "Get Your Free API Key"
- Add to `.env`: `COINGECKO_API_KEY=your-key`

### 2. FRED Economic Data
- Visit: https://fred.stlouisfed.org/docs/api/api_key.html
- Request API key (instant approval)
- Add to `.env`: `FRED_API_KEY=your-key`

### 3. NewsAPI (Sentiment)
- Visit: https://newsapi.org/
- Sign up (100 requests/day free)
- Add to `.env`: `NEWS_API_KEY=your-key`

After adding keys, restart the backend:
```bash
cd backend
npm run dev
```

---

## 📊 Verify Everything Works

### Check Backend
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Check Database
```bash
cd backend
npx prisma studio
# Opens database GUI at http://localhost:5555
```

### Check Frontend
Visit http://localhost:3000
- You should see the dashboard
- Price ticker should be live
- Charts should render

---

## 🐛 Common Issues

### "Port already in use"
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in backend/.env
PORT=4000
```

### "Can't connect to database"
```bash
# Check Docker is running
docker ps

# Restart database
docker-compose restart postgres

# Check connection string is correct
cd backend
npx prisma db push
```

### "Module not found"
```bash
# Reinstall dependencies
npm run install:all

# Clear node_modules and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install:all
```

### Frontend shows "API Error"
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check VITE_API_URL in frontend
cd frontend
echo "VITE_API_URL=http://localhost:3001" > .env.local
npm run dev
```

---

## 📚 Next Steps

1. ✅ Deploy to Vercel (use [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md))
2. ✅ Add to your portfolio website
3. ✅ Get API keys for full functionality
4. ✅ Customize branding and colors
5. ✅ Add to your resume/LinkedIn

---

## 💡 Pro Tips

- **Use Neon for free database** - No credit card required, never expires
- **Enable Vercel Analytics** - Track your portfolio traffic
- **Add screenshots to README** - Employers love visuals
- **Set up custom domain** - Makes it more professional
- **Monitor Vercel logs** - Check for errors after deployment

---

Need help? Check the full [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) guide!

