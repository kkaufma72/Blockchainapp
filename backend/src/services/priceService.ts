import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

interface PriceData {
  btc: {
    usd: number;
    usd_24h_change: number;
  };
}

export class PriceService {
  private cachedPrice: number | null = null;
  private lastFetch: number = 0;
  private cacheDuration = 60000; // 1 minute cache

  async getBTCPrice(): Promise<number> {
    const now = Date.now();
    
    // Return cached price if still valid
    if (this.cachedPrice && (now - this.lastFetch) < this.cacheDuration) {
      return this.cachedPrice;
    }

    try {
      const response = await axios.get(
        `${COINGECKO_API}/simple/price`,
        {
          params: {
            ids: 'bitcoin',
            vs_currencies: 'usd',
            include_24hr_change: true
          }
        }
      );

      this.cachedPrice = response.data.bitcoin.usd;
      this.lastFetch = now;
      return this.cachedPrice!;
    } catch (error) {
      console.error('Error fetching BTC price:', error);
      // Return cached price if available, otherwise throw
      if (this.cachedPrice) {
        return this.cachedPrice;
      }
      throw error;
    }
  }

  async getPriceData(): Promise<{ price: number; change24h: number }> {
    try {
      const headers: any = {}
      if (process.env.COINGECKO_API_KEY) {
        headers['x-cg-pro-api-key'] = process.env.COINGECKO_API_KEY
      }

      const response = await axios.get(
        `${COINGECKO_API}/simple/price`,
        {
          params: {
            ids: 'bitcoin',
            vs_currencies: 'usd',
            include_24hr_change: true
          },
          headers
        }
      );

      return {
        price: response.data.bitcoin.usd,
        change24h: response.data.bitcoin.usd_24h_change
      };
    } catch (error) {
      console.error('Error fetching price data:', error);
      throw error;
    }
  }

  btcToUSD(btcAmount: number, price: number): number {
    return btcAmount * price;
  }
}

export const priceService = new PriceService();
