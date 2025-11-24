# 🐋 Bitcoin Whale Tracker

> **Real-time cryptocurrency analytics platform for monitoring large Bitcoin transactions with ML-powered predictions and intelligent pattern detection**

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://frontend-oola794op-kyle-kaufmans-projects.vercel.app)
[![GitHub](https://img.shields.io/badge/github-repository-blue?style=for-the-badge&logo=github)](https://github.com/kkaufma72/Blockchainapp)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📸 Screenshots

*[Add your screenshots here]*

---

## 🌟 Features

### Real-Time Monitoring
- **Live Whale Transactions** - Track Bitcoin transfers over $100K as they happen
- **WebSocket Streaming** - Bidirectional real-time data communication
- **Price Ticker** - Live Bitcoin price updates from multiple sources

### AI & Machine Learning
- **Price Predictions** - TensorFlow.js models forecast future prices
- **Pattern Detection** - Identify accumulation, distribution, and consolidation patterns
- **Sentiment Analysis** - NLP processing of news and social media
- **Accuracy Tracking** - Historical performance metrics of predictions

### Advanced Analytics
- **Whale Leaderboard** - Top addresses ranked by volume and activity
- **Corporate Treasury** - Track institutional Bitcoin holdings (MicroStrategy, Tesla, etc.)
- **Transaction Flow** - Visualize money movement across the network
- **Multi-Source Data** - Aggregate from 11+ APIs for comprehensive analysis

### Data Visualization
- **Interactive Charts** - Recharts-powered visualizations
- **Pattern Detection Dashboard** - Real-time pattern identification
- **Geopolitical Events** - Correlation with major world events
- **Macro Indicators** - BTC vs S&P 500, Gold, DXY, Oil prices

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **Real-time:** Socket.io Client
- **HTTP Client:** Axios
- **State Management:** React Context API

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL 16
- **Real-time:** Socket.io Server
- **Job Scheduling:** node-cron
- **ML:** TensorFlow.js
- **NLP:** Natural, Compromise, Sentiment

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Frontend Deployment:** Vercel
- **Backend Deployment:** Fly.io (or Docker)
- **Database:** PostgreSQL (Docker/Fly.io)

### External APIs
- **CoinGecko** - Cryptocurrency prices
- **Blockchain.info** - On-chain data
- **FRED** - Economic indicators
- **NewsAPI** - News sentiment
- **CryptoCompare** - Social metrics
- **Alpha Vantage** - Traditional finance
- **DefiLlama** - DeFi metrics
- **Alternative.me** - Fear & Greed Index
- **GitHub API** - Developer activity
- **Messari** - Protocol data (optional)
- **Glassnode** - On-chain analytics (optional)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- Docker Desktop
- npm 10+

### Installation

```bash
# Clone repository
git clone https://github.com/kkaufma72/Blockchainapp.git
cd Blockchainapp-1

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start with Docker
docker-compose up -d

# Frontend (in new terminal)
cd frontend
npm run dev

# Visit: http://localhost:3000
```

### Environment Variables

```bash
# Backend (.env)
DATABASE_URL=postgresql://whale:whalepassword@localhost:5434/bitcoinwhale
PORT=3001
NODE_ENV=development

# Optional API Keys (for full features)
COINGECKO_API_KEY=your-key
FRED_API_KEY=your-key
NEWS_API_KEY=your-key
CRYPTOCOMPARE_API_KEY=your-key
ALPHA_VANTAGE_KEY=your-key
```

---

## 📊 Project Structure

```
Blockchainapp-1/
├── backend/
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── lib/             # Utilities
│   │   └── index.ts         # Server entry
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # DB migrations
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   └── App.tsx         # Main component
│   └── Dockerfile
└── docker-compose.yml       # Container orchestration
```

---

## 🎯 Key Features Explained

### 1. Real-Time Whale Detection

The system continuously monitors the Bitcoin blockchain and detects large transactions (whales):

```typescript
// Whale detection with pattern classification
interface WhaleTransaction {
  hash: string;
  value: number;
  usdValue: number;
  classification: 'deposit' | 'withdrawal' | 'transfer';
  confidence: number;
}
```

### 2. ML Price Predictions

TensorFlow.js models trained on:
- Historical price data
- Whale activity patterns
- Macro economic indicators
- Sentiment scores
- On-chain metrics

```typescript
// Multi-factor price prediction
const prediction = await predictionService.generatePrediction({
  currentPrice,
  whaleActivity,
  sentimentScore,
  macroIndicators,
  onChainData
});
```

### 3. Pattern Detection Algorithms

Identifies market patterns with confidence scoring:
- **Accumulation** - Large addresses buying
- **Distribution** - Whales selling
- **Consolidation** - Sideways movement
- **Exchange Flow** - Movement to/from exchanges

### 4. Multi-Source Data Aggregation

Combines data from multiple sources for robust analysis:
- **Price Data:** CoinGecko, CryptoCompare
- **On-Chain:** Blockchain.info, Glassnode, Messari
- **Macro:** FRED, Alpha Vantage
- **Sentiment:** NewsAPI, CryptoPanic, Alternative.me
- **DeFi:** DefiLlama
- **Development:** GitHub API

---

## 📈 Database Schema

15+ normalized tables including:
- `whale_transactions` - Large BTC transfers
- `whale_stats` - Aggregated address statistics
- `detected_patterns` - Market pattern records
- `predictions` - ML prediction history
- `prediction_accuracy` - Model performance tracking
- `sentiment_data` - News/social sentiment
- `macro_indicators` - Economic data
- `corporate_treasury` - Institutional holdings
- `price_history` - Historical price data
- `ml_models` - Model versioning

---

## 🔒 Security & Best Practices

- ✅ Environment variables for sensitive data
- ✅ TypeScript for type safety
- ✅ Prisma ORM for SQL injection prevention
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Error handling middleware
- ✅ Database connection pooling
- ✅ Rate limiting on external APIs

---

## 🚢 Deployment

### Docker Deployment (Recommended)

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Vercel (Frontend)

```bash
cd frontend
vercel --prod
```

### Fly.io (Backend)

```bash
cd backend
flyctl deploy
```

---

## 📚 API Documentation

### Health Check
```bash
GET /api/health
Response: { "status": "ok", "timestamp": "..." }
```

### Whale Transactions
```bash
GET /api/whales/transactions?limit=50
Response: [{ hash, value, timestamp, ... }]
```

### Price Prediction
```bash
GET /api/predictions/current
Response: { predictedPrice, confidence, factors, ... }
```

### Pattern Detection
```bash
GET /api/patterns?timeframe=24h
Response: [{ type, confidence, description, ... }]
```

---

## 🎓 What I Learned

### Technical Skills
- Building real-time applications with WebSockets
- Implementing machine learning models in production
- Orchestrating multiple microservices with Docker
- Complex database schema design with Prisma
- External API integration and rate limiting
- TypeScript across full stack
- Background job scheduling
- Data visualization techniques

### Soft Skills
- System architecture planning
- API documentation
- Project organization
- Code documentation
- Problem-solving complex integration issues

---

## 🔮 Future Enhancements

- [ ] User authentication and personalized watchlists
- [ ] Email/SMS alerts for whale activity
- [ ] Mobile app with React Native
- [ ] More sophisticated ML models
- [ ] GraphQL API for efficient data fetching
- [ ] Comprehensive test coverage (Jest, Cypress)
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Redis caching layer
- [ ] Elasticsearch for advanced queries

---

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

MIT License - feel free to use this project for learning purposes.

---

## 👤 Author

**Kyle Kaufman**

- Portfolio: [Your portfolio URL]
- LinkedIn: [Your LinkedIn]
- GitHub: [@kkaufma72](https://github.com/kkaufma72)
- Email: [Your email]

---

## 🙏 Acknowledgments

- CoinGecko for reliable cryptocurrency data
- Blockchain.info for on-chain data access
- FRED for economic indicators
- The open-source community for amazing tools

---

## 📊 Project Stats

![GitHub repo size](https://img.shields.io/github/repo-size/kkaufma72/Blockchainapp)
![GitHub language count](https://img.shields.io/github/languages/count/kkaufma72/Blockchainapp)
![GitHub top language](https://img.shields.io/github/languages/top/kkaufma72/Blockchainapp)

---

<p align="center">
  Made with ❤️ and ☕ by Kyle Kaufman
</p>

<p align="center">
  <sub>⭐ Star this repo if you found it helpful!</sub>
</p>

