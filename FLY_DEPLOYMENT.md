# 🚀 Fly.io Deployment Guide

You're deploying to Fly.io - perfect choice for this backend!

## ✅ API Keys You Have:

```bash
COINGECKO_API_KEY="CG-NTWoj1gDAAtBK9MFaLuG6o3Y"
FRED_API_KEY="13caddb0aaf6ac51471906e2e7a6cb9c"
GOOGLE_SERP_API_KEY="44dd2f39-30d5-44b5-b839-fa388a6185a7"
```

## 📝 Complete Deployment Steps:

### 1. Set All Required Secrets

```bash
# You already set these:
flyctl secrets set COINGECKO_API_KEY="CG-NTWoj1gDAAtBK9MFaLuG6o3Y" -a bitcoin-whale-backend
flyctl secrets set FRED_API_KEY="13caddb0aaf6ac51471906e2e7a6cb9c" -a bitcoin-whale-backend
flyctl secrets set GOOGLE_SERP_API_KEY="44dd2f39-30d5-44b5-b839-fa388a6185a7" -a bitcoin-whale-backend

# Add these additional required secrets:
flyctl secrets set PORT="3001" -a bitcoin-whale-backend
flyctl secrets set NODE_ENV="production" -a bitcoin-whale-backend
```

### 2. Create PostgreSQL Database on Fly.io

```bash
# Create a Postgres cluster
flyctl postgres create --name bitcoin-whale-db --region sjc

# Attach it to your app (this sets DATABASE_URL automatically)
flyctl postgres attach bitcoin-whale-db -a bitcoin-whale-backend
```

### 3. Deploy Your Backend

```bash
cd /Users/kyle/Blockchainapp-1/backend

# Deploy to Fly.io
flyctl deploy
```

### 4. Run Database Migrations

```bash
# After deployment, run migrations
flyctl ssh console -a bitcoin-whale-backend

# Inside the SSH session:
npx prisma db push
exit
```

### 5. Get Your Backend URL

```bash
flyctl status -a bitcoin-whale-backend

# Your backend will be at:
# https://bitcoin-whale-backend.fly.dev
```

## 🔧 Update Frontend to Use Fly.io Backend

Update your frontend environment variable:

**For Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `VITE_API_URL`:
   - Name: `VITE_API_URL`
   - Value: `https://bitcoin-whale-backend.fly.dev/api`
3. Redeploy frontend

**For Local Development:**
```bash
cd /Users/kyle/Blockchainapp-1/frontend
echo "VITE_API_URL=https://bitcoin-whale-backend.fly.dev/api" > .env.local
npm run dev
```

## 📊 Verify Deployment

```bash
# Check app status
flyctl status -a bitcoin-whale-backend

# View logs
flyctl logs -a bitcoin-whale-backend

# Test API
curl https://bitcoin-whale-backend.fly.dev/api/health

# Expected: {"status":"ok","timestamp":"..."}
```

## 🎯 Enable Background Jobs

Now that you have API keys, re-enable background jobs!

Edit `backend/src/index.ts` and uncomment:

```typescript
// Start background jobs
backgroundJobService.start();  // ← UNCOMMENT THIS
```

Then redeploy:
```bash
cd /Users/kyle/Blockchainapp-1/backend
git add .
git commit -m "Re-enable background jobs with API keys"
git push origin main
flyctl deploy
```

## 🔄 Useful Fly.io Commands

```bash
# View logs (live)
flyctl logs -a bitcoin-whale-backend

# SSH into your app
flyctl ssh console -a bitcoin-whale-backend

# Scale your app
flyctl scale count 1 -a bitcoin-whale-backend

# View secrets
flyctl secrets list -a bitcoin-whale-backend

# Update a secret
flyctl secrets set KEY=value -a bitcoin-whale-backend

# Restart app
flyctl apps restart bitcoin-whale-backend

# Check status
flyctl status -a bitcoin-whale-backend
```

## 💰 Costs

**Free Tier Includes:**
- ✅ 3 shared-cpu-1x VMs (160MB RAM each)
- ✅ 160GB outbound data transfer
- ✅ 3GB PostgreSQL storage
- ✅ Perfect for your portfolio project!

**Your app will be FREE on Fly.io!** 🎉

## 🌐 Full Architecture

```
┌─────────────────────────────────────────────┐
│  Vercel (Frontend)                          │
│  https://your-app.vercel.app                │
│                                             │
│  Connects to ↓                              │
└─────────────────────────────────────────────┘
              │
              │ HTTPS API Calls
              ↓
┌─────────────────────────────────────────────┐
│  Fly.io (Backend)                           │
│  https://bitcoin-whale-backend.fly.dev      │
│                                             │
│  ┌────────────────┐  ┌──────────────────┐  │
│  │  Express API   │──│  PostgreSQL DB   │  │
│  │  WebSockets    │  │  (Fly Postgres)  │  │
│  │  Background    │  └──────────────────┘  │
│  │  Jobs          │                         │
│  └────────────────┘                         │
│                                             │
│  Calls External APIs:                       │
│  • CoinGecko (price data)                   │
│  • FRED (economic data)                     │
│  • NewsAPI (sentiment)                      │
└─────────────────────────────────────────────┘
```

## 🎉 Next Steps

1. **Create Postgres database:**
   ```bash
   flyctl postgres create --name bitcoin-whale-db --region sjc
   flyctl postgres attach bitcoin-whale-db -a bitcoin-whale-backend
   ```

2. **Add remaining secrets:**
   ```bash
   flyctl secrets set PORT="3001" -a bitcoin-whale-backend
   flyctl secrets set NODE_ENV="production" -a bitcoin-whale-backend
   ```

3. **Deploy:**
   ```bash
   cd backend && flyctl deploy
   ```

4. **Run migrations:**
   ```bash
   flyctl ssh console -a bitcoin-whale-backend
   npx prisma db push
   ```

5. **Test:**
   ```bash
   curl https://bitcoin-whale-backend.fly.dev/api/health
   ```

6. **Update frontend** to use `https://bitcoin-whale-backend.fly.dev/api`

---

**Your backend will be live at:** `https://bitcoin-whale-backend.fly.dev` 🚀

Perfect for your portfolio - fully functional, real-time Bitcoin whale tracking!

