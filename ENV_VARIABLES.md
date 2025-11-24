# 🔐 Environment Variables Reference

Complete list of environment variables for Bitcoin Whale Tracker.

---

## 📋 Required Variables

These are **mandatory** for the app to work:

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` | Vercel Postgres or Neon.tech |
| `NODE_ENV` | Environment mode | `production` or `development` | Set manually |
| `PORT` | Backend server port | `3001` | Set manually |
| `VITE_API_URL` | Frontend API endpoint | `/api` (Vercel) or `http://localhost:3001` (local) | Set manually |

---

## 🌟 Recommended Variables

These enable **full functionality** (all have free tiers):

### Price & Market Data

| Variable | Service | Free Tier | Sign Up Link |
|----------|---------|-----------|--------------|
| `COINGECKO_API_KEY` | CoinGecko | Demo API | https://www.coingecko.com/en/api |
| `CRYPTOCOMPARE_API_KEY` | CryptoCompare | 100k calls/month | https://www.cryptocompare.com/cryptopian/api-keys |

### Economic Data

| Variable | Service | Free Tier | Sign Up Link |
|----------|---------|-----------|--------------|
| `FRED_API_KEY` | Federal Reserve | Unlimited | https://fred.stlouisfed.org/docs/api/api_key.html |
| `ALPHA_VANTAGE_KEY` | Alpha Vantage | 25 req/day | https://www.alphavantage.co/support/#api-key |

### News & Sentiment

| Variable | Service | Free Tier | Sign Up Link |
|----------|---------|-----------|--------------|
| `NEWS_API_KEY` | NewsAPI | 100 req/day | https://newsapi.org/ |

---

## 🔧 Optional Variables

These are **nice-to-have** for advanced features:

### Premium Data Sources

| Variable | Service | Free Tier | Sign Up Link | Cost |
|----------|---------|-----------|--------------|------|
| `MESSARI_API_KEY` | Messari | Limited | https://messari.io/api | Free tier available |
| `GLASSNODE_API_KEY` | Glassnode | Trial only | https://glassnode.com/ | $29+/month |

### Other Services

| Variable | Service | Purpose | Required |
|----------|---------|---------|----------|
| `GOOGLE_SERP_API_KEY` | SerpAPI | News scraping | No |
| `TWITTER_BEARER_TOKEN` | Twitter API | Social sentiment | No |

---

## 📧 Email Notifications (Optional)

For alert notifications via email:

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Email username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | Email password/app password | `your-app-password` |
| `NOTIFICATION_EMAIL` | Sender email | `alerts@yourdomain.com` |

**Gmail Setup:**
1. Enable 2FA on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use app password as `SMTP_PASSWORD`

---

## 🎯 Quick Setup Templates

### For Vercel Deployment

```env
# Required
DATABASE_URL=postgresql://your-vercel-postgres-url
NODE_ENV=production
PORT=3001
VITE_API_URL=/api

# Recommended (get free keys)
COINGECKO_API_KEY=your-key-here
FRED_API_KEY=your-key-here
NEWS_API_KEY=your-key-here
CRYPTOCOMPARE_API_KEY=your-key-here
ALPHA_VANTAGE_KEY=your-key-here
```

### For Local Development

```env
# Required
DATABASE_URL=postgresql://whale:whalepassword@localhost:5434/bitcoinwhale
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Recommended
COINGECKO_API_KEY=your-key-here
FRED_API_KEY=your-key-here
NEWS_API_KEY=your-key-here
```

### For Docker Development

```env
# Required
DATABASE_URL=postgresql://whale:whalepassword@postgres:5432/bitcoinwhale
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Recommended
COINGECKO_API_KEY=your-key-here
FRED_API_KEY=your-key-here
```

---

## 🔄 How to Set Environment Variables

### On Vercel (Production)

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Name:** `DATABASE_URL`
   - **Value:** `your-value-here`
   - **Environment:** Production, Preview, Development (select all)
4. Click **Save**
5. Redeploy: **Deployments** → **•••** → **Redeploy**

### Locally (Development)

```bash
# Create .env file in backend/
cat > backend/.env << 'EOF'
DATABASE_URL=postgresql://whale:whalepassword@localhost:5434/bitcoinwhale
NODE_ENV=development
PORT=3001
COINGECKO_API_KEY=your-key-here
FRED_API_KEY=your-key-here
NEWS_API_KEY=your-key-here
EOF

# Never commit .env files!
# They're already in .gitignore
```

### Using Vercel CLI

```bash
# Add a single variable
vercel env add DATABASE_URL

# You'll be prompted:
# - Enter value: postgresql://your-connection-string
# - Add to: Production, Preview, Development

# Pull all env vars locally
vercel env pull

# This creates .env.local with all Vercel variables
```

---

## 🧪 Testing Environment Variables

### Test Backend Connection

```bash
cd backend

# Test database connection
npx prisma db pull

# If it works, your DATABASE_URL is correct!
```

### Test API Keys

```bash
# Test in Node REPL
node

# Test CoinGecko
const axios = require('axios');
axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
  headers: { 'x-cg-demo-api-key': 'your-key-here' }
}).then(res => console.log(res.data));

# Should return: { bitcoin: { usd: 98765 } }
```

### Verify All Variables Loaded

Add this to your backend (temporary):

```typescript
// backend/src/index.ts
console.log('Environment Check:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('COINGECKO_API_KEY:', process.env.COINGECKO_API_KEY ? '✅ Set' : '⚠️  Missing');
console.log('FRED_API_KEY:', process.env.FRED_API_KEY ? '✅ Set' : '⚠️  Missing');
console.log('NEWS_API_KEY:', process.env.NEWS_API_KEY ? '✅ Set' : '⚠️  Missing');
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Use environment variables for all secrets
- Use different keys for development and production
- Rotate API keys periodically
- Use `.env.local` for local overrides (gitignored)
- Add `backend/.env` to `.gitignore`

### ❌ DON'T:
- Commit `.env` files to Git
- Share API keys publicly
- Use production keys in development
- Hardcode secrets in code
- Expose API keys in frontend code

---

## 📊 Minimum Viable Setup

**To get the app working with basic features:**

```env
# Absolute minimum
DATABASE_URL=your-database-url
NODE_ENV=production
PORT=3001
VITE_API_URL=/api

# That's it! The app will work with limited data
```

**For a good demo (recommended):**

```env
# Minimum + these 3 free keys
DATABASE_URL=your-database-url
NODE_ENV=production
PORT=3001
VITE_API_URL=/api
COINGECKO_API_KEY=your-key (FREE)
FRED_API_KEY=your-key (FREE)
NEWS_API_KEY=your-key (FREE - 100/day)
```

---

## 🎓 Learning Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Database URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Node.js dotenv](https://github.com/motdotla/dotenv)

---

## ⚡ Quick Reference

```bash
# List all Vercel env vars
vercel env ls

# Pull from Vercel to local
vercel env pull

# Add new variable
vercel env add VARIABLE_NAME

# Remove variable
vercel env rm VARIABLE_NAME

# Edit .env locally
nano backend/.env

# Reload backend after .env change
cd backend && npm run dev
```

---

**Pro Tip:** Start with just `DATABASE_URL` and add API keys one at a time as you test features!

