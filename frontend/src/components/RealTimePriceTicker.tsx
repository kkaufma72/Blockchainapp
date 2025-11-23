import React, { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { usePriceUpdates } from '../hooks/useWebSocket'

const RealTimePriceTicker: React.FC = () => {
  const { price, isConnected } = usePriceUpdates()
  const [priceChange, setPriceChange] = useState<'up' | 'down' | 'neutral'>('neutral')
  const [previousPrice, setPreviousPrice] = useState<number | null>(null)

  useEffect(() => {
    if (price && previousPrice !== null) {
      if (price.price > previousPrice) {
        setPriceChange('up')
      } else if (price.price < previousPrice) {
        setPriceChange('down')
      } else {
        setPriceChange('neutral')
      }
      
      // Reset animation after 500ms
      const timer = setTimeout(() => setPriceChange('neutral'), 500)
      return () => clearTimeout(timer)
    }
    
    if (price) {
      setPreviousPrice(price.price)
    }
  }, [price])

  if (!price) {
    return (
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Activity className="animate-pulse" size={20} />
          <span>Connecting to live price feed...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 transition-all duration-300 ${
      priceChange === 'up' ? 'shadow-lg shadow-green-500/20 border-green-500/30' :
      priceChange === 'down' ? 'shadow-lg shadow-red-500/20 border-red-500/30' :
      'shadow-md'
    }`}>
      <div className="flex items-center justify-between">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-gray-400 text-sm">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>

        {/* Last Update */}
        <span className="text-gray-500 text-xs">
          {new Date(price.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {/* Price */}
        <div>
          <div className="text-gray-400 text-sm mb-1">Bitcoin Price</div>
          <div className={`text-4xl font-bold transition-colors duration-300 ${
            priceChange === 'up' ? 'text-green-400' :
            priceChange === 'down' ? 'text-red-400' :
            'text-white'
          }`}>
            ${price.price.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>

        {/* 24h Change */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          price.change24h >= 0 
            ? 'bg-green-500/10 text-green-400' 
            : 'bg-red-500/10 text-red-400'
        }`}>
          {price.change24h >= 0 ? (
            <TrendingUp size={24} />
          ) : (
            <TrendingDown size={24} />
          )}
          <div>
            <div className="text-xs opacity-75">24h Change</div>
            <div className="text-xl font-bold">
              {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Price Animation Indicator */}
      {priceChange !== 'neutral' && (
        <div className={`mt-3 flex items-center gap-2 text-sm ${
          priceChange === 'up' ? 'text-green-400' : 'text-red-400'
        }`}>
          {priceChange === 'up' ? '▲' : '▼'}
          <span className="animate-pulse">
            Price {priceChange === 'up' ? 'increased' : 'decreased'}
          </span>
        </div>
      )}
    </div>
  )
}

export default RealTimePriceTicker
