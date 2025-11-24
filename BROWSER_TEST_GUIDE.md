# 🌐 Testing Your App Locally

## Quick Test - See It in Your Browser Now!

### Option 1: Test Frontend Only (No Backend Needed)

```bash
# In terminal 1 - Start frontend
cd /Users/kyle/Blockchainapp-1/frontend
npm run dev
```

Then open: **http://localhost:3000**

You should see:
- ✅ Bitcoin Whale Tracker homepage
- ✅ Navigation tabs load
- ⚠️ Data won't load (backend not running yet)

This proves the **frontend works**!

---

### Option 2: Test Full Stack (Frontend + Backend)

**Terminal 1 - Start Backend:**
```bash
cd /Users/kyle/Blockchainapp-1/backend
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd /Users/kyle/Blockchainapp-1/frontend  
npm run dev
```

Then open: **http://localhost:3000**

You should see:
- ✅ Frontend loads
- ✅ API calls work (if database is set up)
- ✅ Price data displays
- ✅ Whale transactions show

---

## 🔍 What "Not Loading" Means

When you say "not loading in browser", it could mean:

### 1. **Blank White Page** ❌
- **Problem:** Frontend not built or wrong URL
- **Solution:** Make sure you're visiting the right URL
- **For Vercel:** `https://your-app.vercel.app`
- **For Local:** `http://localhost:3000`

### 2. **Frontend Loads, But No Data** ⚠️
- **Problem:** Backend not working or wrong API URL
- **What you see:** Page loads, but charts are empty, "Loading..." or errors
- **Solution:** 
  - Check browser console (F12 → Console tab)
  - Look for API errors (404, 500, CORS errors)
  - Verify backend is running

### 3. **"Cannot GET /" Error** ❌
- **Problem:** Server running but routing issue
- **Solution:** Check your Vercel configuration

### 4. **Loading Forever** ⏳
- **Problem:** API requests timing out
- **Solution:** 
  - Check backend is accessible
  - Check CORS configuration
  - Verify DATABASE_URL is correct

---

## 🧪 Debug Steps

### Step 1: Open Browser Dev Tools
1. Open your app in browser
2. Press **F12** (or Cmd+Option+I on Mac)
3. Click **Console** tab
4. Look for errors in red

### Step 2: Check Network Requests
1. In Dev Tools, click **Network** tab
2. Refresh the page
3. Look at requests:
   - ✅ Green/200 = Success
   - ⚠️ Yellow/3xx = Redirect
   - ❌ Red/4xx or 5xx = Error

### Step 3: Test API Directly

Open a new tab and try:
```
https://your-app.vercel.app/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-24T...",
  "environment": "production"
}
```

**If you get this, backend works!** ✅

**If you get 404:**
- Backend didn't deploy or routes are wrong
- Check Vercel function logs

**If you get 500:**
- Backend is running but has an error
- Check Vercel function logs for details

---

## 📊 What You Should See

### On Homepage:
```
╔═══════════════════════════════════════════╗
║    🪙 Bitcoin Whale Tracker               ║
║    Monitor large Bitcoin transactions     ║
║                                           ║
║    Current Price: $98,456                 ║
║    24h Change: +2.3%                      ║
╚═══════════════════════════════════════════╝

[Live Chart] [Treasury] [Predictions] [Transactions]...

[Charts and data tables appear here]
```

### If Backend Not Connected:
```
╔═══════════════════════════════════════════╗
║    🪙 Bitcoin Whale Tracker               ║
║    Monitor large Bitcoin transactions     ║
║                                           ║
║    Loading price data...                  ║
╚═══════════════════════════════════════════╝

Error: Failed to fetch price data
```

---

## 🔧 Common Issues & Fixes

### Issue: "Failed to fetch" in console
**Problem:** Frontend can't reach backend
**Fix:**
```bash
# Check frontend/.env or .env.local
echo "VITE_API_URL=/api" > frontend/.env.local

# Or for local development:
echo "VITE_API_URL=http://localhost:3001" > frontend/.env.local
```

### Issue: CORS error in console
**Problem:** Backend blocking frontend requests
**Fix:** Already handled in `backend/api/index.ts` - redeploy

### Issue: Database connection error
**Problem:** DATABASE_URL not set or invalid
**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check `DATABASE_URL` is set
3. Click Edit and verify it's correct
4. Redeploy: Deployments → ••• → Redeploy

### Issue: "Module not found" errors
**Problem:** Dependencies not installed on Vercel
**Fix:**
```bash
# Make sure package.json includes all dependencies
cd frontend
npm install
cd ../backend
npm install

# Commit and push
git add .
git commit -m "Update dependencies"
git push origin main
```

---

## 🎯 Quick Deployment Check

After deploying to Vercel, check these URLs:

**1. Homepage:**
```
https://your-app.vercel.app/
```
Should show: Bitcoin Whale Tracker interface ✅

**2. API Health:**
```
https://your-app.vercel.app/api/health
```
Should return: `{"status":"ok",...}` ✅

**3. Price Endpoint:**
```
https://your-app.vercel.app/api/price/current
```
Should return price data or error message ✅

**4. Static Assets:**
```
https://your-app.vercel.app/assets/
```
Should load CSS/JS files ✅

---

## 📸 Take Screenshots

When testing, take screenshots of:
1. **Homepage** - For your portfolio
2. **Console** - To debug errors
3. **Network tab** - To see which requests fail
4. **Working features** - To show off!

---

## 🆘 Still Not Loading?

### Share This Info:

1. **What you see:**
   - Screenshot of browser
   - Screenshot of console (F12 → Console)
   - Screenshot of Network tab (F12 → Network)

2. **Your Vercel URL:**
   - The full URL where it's deployed

3. **Error messages:**
   - Any red errors in console
   - Any failed network requests

4. **Vercel deployment status:**
   - Go to Vercel Dashboard
   - Click your project
   - Check if deployment succeeded (green checkmark)

---

## ✅ Success Checklist

When everything works, you should see:

- [ ] Frontend loads (page appears)
- [ ] No errors in console
- [ ] Price ticker shows Bitcoin price
- [ ] Tabs are clickable
- [ ] Charts render (even if empty)
- [ ] `/api/health` returns OK
- [ ] No 404 errors in Network tab

If you have all these ✅, your app is working perfectly!

---

**Need help?** Check the console errors and Vercel function logs first!

