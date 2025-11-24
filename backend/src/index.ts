import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { blockchainRouter } from './routes/blockchain';
import { whaleRouter } from './routes/whales';
import { priceRouter } from './routes/price';
import analyticsRouter from './routes/analytics';
import predictionsRouter from './routes/predictions';
import backgroundJobService from './services/backgroundJobService';
import { websocketService } from './services/websocketService';
import { multiSourceDataAggregator } from './services/multiSourceDataAggregator';
import { corporateTreasuryService } from './services/corporateTreasuryService';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3004',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/blockchain', blockchainRouter);
app.use('/api/whales', whaleRouter);
app.use('/api/price', priceRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/predictions', predictionsRouter);

// WebSocket comparison endpoint
app.get('/api/predictions/comparison', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const comparison = await websocketService.getPredictionComparison(hours);
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get prediction comparison' });
  }
});

// Multi-source data sync endpoints
app.post('/api/data/sync', async (req, res) => {
  try {
    console.log('📡 Manual data sync triggered via API');
    await multiSourceDataAggregator.syncAllSources();
    res.json({ 
      success: true, 
      message: 'Multi-source data sync completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API data sync error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Data sync failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/data/sources', (req, res) => {
  res.json({
    sources: [
      { name: 'CoinGecko', status: 'active', category: 'Price Data' },
      { name: 'Alpha Vantage', status: 'active', category: 'TradFi' },
      { name: 'FRED', status: process.env.FRED_API_KEY ? 'active' : 'pending', category: 'Macro' },
      { name: 'NewsAPI', status: process.env.NEWS_API_KEY ? 'active' : 'pending', category: 'Sentiment' },
      { name: 'CryptoCompare', status: process.env.CRYPTOCOMPARE_API_KEY ? 'active' : 'pending', category: 'Social' },
      { name: 'Messari', status: process.env.MESSARI_API_KEY ? 'active' : 'pending', category: 'On-Chain' },
      { name: 'Glassnode', status: process.env.GLASSNODE_API_KEY ? 'active' : 'pending', category: 'On-Chain' },
      { name: 'Blockchain.info', status: 'active', category: 'On-Chain' },
      { name: 'DefiLlama', status: 'active', category: 'DeFi' },
      { name: 'Alternative.me', status: 'active', category: 'Sentiment' },
      { name: 'GitHub', status: 'active', category: 'Developer Activity' }
    ],
    lastSync: new Date().toISOString(),
    totalSources: 11,
    activeSources: 6
  });
});

// Corporate treasury endpoints
app.get('/api/treasury/metrics', async (req, res) => {
  try {
    const metrics = await corporateTreasuryService.calculateMetrics()
    res.json(metrics)
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate treasury metrics' })
  }
})

app.post('/api/treasury/scan', async (req, res) => {
  try {
    const announcements = await corporateTreasuryService.scanForAnnouncements()
    res.json({ success: true, announcements, count: announcements.length })
  } catch (error) {
    res.status(500).json({ error: 'Failed to scan announcements' })
  }
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
});

httpServer.listen(PORT, '0.0.0.0' as any, () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  
  // Initialize WebSocket server
  websocketService.initialize(httpServer);
  
  // Start background jobs
  backgroundJobService.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  websocketService.stop();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
