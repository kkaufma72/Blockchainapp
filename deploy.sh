#!/bin/bash

# Bitcoin Whale Tracker - Deployment Script
# This script guides you through deploying to Railway (backend) and Vercel (frontend)

set -e

echo "🚀 Bitcoin Whale Tracker - Deployment Script"
echo "=============================================="
echo ""

# Check if CLIs are installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ CLI tools ready"
echo ""

# Deploy Backend
echo "📦 Step 1: Deploy Backend to Railway"
echo "======================================"
cd backend

echo "Logging into Railway..."
railway login

echo ""
echo "Initializing Railway project..."
railway init

echo ""
echo "⚠️  IMPORTANT: Set up PostgreSQL database in Railway dashboard:"
echo "   1. Go to https://railway.app/dashboard"
echo "   2. Click your project"
echo "   3. Click 'New' → 'Database' → 'PostgreSQL'"
echo "   4. Railway will auto-generate DATABASE_URL"
echo ""
read -p "Press Enter after you've added PostgreSQL in Railway dashboard..."

echo ""
echo "Setting environment variables..."
echo "⚠️  You need to set these in Railway dashboard (Settings → Variables):"
echo ""
echo "Required:"
echo "  COINGECKO_API_KEY=CG-NTWoj1gDAAtBK9MFaLuG6o3Y"
echo "  FRED_API_KEY=13caddb0aaf6ac51471906e2e7a6cb9c"
echo "  GOOGLE_SERP_API_KEY=44dd2f39-30d5-44b5-b839-fa388a6185a7"
echo "  ALPHA_VANTAGE_KEY=demo"
echo "  PORT=4000"
echo "  NODE_ENV=production"
echo ""
echo "Optional (leave empty if not available):"
echo "  NEWS_API_KEY="
echo "  CRYPTOCOMPARE_API_KEY="
echo "  MESSARI_API_KEY="
echo "  GLASSNODE_API_KEY="
echo "  TWITTER_BEARER_TOKEN="
echo ""
read -p "Press Enter after you've set environment variables in Railway dashboard..."

echo ""
echo "Deploying backend to Railway..."
railway up

echo ""
echo "✅ Backend deployed!"
echo ""
BACKEND_URL=$(railway domain)
echo "📊 Backend URL: $BACKEND_URL"
echo ""

# Deploy Frontend
cd ..
echo ""
echo "🎨 Step 2: Deploy Frontend to Vercel"
echo "======================================"
cd frontend

# Create .env.production for frontend
echo "VITE_API_URL=$BACKEND_URL" > .env.production
echo "Created .env.production with backend URL"

echo ""
echo "Logging into Vercel..."
vercel login

echo ""
echo "Deploying frontend to Vercel..."
vercel --prod

echo ""
echo "✅ Frontend deployed!"
echo ""

FRONTEND_URL=$(vercel inspect --prod | grep "https://" | head -1)
echo "🌐 Frontend URL: $FRONTEND_URL"

# Update CORS settings
cd ../backend
echo ""
echo "⚠️  FINAL STEP: Update CORS in Railway:"
echo "   Add this environment variable in Railway dashboard:"
echo "   FRONTEND_URL=$FRONTEND_URL"
echo ""

cd ..

echo ""
echo "=============================================="
echo "🎉 Deployment Complete!"
echo "=============================================="
echo ""
echo "📊 Backend:  $BACKEND_URL"
echo "🌐 Frontend: $FRONTEND_URL"
echo ""
echo "Next steps:"
echo "1. Visit your frontend URL to test the app"
echo "2. Check Railway logs for backend: railway logs"
echo "3. Check Vercel logs in dashboard: https://vercel.com/dashboard"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
