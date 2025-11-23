import { Router } from 'express';
import { priceService } from '../services/priceService';

export const priceRouter = Router();

priceRouter.get('/current', async (req, res) => {
  try {
    const priceData = await priceService.getPriceData();
    res.json(priceData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BTC price' });
  }
});

priceRouter.get('/btc-usd/:amount', async (req, res) => {
  try {
    const btcAmount = parseFloat(req.params.amount);
    if (isNaN(btcAmount)) {
      return res.status(400).json({ error: 'Invalid BTC amount' });
    }

    const price = await priceService.getBTCPrice();
    const usdValue = priceService.btcToUSD(btcAmount, price);

    res.json({
      btc: btcAmount,
      usd: usdValue,
      price
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to convert BTC to USD' });
  }
});
