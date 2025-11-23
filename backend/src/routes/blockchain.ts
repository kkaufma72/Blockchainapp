import { Router } from 'express';
import { blockchainService } from '../services/blockchainService';

export const blockchainRouter = Router();

blockchainRouter.get('/latest-block', async (req, res) => {
  try {
    const block = await blockchainService.getLatestBlock();
    res.json(block);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest block' });
  }
});

blockchainRouter.get('/block/:hash', async (req, res) => {
  try {
    const block = await blockchainService.getBlock(req.params.hash);
    res.json(block);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch block' });
  }
});

blockchainRouter.get('/transaction/:hash', async (req, res) => {
  try {
    const tx = await blockchainService.getTransaction(req.params.hash);
    res.json(tx);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

blockchainRouter.get('/unconfirmed', async (req, res) => {
  try {
    const txs = await blockchainService.getUnconfirmedTransactions();
    res.json(txs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unconfirmed transactions' });
  }
});

blockchainRouter.get('/address/:address', async (req, res) => {
  try {
    const addressInfo = await blockchainService.getAddressInfo(req.params.address);
    res.json(addressInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch address info' });
  }
});
