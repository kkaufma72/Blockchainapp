import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000'

let socket: Socket | null = null

export interface PriceUpdate {
  price: number
  change24h: number
  timestamp: string
}

export interface PriceHistoryPoint {
  timestamp: string
  price: number
}

export interface WhaleTransaction {
  hash: string
  value: number
  usdValue: number
  fromAddress?: string
  toAddress?: string
  timestamp: string
  classification?: string
}

export interface Prediction {
  id: string
  timestamp: string
  currentPrice: number
  predictedPrice: number
  confidence: number
  recommendation: string
  strength: number
  timeframe: string
  factors?: any[]
}

// Initialize socket connection (singleton)
const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    socket.on('connect', () => {
      console.log('✅ WebSocket connected')
    })

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })
  }
  return socket
}

// Hook for real-time price updates
export const usePriceUpdates = () => {
  const [price, setPrice] = useState<PriceUpdate | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socket = getSocket()

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)
    
    const handlePriceUpdate = (data: PriceUpdate) => {
      setPrice(data)
    }

    const handleCurrentPrice = (data: PriceUpdate) => {
      setPrice(data)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('price:update', handlePriceUpdate)
    socket.on('price:current', handleCurrentPrice)

    // Subscribe to price updates
    socket.emit('subscribe:price')

    // Check initial connection state
    if (socket.connected) {
      setIsConnected(true)
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('price:update', handlePriceUpdate)
      socket.off('price:current', handleCurrentPrice)
    }
  }, [])

  return { price, isConnected }
}

// Hook for price history
export const usePriceHistory = (hours: number = 24) => {
  const [history, setHistory] = useState<PriceHistoryPoint[]>([])
  const [loading, setLoading] = useState(true)

  const requestHistory = useCallback((hours: number) => {
    const socket = getSocket()
    socket.emit('request:price-history', { hours })
  }, [])

  useEffect(() => {
    const socket = getSocket()

    const handleHistory = (data: { data: PriceHistoryPoint[]; hours: number }) => {
      setHistory(data.data)
      setLoading(false)
    }

    socket.on('price:history', handleHistory)
    requestHistory(hours)

    return () => {
      socket.off('price:history', handleHistory)
    }
  }, [hours, requestHistory])

  return { history, loading, refresh: () => requestHistory(hours) }
}

// Hook for whale transactions
export const useWhaleTransactions = () => {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([])

  useEffect(() => {
    const socket = getSocket()

    const handleNewWhale = (transaction: WhaleTransaction) => {
      setTransactions(prev => [transaction, ...prev].slice(0, 50)) // Keep last 50
    }

    socket.on('whale:new', handleNewWhale)
    socket.emit('subscribe:whales')

    return () => {
      socket.off('whale:new', handleNewWhale)
    }
  }, [])

  return { transactions }
}

// Hook for predictions
export const usePredictions = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [latestPrediction, setLatestPrediction] = useState<Prediction | null>(null)

  useEffect(() => {
    const socket = getSocket()

    const handleNewPrediction = (prediction: Prediction) => {
      setLatestPrediction(prediction)
      setPredictions(prev => [prediction, ...prev].slice(0, 20)) // Keep last 20
    }

    const handleLatestPredictions = (data: { predictions: Prediction[] }) => {
      setPredictions(data.predictions)
      if (data.predictions.length > 0) {
        setLatestPrediction(data.predictions[0])
      }
    }

    socket.on('prediction:new', handleNewPrediction)
    socket.on('predictions:latest', handleLatestPredictions)
    socket.emit('subscribe:predictions')

    return () => {
      socket.off('prediction:new', handleNewPrediction)
      socket.off('predictions:latest', handleLatestPredictions)
    }
  }, [])

  return { predictions, latestPrediction }
}

// Hook for patterns
export const usePatterns = () => {
  const [patterns, setPatterns] = useState<any[]>([])

  useEffect(() => {
    const socket = getSocket()

    const handlePattern = (pattern: any) => {
      setPatterns(prev => [pattern, ...prev].slice(0, 10))
    }

    socket.on('pattern:detected', handlePattern)
    socket.emit('subscribe:whales')

    return () => {
      socket.off('pattern:detected', handlePattern)
    }
  }, [])

  return { patterns }
}

// Cleanup function to disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
