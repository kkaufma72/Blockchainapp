import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PriceData {
  price: number
  change24h: number
}

export default function BTCPrice() {
  const [priceData, setPriceData] = useState<PriceData | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await api.get('/api/price/current')
        setPriceData(response.data)
      } catch (error) {
        console.error('Failed to fetch BTC price:', error)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  if (!priceData) return null

  const isPositive = priceData.change24h >= 0
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">BTC:</span>
      <span className="font-semibold">{formatPrice(priceData.price)}</span>
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span className="text-xs">{Math.abs(priceData.change24h).toFixed(2)}%</span>
      </div>
    </div>
  )
}
