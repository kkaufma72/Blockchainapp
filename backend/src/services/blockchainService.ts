import axios from 'axios';

const BLOCKCHAIN_API = 'https://blockchain.info';
const BLOCKCHAIR_API = 'https://api.blockchair.com/bitcoin';

export interface Transaction {
  hash: string;
  time: number;
  size: number;
  inputs: Array<{
    prev_out: {
      addr?: string;
      value: number;
    };
  }>;
  out: Array<{
    addr?: string;
    value: number;
  }>;
}

export interface Block {
  hash: string;
  height: number;
  time: number;
  tx: Transaction[];
}

export class BlockchainService {
  async getLatestBlock(): Promise<Block> {
    try {
      const response = await axios.get(`${BLOCKCHAIN_API}/latestblock`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest block:', error);
      throw error;
    }
  }

  async getBlock(blockHash: string): Promise<Block> {
    try {
      const response = await axios.get(`${BLOCKCHAIN_API}/rawblock/${blockHash}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching block:', error);
      throw error;
    }
  }

  async getTransaction(txHash: string): Promise<Transaction> {
    try {
      const response = await axios.get(`${BLOCKCHAIN_API}/rawtx/${txHash}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  async getUnconfirmedTransactions(): Promise<Transaction[]> {
    try {
      const response = await axios.get(`${BLOCKCHAIN_API}/unconfirmed-transactions?format=json`);
      return response.data.txs || [];
    } catch (error) {
      console.error('Error fetching unconfirmed transactions:', error);
      throw error;
    }
  }

  async getAddressInfo(address: string) {
    try {
      const response = await axios.get(`${BLOCKCHAIN_API}/rawaddr/${address}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching address info:', error);
      throw error;
    }
  }

  calculateTransactionValue(tx: Transaction): number {
    // Sum all outputs
    return tx.out.reduce((sum, output) => sum + output.value, 0);
  }

  btcFromSatoshi(satoshi: number): number {
    return satoshi / 100000000;
  }
}

export const blockchainService = new BlockchainService();
