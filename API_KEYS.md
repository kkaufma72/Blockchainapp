# 🔑 Free API Keys Guide

Get these FREE API keys to unlock full features (all no credit card required):

---

## 1️⃣ CoinGecko - Bitcoin Price Data ⭐ PRIORITY

**What it does:** Real-time Bitcoin prices, market data, historical data
**Free tier:** Demo API with decent rate limits

### Get Your Key:
1. Go to: https://www.coingecko.com/en/api
2. Click "Get Your Free API Key"
3. Sign up with email
4. Verify email
5. Go to Dashboard → API Keys
6. Copy your Demo API key (starts with `CG-`)

### Add to Vercel:
```
Name: COINGECKO_API_KEY
Value: CG-your-key-here
```

---

## 2️⃣ FRED - Economic Data ⭐ PRIORITY

**What it does:** Federal Reserve economic indicators (inflation, interest rates, DXY, etc.)
**Free tier:** Unlimited requests

### Get Your Key:
1. Go to: https://fred.stlouisfed.org/docs/api/api_key.html
2. Click "Request API Key"
3. Fill out form:
   - Name: Your name
   - Email: Your email
   - Organization: "Personal Project" or "Portfolio"
   - Purpose: "Bitcoin market analysis dashboard"
4. Submit (instant approval!)
5. Check email for API key

### Add to Vercel:
```
Name: FRED_API_KEY
Value: your-fred-api-key
```

---

## 3️⃣ NewsAPI - Sentiment Analysis ⭐ RECOMMENDED

**What it does:** News articles for sentiment analysis
**Free tier:** 100 requests/day

### Get Your Key:
1. Go to: https://newsapi.org/
2. Click "Get API Key"
3. Sign up with email
4. Verify email
5. Copy API key from dashboard

### Add to Vercel:
```
Name: NEWS_API_KEY
Value: your-newsapi-key
```

---

## 4️⃣ CryptoCompare - Social Metrics

**What it does:** Social media metrics, community data
**Free tier:** 100,000 calls/month

### Get Your Key:
1. Go to: https://www.cryptocompare.com/cryptopian/api-keys
2. Sign up
3. Go to "API Keys" section
4. Create new API key
5. Copy key

### Add to Vercel:
```
Name: CRYPTOCOMPARE_API_KEY
Value: your-cryptocompare-key
```

---

## 5️⃣ Alpha Vantage - Stock Market Data

**What it does:** S&P 500, gold prices for correlation analysis
**Free tier:** 25 requests/day (enough for daily updates)

### Get Your Key:
1. Go to: https://www.alphavantage.co/support/#api-key
2. Fill out form
3. Receive API key instantly
4. Copy key

### Add to Vercel:
```
Name: ALPHA_VANTAGE_KEY
Value: your-alphavantage-key
```

---

## 💡 How to Add API Keys to Vercel

### Method 1: Vercel Dashboard (Easiest)
1. Go to: https://vercel.com/dashboard
2. Click your project (`blockchainapp`)
3. Click "Settings" → "Environment Variables"
4. Click "Add Another"
5. Enter Name and Value
6. Select: ✅ Production ✅ Preview ✅ Development
7. Click "Save"
8. **Important:** Redeploy after adding keys
   - Go to "Deployments"
   - Click ••• on latest deployment
   - Click "Redeploy"

### Method 2: Vercel CLI
```bash
# Add one variable
vercel env add COINGECKO_API_KEY

# It will ask for:
# - Value: [paste your key]
# - Environment: Choose all (Production, Preview, Development)

# After adding all keys, redeploy:
vercel --prod
```

---

## 📊 Priority Order

Start with these in order:

1. **CoinGecko** - Essential for price data (5 min signup)
2. **FRED** - Great for economic context (instant approval)
3. **NewsAPI** - Good for sentiment (5 min signup)
4. **CryptoCompare** - Nice to have (10 min signup)
5. **Alpha Vantage** - Optional (instant)

---

## ⚡ Quick Test

After adding keys, test they work:

```bash
# Test CoinGecko
curl -H "x-cg-demo-api-key: YOUR_KEY" \
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"

# Should return: {"bitcoin":{"usd":98765}}
```

---

## 🎯 App Works Without API Keys!

**Don't worry!** The app works with limited functionality without any API keys:
- ✅ Basic price data (from free sources)
- ✅ UI and layout
- ✅ Database functionality
- ✅ Pattern detection algorithms

**With API keys, you get:**
- ✨ Real-time price updates
- ✨ Economic indicators
- ✨ News sentiment analysis
- ✨ Social media metrics
- ✨ Advanced correlations

---

## 📝 Checklist

Track your progress:

- [ ] CoinGecko API key obtained
- [ ] CoinGecko added to Vercel
- [ ] FRED API key obtained
- [ ] FRED added to Vercel
- [ ] NewsAPI key obtained
- [ ] NewsAPI added to Vercel
- [ ] CryptoCompare key obtained (optional)
- [ ] CryptoCompare added to Vercel (optional)
- [ ] Alpha Vantage key obtained (optional)
- [ ] Alpha Vantage added to Vercel (optional)
- [ ] Redeployed app after adding keys
- [ ] Tested app with new features

---

**Total time to get all free keys:** ~20-30 minutes
**All are FREE forever** (no credit card needed)

---

Ready to deploy? See `DEPLOY_NOW.md` for step-by-step instructions!

