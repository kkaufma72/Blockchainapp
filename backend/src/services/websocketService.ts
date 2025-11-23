import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { priceService } from './priceService'
import prisma from '../lib/prisma'

class WebSocketService {
  private io: SocketIOServer | null = null
  private priceUpdateInterval: NodeJS.Timeout | null = null
  private connectedClients = 0

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3004',
        methods: ['GET', 'POST']
      }
    })

    this.setupEventHandlers()
    this.startPriceStream()
    
    console.log('🔌 WebSocket server initialized')
  }

  private setupEventHandlers() {
    if (!this.io) return

    this.io.on('connection', (socket) => {
      this.connectedClients++
      console.log(`✅ Client connected (${this.connectedClients} total)`)

      // Send initial data
      this.sendCurrentPrice(socket.id)
      this.sendRecentPriceHistory(socket.id)
      this.sendLatestPredictions(socket.id)

      socket.on('subscribe:price', () => {
        socket.join('price-updates')
      })

      socket.on('subscribe:predictions', () => {
        socket.join('prediction-updates')
      })

      socket.on('subscribe:whales', () => {
        socket.join('whale-updates')
      })

      socket.on('request:price-history', async (data: { hours?: number }) => {
        await this.sendPriceHistory(socket.id, data.hours || 24)
      })

      socket.on('disconnect', () => {
        this.connectedClients--
        console.log(`❌ Client disconnected (${this.connectedClients} remaining)`)
      })
    })
  }

  private startPriceStream() {
    // Update price every 10 seconds
    this.priceUpdateInterval = setInterval(async () => {
      try {
        const priceData = await priceService.getPriceData()
        
        // Store in database
        await prisma.priceHistory.create({
          data: {
            price: priceData.price,
            timestamp: new Date()
          }
        })

        // Broadcast to all connected clients
        this.broadcast('price-updates', 'price:update', {
          price: priceData.price,
          change24h: priceData.change24h,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error updating price stream:', error)
      }
    }, 10000) // 10 seconds

    console.log('📊 Price stream started (10s interval)')
  }

  private async sendCurrentPrice(socketId: string) {
    try {
      const priceData = await priceService.getPriceData()
      this.emitToClient(socketId, 'price:current', {
        price: priceData.price,
        change24h: priceData.change24h,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error sending current price:', error)
    }
  }

  private async sendRecentPriceHistory(socketId: string, hours: number = 1) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000)
      
      const history = await prisma.priceHistory.findMany({
        where: {
          timestamp: { gte: since }
        },
        orderBy: { timestamp: 'asc' },
        take: 100
      })

      this.emitToClient(socketId, 'price:history', {
        data: history.map(h => ({
          timestamp: h.timestamp.toISOString(),
          price: h.price
        })),
        hours
      })
    } catch (error) {
      console.error('Error sending price history:', error)
    }
  }

  private async sendPriceHistory(socketId: string, hours: number = 24) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000)
      
      const history = await prisma.priceHistory.findMany({
        where: {
          timestamp: { gte: since }
        },
        orderBy: { timestamp: 'asc' }
      })

      this.emitToClient(socketId, 'price:history', {
        data: history.map(h => ({
          timestamp: h.timestamp.toISOString(),
          price: h.price
        })),
        hours
      })
    } catch (error) {
      console.error('Error sending price history:', error)
    }
  }

  private async sendLatestPredictions(socketId: string) {
    try {
      const predictions = await prisma.predictionModel.findMany({
        orderBy: { timestamp: 'desc' },
        take: 5
      })

      this.emitToClient(socketId, 'predictions:latest', {
        predictions: predictions.map(p => ({
          id: p.id,
          timestamp: p.timestamp.toISOString(),
          currentPrice: p.currentPrice,
          predictedPrice: p.predictedPrice,
          confidence: p.confidence,
          recommendation: p.recommendation,
          timeframe: p.timeframe
        }))
      })
    } catch (error) {
      console.error('Error sending predictions:', error)
    }
  }

  // Broadcast new whale transaction
  broadcastWhaleTransaction(transaction: any) {
    this.broadcast('whale-updates', 'whale:new', {
      hash: transaction.hash,
      value: transaction.value,
      usdValue: transaction.usdValue,
      fromAddress: transaction.fromAddress,
      toAddress: transaction.toAddress,
      timestamp: transaction.timestamp,
      classification: transaction.classification
    })
  }

  // Broadcast new prediction
  broadcastPrediction(prediction: any) {
    this.broadcast('prediction-updates', 'prediction:new', {
      id: prediction.id,
      timestamp: new Date().toISOString(),
      currentPrice: prediction.currentPrice,
      predictedPrice: prediction.predictedPrice,
      confidence: prediction.confidence,
      recommendation: prediction.recommendation,
      strength: prediction.strength,
      timeframe: prediction.timeframe,
      factors: JSON.parse(prediction.factors)
    })
  }

  // Broadcast pattern detection
  broadcastPattern(pattern: any) {
    this.broadcast('whale-updates', 'pattern:detected', {
      type: pattern.type,
      confidence: pattern.confidence,
      description: pattern.description,
      impact: pattern.impact,
      volume: pattern.volume,
      addressCount: pattern.addressCount
    })
  }

  // Helper methods
  private broadcast(room: string, event: string, data: any) {
    if (!this.io) return
    this.io.to(room).emit(event, data)
  }

  private emitToClient(socketId: string, event: string, data: any) {
    if (!this.io) return
    this.io.to(socketId).emit(event, data)
  }

  // Get prediction vs actual comparison data
  async getPredictionComparison(hours: number = 24) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000)
      
      // Get predictions from the time range
      const predictions = await prisma.predictionModel.findMany({
        where: {
          timestamp: { gte: since }
        },
        orderBy: { timestamp: 'asc' }
      })

      // Get actual prices from the same time range
      const actualPrices = await prisma.priceHistory.findMany({
        where: {
          timestamp: { gte: since }
        },
        orderBy: { timestamp: 'asc' }
      })

      // Match predictions with actual prices
      const comparison = predictions.map(pred => {
        // Find closest actual price after prediction timestamp
        const matchingPrice = actualPrices.find(price => 
          price.timestamp >= pred.timestamp
        )

        return {
          timestamp: pred.timestamp.toISOString(),
          predictedPrice: pred.predictedPrice,
          actualPrice: matchingPrice?.price || pred.currentPrice,
          currentPrice: pred.currentPrice,
          confidence: pred.confidence,
          recommendation: pred.recommendation,
          timeframe: pred.timeframe,
          error: matchingPrice ? 
            Math.abs(pred.predictedPrice - matchingPrice.price) / matchingPrice.price * 100 
            : null
        }
      })

      return comparison
    } catch (error) {
      console.error('Error getting prediction comparison:', error)
      return []
    }
  }

  stop() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval)
    }
    if (this.io) {
      this.io.close()
    }
    console.log('🔌 WebSocket server stopped')
  }
}

export const websocketService = new WebSocketService()
