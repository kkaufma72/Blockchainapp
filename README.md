# 🐋 Bitcoin Whale Tracker

> **Real-time Bitcoin whale transaction monitoring, pattern detection, and predictive analytics platform**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://your-app.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with](https://img.shields.io/badge/Built%20with-TypeScript-3178c6)](https://www.typescriptlang.org/)
[![Deployed on](https://img.shields.io/badge/Deployed%20on-Vercel-000000)](https://vercel.com)

## 🌐 [Live Demo](https://your-app.vercel.app)

Track Bitcoin whale movements, detect patterns, and get AI-powered predictions in real-time.

---

## 📸 Screenshots

<!-- Add your screenshots here -->
![Dashboard](docs/screenshot-dashboard.png)
![Whale Leaderboard](docs/screenshot-leaderboard.png)
![Pattern Detection](docs/screenshot-patterns.png)

---

## ✨ Features

### 🔍 Real-Time Monitoring
- **Live whale transactions** - Track large Bitcoin movements as they happen
- **WebSocket updates** - Real-time price tickers and transaction feeds
- **Alert system** - Get notified of significant market movements

### 📊 Advanced Analytics
- **Pattern detection** - Identify accumulation, distribution, and market consolidation
- **Whale leaderboard** - Track top addresses by volume and activity
- **Transaction flow** - Visualize money movements across the network
- **Corporate treasury tracking** - Monitor institutional Bitcoin holdings

### 🤖 AI-Powered Predictions
- **ML price predictions** - Neural network-based Bitcoin price forecasting
- **Sentiment analysis** - Aggregate news and social media sentiment
- **Multi-source data** - Combine on-chain, macro, and social metrics
- **Accuracy tracking** - Historical prediction performance metrics

### 📈 Market Intelligence
- **Macro indicators** - Correlate Bitcoin with S&P 500, gold, DXY, oil
- **Geopolitical events** - Track major events affecting crypto markets
- **DeFi metrics** - Monitor total value locked and protocol activity
- **Developer activity** - Track Bitcoin GitHub commit trends

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **Recharts** - Beautiful data visualizations
- **Socket.io Client** - Real-time WebSocket connection
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **TypeScript** - End-to-end type safety
- **Prisma ORM** - Next-generation database toolkit
- **Socket.io** - WebSocket server
- **TensorFlow.js** - Machine learning predictions

### Database & Infrastructure
- **PostgreSQL** - Robust relational database
- **Vercel** - Deployment platform
- **Vercel Postgres** - Managed database
- **Bull** - Job queue for background tasks
- **Node-cron** - Scheduled data fetching

### External APIs & Data Sources
- **CoinGecko** - Cryptocurrency prices and market data
- **Blockchain.info** - On-chain transaction data
- **FRED** - Federal Reserve economic data
- **NewsAPI** - News sentiment analysis
- **CryptoCompare** - Social metrics
- **Alpha Vantage** - Traditional finance correlation
- **DefiLlama** - DeFi protocol metrics
- **Alternative.me** - Fear & Greed Index

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.18.1
- npm >= 10.8.0
- PostgreSQL database (local or cloud)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bitcoin-whale-tracker.git
cd bitcoin-whale-tracker

# Install all dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your database URL and API keys

# Run database migrations
cd backend
npx prisma migrate deploy
cd ..

# Start development servers
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## 📦 Deployment to Vercel

**Complete deployment guide:** [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/bitcoin-whale-tracker)

Or manually:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Deploy to production
vercel --prod
```

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV=production`
- `VITE_API_URL=/api`

---

## 🔑 API Keys

The app works with limited functionality out-of-the-box, but for full features, get these free API keys:

| Service | Purpose | Free Tier | Get Key |
|---------|---------|-----------|---------|
| **CoinGecko** | Price data | Demo API | [Sign up](https://www.coingecko.com/en/api) |
| **FRED** | Economic data | Unlimited | [Request](https://fred.stlouisfed.org/docs/api/api_key.html) |
| **NewsAPI** | News sentiment | 100 req/day | [Sign up](https://newsapi.org/) |
| **CryptoCompare** | Social metrics | Yes | [Sign up](https://www.cryptocompare.com/cryptopian/api-keys) |
| **Alpha Vantage** | TradFi data | 25 req/day | [Sign up](https://www.alphavantage.co/support/#api-key) |

Add them to your `.env` file or Vercel environment variables.

---

## 📁 Project Structure

```
bitcoin-whale-tracker/
├── backend/                  # Express API server
│   ├── src/
│   │   ├── index.ts         # Main server entry
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic
│   │   │   ├── whaleService.ts
│   │   │   ├── predictionService.ts
│   │   │   ├── mlTrainingService.ts
│   │   │   └── ...
│   │   └── lib/             # Shared utilities
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # DB migrations
│   └── package.json
├── frontend/                 # React application
│   ├── src/
│   │   ├── App.tsx          # Main app component
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities
│   └── package.json
├── vercel.json              # Vercel configuration
└── VERCEL_DEPLOYMENT.md     # Deployment guide
```

---

## 🎯 Key Features Explained

### Pattern Detection Algorithm

The app uses proprietary algorithms to detect whale behavior patterns:

```typescript
// Example: Accumulation Detection
- Monitors multiple addresses for coordinated buying
- Analyzes transaction timing and volume
- Calculates confidence scores based on historical patterns
- Identifies bullish/bearish implications
```

### ML Price Prediction

Uses TensorFlow.js for price forecasting:

- **Training Data**: Historical prices, whale activity, macro indicators, sentiment
- **Model**: Multi-layer neural network with LSTM layers
- **Output**: 1-hour, 24-hour, 7-day, and 30-day predictions
- **Accuracy Tracking**: Logs predictions vs actual prices

### Multi-Source Data Aggregation

Combines 11+ data sources for comprehensive analysis:

1. **On-Chain**: Blockchain.info, Glassnode (optional), Messari (optional)
2. **Price**: CoinGecko, CryptoCompare
3. **Macro**: FRED (economic indicators), Alpha Vantage (stocks)
4. **Sentiment**: NewsAPI, CryptoPanic, Alternative.me
5. **DeFi**: DefiLlama
6. **Development**: GitHub API

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Acknowledgments

- Built as a portfolio project to demonstrate full-stack development skills
- Inspired by the need for transparent whale activity monitoring
- Data provided by CoinGecko, Blockchain.info, FRED, and other amazing APIs

---

## 📧 Contact

**Your Name** - [@yourtwitter](https://twitter.com/yourtwitter) - your.email@example.com

**Project Link:** [https://github.com/yourusername/bitcoin-whale-tracker](https://github.com/yourusername/bitcoin-whale-tracker)

**Live Demo:** [https://your-app.vercel.app](https://your-app.vercel.app)

---

Made with ❤️ and ☕ | Deployed on Vercel

