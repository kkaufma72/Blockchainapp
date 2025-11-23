import cron from 'node-cron'
import { WhaleService } from './whaleService'
import { PriceService } from './priceService'
import databaseService from './databaseService'
import notificationService from './notificationService'
import predictionService from './predictionService'
import { multiSourceDataAggregator } from './multiSourceDataAggregator'
import { corporateTreasuryService } from './corporateTreasuryService'

class BackgroundJobService {
  private whaleService: WhaleService
  private priceService: PriceService
  private isRunning: boolean = false
  private dataAggregationRunning: boolean = false
  private treasuryScanRunning: boolean = false

  constructor() {
    this.whaleService = new WhaleService()
    this.priceService = new PriceService()
  }

  // Start all background jobs
  start() {
    console.log('🔄 Starting background jobs...')

    // Fetch and store whale transactions every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await this.fetchAndStoreWhaleTransactions()
    })

    // Run pattern detection every hour
    cron.schedule('0 * * * *', async () => {
      await this.detectPatterns()
    })

    // Check alerts every 2 minutes
    cron.schedule('*/2 * * * *', async () => {
      await this.checkAlerts()
    })

    // Generate predictions every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      await this.generatePredictions()
    })

    // Sync multi-source data every hour (TradFi, On-Chain, Sentiment, Macro, DeFi)
    cron.schedule('0 * * * *', async () => {
      await this.syncMultiSourceData()
    })

    // Scan for corporate treasury announcements every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      await this.scanTreasuryAnnouncements()
    })

    // Update corporate holdings weekly
    cron.schedule('0 9 * * MON', async () => {
      await this.updateTreasuryHoldings()
    })

    // Run immediate fetch on startup
    setTimeout(() => {
      this.fetchAndStoreWhaleTransactions()
      this.generatePredictions()
      this.syncMultiSourceData() // Initial data sync
      this.scanTreasuryAnnouncements() // Initial treasury scan
    }, 5000)

    console.log('✅ Background jobs started successfully')
  }

  // Sync multi-source data aggregator
  private async syncMultiSourceData() {
    if (this.dataAggregationRunning) {
      console.log('⏭️  Skipping data aggregation - previous job still running')
      return
    }

    try {
      this.dataAggregationRunning = true
      console.log('🌍 Starting multi-source data aggregation...')
      
      await multiSourceDataAggregator.syncAllSources()
      
      console.log('✅ Multi-source data sync completed')
    } catch (error) {
      console.error('❌ Error syncing multi-source data:', error)
    } finally {
      this.dataAggregationRunning = false
    }
  }

  // Scan for treasury announcements
  private async scanTreasuryAnnouncements() {
    if (this.treasuryScanRunning) {
      console.log('⏭️  Skipping treasury scan - previous job still running')
      return
    }

    try {
      this.treasuryScanRunning = true
      console.log('🏛️  Scanning for corporate treasury announcements...')
      
      const announcements = await corporateTreasuryService.scanForAnnouncements()
      console.log(`✅ Found ${announcements.length} treasury announcements`)
    } catch (error) {
      console.error('❌ Error scanning treasury announcements:', error)
    } finally {
      this.treasuryScanRunning = false
    }
  }

  // Update corporate holdings
  private async updateTreasuryHoldings() {
    try {
      console.log('🏛️  Updating corporate treasury holdings...')
      await corporateTreasuryService.updateAllHoldings()
      console.log('✅ Treasury holdings updated')
    } catch (error) {
      console.error('❌ Error updating treasury holdings:', error)
    }
  }

  // Fetch and store whale transactions
  private async fetchAndStoreWhaleTransactions() {
    if (this.isRunning) {
      console.log('⏭️  Skipping whale fetch - previous job still running')
      return
    }

    try {
      this.isRunning = true
      console.log('🔍 Fetching whale transactions...')

      const transactions = await this.whaleService.getWhaleTransactions(20)
      const btcPrice = await this.priceService.getBTCPrice()

      let stored = 0
      for (const tx of transactions) {
        try {
          await databaseService.storeWhaleTransaction({
            hash: tx.hash,
            timestamp: new Date(tx.time * 1000),
            fromAddress: tx.fromAddresses[0],
            toAddress: tx.toAddresses[0],
            value: tx.btcAmount,
            usdValue: tx.usdAmount || (btcPrice ? tx.btcAmount * btcPrice : undefined),
            classification: this.mapTransactionType(tx.type),
            confidence: 0.8
          })
          stored++
        } catch (error) {
          // Transaction might already exist, skip
        }
      }

      console.log(`✅ Stored ${stored} new whale transactions`)
    } catch (error) {
      console.error('❌ Error fetching whale transactions:', error)
    } finally {
      this.isRunning = false
    }
  }

  private mapTransactionType(type: string): string {
    switch (type) {
      case 'exchange_deposit':
        return 'Exchange Deposit'
      case 'exchange_withdrawal':
        return 'Exchange Withdrawal'
      case 'large_transfer':
        return 'Large Transfer'
      default:
        return 'Unknown'
    }
  }

  // Detect patterns in recent transactions
  private async detectPatterns() {
    try {
      console.log('🧠 Running pattern detection...')

      const transactions = await databaseService.getTransactionHistory(24)
      
      if (transactions.length === 0) {
        console.log('No transactions to analyze')
        return
      }

      // Detect accumulation pattern
      const exchangeWithdrawals = transactions.filter(tx => 
        tx.classification === 'Exchange Withdrawal'
      )

      if (exchangeWithdrawals.length >= 3) {
        const totalVolume = exchangeWithdrawals.reduce((sum, tx) => sum + tx.value, 0)
        const addresses = [...new Set(exchangeWithdrawals.map(tx => tx.toAddress).filter(Boolean))] as string[]

        if (totalVolume >= 500 && addresses.length >= 2) {
          const pattern = await databaseService.storePattern({
            type: 'accumulation',
            confidence: Math.min(95, 70 + (addresses.length * 5)),
            description: `${addresses.length} whales accumulated ${totalVolume.toFixed(2)} BTC from exchanges`,
            addressCount: addresses.length,
            volume: totalVolume,
            timeframeStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
            timeframeEnd: new Date(),
            impact: 'bullish',
            addresses: addresses
          })
          console.log('📈 Detected accumulation pattern')
          
          // Send notification if enabled
          if (process.env.ENABLE_EMAIL_ALERTS === 'true') {
            await notificationService.sendPatternAlert({
              type: 'accumulation',
              confidence: pattern.confidence,
              description: pattern.description,
              volume: pattern.volume,
              impact: pattern.impact
            })
          }
        }
      }

      // Detect distribution pattern
      const exchangeDeposits = transactions.filter(tx => 
        tx.classification === 'Exchange Deposit'
      )

      if (exchangeDeposits.length >= 3) {
        const totalVolume = exchangeDeposits.reduce((sum, tx) => sum + tx.value, 0)
        const addresses = [...new Set(exchangeDeposits.map(tx => tx.fromAddress).filter(Boolean))] as string[]

        if (totalVolume >= 500 && addresses.length >= 2) {
          await databaseService.storePattern({
            type: 'distribution',
            confidence: Math.min(95, 70 + (addresses.length * 5)),
            description: `${addresses.length} whales moved ${totalVolume.toFixed(2)} BTC to exchanges`,
            addressCount: addresses.length,
            volume: totalVolume,
            timeframeStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
            timeframeEnd: new Date(),
            impact: 'bearish',
            addresses: addresses
          })
          console.log('📉 Detected distribution pattern')
        }
      }

      // Detect consolidation pattern
      const largeTransfers = transactions.filter(tx => 
        tx.classification === 'Large Transfer' && tx.value >= 1000
      )

      if (largeTransfers.length >= 2) {
        const totalVolume = largeTransfers.reduce((sum, tx) => sum + tx.value, 0)
        const addresses = [...new Set([
          ...largeTransfers.map(tx => tx.fromAddress),
          ...largeTransfers.map(tx => tx.toAddress)
        ].filter(Boolean))] as string[]

        await databaseService.storePattern({
          type: 'consolidation',
          confidence: 78,
          description: `Whales consolidating ${totalVolume.toFixed(2)} BTC across ${addresses.length} addresses`,
          addressCount: addresses.length,
          volume: totalVolume,
          timeframeStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
          timeframeEnd: new Date(),
          impact: 'neutral',
          addresses: addresses
        })
        console.log('🔄 Detected consolidation pattern')
      }

      console.log('✅ Pattern detection completed')
    } catch (error) {
      console.error('❌ Error detecting patterns:', error)
    }
  }

  // Check if any alerts should be triggered
  private async checkAlerts() {
    try {
      const alerts = await databaseService.getActiveAlerts()
      const recentTransactions = await databaseService.getTransactionHistory(1)

      for (const alert of alerts) {
        for (const tx of recentTransactions) {
          let shouldTrigger = false
          let message = ''

          switch (alert.type) {
            case 'volume':
              if (tx.value >= alert.threshold) {
                shouldTrigger = true
                message = `Whale transaction of ${tx.value.toFixed(2)} BTC detected (threshold: ${alert.threshold})`
              }
              break

            case 'address':
              if (alert.targetAddress && 
                  (tx.fromAddress === alert.targetAddress || tx.toAddress === alert.targetAddress)) {
                shouldTrigger = true
                message = `Activity detected on tracked address ${alert.targetAddress}`
              }
              break

            case 'price':
              const currentPrice = await this.priceService.getBTCPrice()
              if (currentPrice && currentPrice >= alert.threshold) {
                shouldTrigger = true
                message = `BTC price reached ${currentPrice.toFixed(2)} USD (threshold: ${alert.threshold})`
              }
              break
          }

          if (shouldTrigger) {
            await databaseService.logAlert(alert.id, message, tx)
            console.log(`🔔 Alert triggered: ${message}`)
            
            // Send notification (email/push)
            if (alert.email) {
              await notificationService.sendWhaleAlert({
                hash: tx.hash,
                value: tx.value,
                usdValue: tx.usdValue || undefined,
                classification: tx.classification || undefined
              })
              console.log('📧 Email notification sent')
            }
            if (alert.push) {
              await notificationService.sendPushNotification(
                'Whale Alert',
                message,
                { transactionHash: tx.hash }
              )
              console.log('📱 Push notification sent')
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking alerts:', error)
    }
  }

  // Generate predictions
  private async generatePredictions() {
    try {
      console.log('🔮 Generating market predictions...')
      
      // Generate predictions for different timeframes
      const timeframes: ('24h' | '7d' | '30d')[] = ['24h', '7d', '30d']
      
      for (const timeframe of timeframes) {
        await predictionService.generatePrediction(timeframe)
      }
      
      console.log('✅ Predictions generated successfully')
    } catch (error) {
      console.error('❌ Error generating predictions:', error)
    }
  }
}

export default new BackgroundJobService()
