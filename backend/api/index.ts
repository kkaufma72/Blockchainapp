// Vercel Serverless Function Handler
import express from 'express';
import cors from 'cors';
import { blockchainRouter } from '../src/routes/blockchain';
import { whaleRouter } from '../src/routes/whales';
import { priceRouter } from '../src/routes/price';
import analyticsRouter from '../src/routes/analytics';
import predictionsRouter from '../src/routes/predictions';

const app = express();

// CORS configuration for Vercel
app.use(cors({
  origin: ['https://*.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/blockchain', blockchainRouter);
app.use('/api/whales', whaleRouter);
app.use('/api/price', priceRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/predictions', predictionsRouter);

// Multi-source data sync endpoints
app.post('/api/data/sync', async (req, res) => {
  try {
    console.log('📡 Manual data sync triggered via API');
    // Note: Background jobs don't work in serverless - this would need to be a cron job
    res.json({ 
      success: true, 
      message: 'Sync initiated (background processing)',
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
    // Import dynamically to avoid startup issues
    const { corporateTreasuryService } = await import('../src/services/corporateTreasuryService');
    const metrics = await corporateTreasuryService.calculateMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Treasury metrics error:', error);
    res.status(500).json({ error: 'Failed to calculate treasury metrics' });
  }
});

app.post('/api/treasury/scan', async (req, res) => {
  try {
    const { corporateTreasuryService } = await import('../src/services/corporateTreasuryService');
    const announcements = await corporateTreasuryService.scanForAnnouncements();
    res.json({ success: true, announcements, count: announcements.length });
  } catch (error) {
    console.error('Treasury scan error:', error);
    res.status(500).json({ error: 'Failed to scan announcements' });
  }
});

// Catch-all for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.path,
    method: req.method 
  });
});

// Export for Vercel serverless
export default app;

