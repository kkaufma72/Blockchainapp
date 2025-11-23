import prisma from '../lib/prisma'
import { WhaleService } from './whaleService'
import { PriceService } from './priceService'

interface StoredTransaction {
  hash: string
  timestamp: Date
  blockHeight?: number
  fromAddress?: string
  toAddress?: string
  value: number
  usdValue?: number
  classification?: string
  confidence?: number
}

export class DatabaseService {
  private whaleService: WhaleService
  private priceService: PriceService

  constructor() {
    this.whaleService = new WhaleService()
    this.priceService = new PriceService()
  }

  // Store a whale transaction
  async storeWhaleTransaction(tx: StoredTransaction) {
    try {
      // Check if transaction already exists
      const existing = await prisma.whaleTransaction.findUnique({
        where: { hash: tx.hash }
      })

      if (existing) {
        return existing
      }

      // Create new transaction
      const stored = await prisma.whaleTransaction.create({
        data: {
          hash: tx.hash,
          timestamp: tx.timestamp,
          blockHeight: tx.blockHeight,
          fromAddress: tx.fromAddress,
          toAddress: tx.toAddress,
          value: tx.value,
          usdValue: tx.usdValue,
          classification: tx.classification,
          confidence: tx.confidence,
          detected: true
        }
      })

      // Update whale stats for addresses involved
      if (tx.fromAddress) {
        await this.updateWhaleStats(tx.fromAddress, tx.value, tx.timestamp)
      }
      if (tx.toAddress) {
        await this.updateWhaleStats(tx.toAddress, tx.value, tx.timestamp)
      }

      return stored
    } catch (error) {
      console.error('Error storing whale transaction:', error)
      throw error
    }
  }

  // Update whale statistics
  async updateWhaleStats(address: string, volume: number, timestamp: Date) {
    try {
      const existing = await prisma.whaleStats.findUnique({
        where: { address }
      })

      if (existing) {
        await prisma.whaleStats.update({
          where: { address },
          data: {
            totalVolume: existing.totalVolume + volume,
            transactionCount: existing.transactionCount + 1,
            lastSeen: timestamp
          }
        })
      } else {
        await prisma.whaleStats.create({
          data: {
            address,
            totalVolume: volume,
            transactionCount: 1,
            firstSeen: timestamp,
            lastSeen: timestamp
          }
        })
      }
    } catch (error) {
      console.error('Error updating whale stats:', error)
    }
  }

  // Get whale leaderboard
  async getWhaleLeaderboard(limit: number = 10) {
    try {
      const whales = await prisma.whaleStats.findMany({
        orderBy: { totalVolume: 'desc' },
        take: limit
      })

      // Add rank
      return whales.map((whale, index) => ({
        ...whale,
        rank: index + 1
      }))
    } catch (error) {
      console.error('Error fetching whale leaderboard:', error)
      return []
    }
  }

  // Get historical transactions for charts
  async getTransactionHistory(hours: number = 24) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000)

      const transactions = await prisma.whaleTransaction.findMany({
        where: {
          timestamp: { gte: since }
        },
        orderBy: { timestamp: 'asc' }
      })

      return transactions
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      return []
    }
  }

  // Get hourly aggregates for charts
  async getHourlyAggregates(hours: number = 24) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000)
      
      const transactions = await prisma.whaleTransaction.findMany({
        where: {
          timestamp: { gte: since }
        },
        orderBy: { timestamp: 'asc' }
      })

      // Group by hour
      const hourlyData: { [key: string]: { volume: number; count: number } } = {}
      
      transactions.forEach(tx => {
        const hour = new Date(tx.timestamp)
        hour.setMinutes(0, 0, 0)
        const key = hour.toISOString()
        
        if (!hourlyData[key]) {
          hourlyData[key] = { volume: 0, count: 0 }
        }
        
        hourlyData[key].volume += tx.value
        hourlyData[key].count += 1
      })

      // Convert to array
      return Object.entries(hourlyData).map(([time, data]) => ({
        time: new Date(time).toLocaleTimeString('en-US', { hour: '2-digit' }),
        volume: data.volume,
        count: data.count
      }))
    } catch (error) {
      console.error('Error fetching hourly aggregates:', error)
      return []
    }
  }

  // Store detected pattern
  async storePattern(pattern: {
    type: string
    confidence: number
    description: string
    addressCount: number
    volume: number
    timeframeStart: Date
    timeframeEnd: Date
    impact: string
    addresses: string[]
    metadata?: any
  }) {
    try {
      return await prisma.detectedPattern.create({
        data: {
          type: pattern.type,
          confidence: pattern.confidence,
          description: pattern.description,
          addressCount: pattern.addressCount,
          volume: pattern.volume,
          timeframeStart: pattern.timeframeStart,
          timeframeEnd: pattern.timeframeEnd,
          impact: pattern.impact,
          addresses: pattern.addresses.join(','),
          metadata: pattern.metadata ? JSON.stringify(pattern.metadata) : null
        }
      })
    } catch (error) {
      console.error('Error storing pattern:', error)
      throw error
    }
  }

  // Get recent patterns
  async getRecentPatterns(limit: number = 10) {
    try {
      const patterns = await prisma.detectedPattern.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      return patterns.map(p => ({
        ...p,
        addresses: p.addresses.split(','),
        metadata: p.metadata ? JSON.parse(p.metadata) : null
      }))
    } catch (error) {
      console.error('Error fetching patterns:', error)
      return []
    }
  }

  // Create or update alert
  async upsertAlert(alert: {
    type: string
    condition: string
    threshold: number
    enabled: boolean
    email: boolean
    push: boolean
    targetAddress?: string
  }) {
    try {
      return await prisma.alert.create({
        data: alert
      })
    } catch (error) {
      console.error('Error creating alert:', error)
      throw error
    }
  }

  // Get active alerts
  async getActiveAlerts() {
    try {
      return await prisma.alert.findMany({
        where: { enabled: true }
      })
    } catch (error) {
      console.error('Error fetching alerts:', error)
      return []
    }
  }

  // Log alert trigger
  async logAlert(alertId: string, message: string, data?: any) {
    try {
      await prisma.alertLog.create({
        data: {
          alertId,
          message,
          data: data ? JSON.stringify(data) : null
        }
      })

      // Update alert trigger count
      await prisma.alert.update({
        where: { id: alertId },
        data: {
          lastTriggered: new Date(),
          triggerCount: { increment: 1 }
        }
      })
    } catch (error) {
      console.error('Error logging alert:', error)
    }
  }
}

export default new DatabaseService()
