import { blockchainService, Transaction } from './blockchainService';
import { priceService } from './priceService';

export interface WhaleTransaction {
  hash: string;
  time: number;
  btcAmount: number;
  usdAmount?: number;
  fromAddresses: string[];
  toAddresses: string[];
  type: 'large_transfer' | 'exchange_deposit' | 'exchange_withdrawal' | 'unknown';
}

export interface TrackedAddress {
  address: string;
  label: string;
  type: 'exchange' | 'whale' | 'public_figure' | 'institution';
  source?: string;
}

export class WhaleService {
  private whaleThreshold: number;
  private trackedAddresses: Map<string, TrackedAddress>;

  constructor() {
    this.whaleThreshold = parseFloat(process.env.WHALE_THRESHOLD || '100');
    this.trackedAddresses = new Map();
    this.initializeKnownAddresses();
  }

  private initializeKnownAddresses() {
    // Known public Bitcoin addresses (examples - these are publicly disclosed)
    const knownAddresses: TrackedAddress[] = [
      {
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        label: 'Genesis Block (Satoshi)',
        type: 'public_figure',
        source: 'Genesis block'
      },
      // Add more known public addresses here
      // Note: Only include addresses that are publicly disclosed
    ];

    knownAddresses.forEach(addr => {
      this.trackedAddresses.set(addr.address, addr);
    });
  }

  async getWhaleTransactions(limit: number = 50): Promise<WhaleTransaction[]> {
    try {
      const unconfirmedTxs = await blockchainService.getUnconfirmedTransactions();
      const whaleTxs: WhaleTransaction[] = [];
      
      // Get current BTC price
      let btcPrice = 0;
      try {
        btcPrice = await priceService.getBTCPrice();
      } catch (error) {
        console.error('Could not fetch BTC price, continuing without USD values');
      }

      for (const tx of unconfirmedTxs.slice(0, limit)) {
        const btcAmount = blockchainService.btcFromSatoshi(
          blockchainService.calculateTransactionValue(tx)
        );

        if (btcAmount >= this.whaleThreshold) {
          const fromAddresses = tx.inputs
            .map(input => input.prev_out?.addr)
            .filter((addr): addr is string => !!addr);

          const toAddresses = tx.out
            .map(output => output.addr)
            .filter((addr): addr is string => !!addr);

          whaleTxs.push({
            hash: tx.hash,
            time: tx.time,
            btcAmount,
            usdAmount: btcPrice > 0 ? priceService.btcToUSD(btcAmount, btcPrice) : undefined,
            fromAddresses,
            toAddresses,
            type: this.classifyTransaction(fromAddresses, toAddresses)
          });
        }
      }

      return whaleTxs;
    } catch (error) {
      console.error('Error getting whale transactions:', error);
      throw error;
    }
  }

  private classifyTransaction(
    fromAddresses: string[],
    toAddresses: string[]
  ): WhaleTransaction['type'] {
    const fromKnown = fromAddresses.some(addr => this.trackedAddresses.has(addr));
    const toKnown = toAddresses.some(addr => this.trackedAddresses.has(addr));

    if (fromKnown && !toKnown) {
      return 'exchange_withdrawal';
    } else if (!fromKnown && toKnown) {
      return 'exchange_deposit';
    } else if (fromKnown || toKnown) {
      return 'large_transfer';
    }

    return 'unknown';
  }

  getTrackedAddresses(): TrackedAddress[] {
    return Array.from(this.trackedAddresses.values());
  }

  addTrackedAddress(address: TrackedAddress) {
    this.trackedAddresses.set(address.address, address);
  }

  async monitorAddress(address: string) {
    try {
      const addressInfo = await blockchainService.getAddressInfo(address);
      return {
        address,
        balance: blockchainService.btcFromSatoshi(addressInfo.final_balance),
        totalReceived: blockchainService.btcFromSatoshi(addressInfo.total_received),
        totalSent: blockchainService.btcFromSatoshi(addressInfo.total_sent),
        txCount: addressInfo.n_tx
      };
    } catch (error) {
      console.error('Error monitoring address:', error);
      throw error;
    }
  }
}

export const whaleService = new WhaleService();
