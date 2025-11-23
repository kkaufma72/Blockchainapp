import { Router } from 'express';
import { whaleService } from '../services/whaleService';

export const whaleRouter = Router();

whaleRouter.get('/transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const whaleTxs = await whaleService.getWhaleTransactions(limit);
    res.json(whaleTxs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch whale transactions' });
  }
});

whaleRouter.get('/tracked-addresses', async (req, res) => {
  try {
    const addresses = whaleService.getTrackedAddresses();
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tracked addresses' });
  }
});

whaleRouter.post('/track-address', async (req, res) => {
  try {
    const { address, label, type, source } = req.body;
    
    if (!address || !label || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    whaleService.addTrackedAddress({ address, label, type, source });
    res.json({ success: true, message: 'Address added to tracking list' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add tracked address' });
  }
});

whaleRouter.get('/monitor/:address', async (req, res) => {
  try {
    const addressData = await whaleService.monitorAddress(req.params.address);
    res.json(addressData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to monitor address' });
  }
});
