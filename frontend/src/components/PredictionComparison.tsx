import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react'
import { usePriceHistory, usePredictions } from '../hooks/useWebSocket'

interface ComparisonDataPoint {
  timestamp: string
  predictedPrice: number
  actualPrice: number
  currentPrice: number
  confidence: number
  recommendation: string
  error: number | null
}

const PredictionComparison: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'1h' | '6h' | '24h' | '7d'>('24h')
  const [comparisonData, setComparisonData] = useState<ComparisonDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [accuracy, setAccuracy] = useState<number>(0)
  
  const { history: _priceHistory } = usePriceHistory(timeframe === '1h' ? 1 : timeframe === '6h' ? 6 : timeframe === '7d' ? 168 : 24)
  const { predictions: _predictions } = usePredictions()

  useEffect(() => {
    fetchComparisonData()
  }, [timeframe])

  const fetchComparisonData = async () => {
    setLoading(true)
    try {
      const hours = timeframe === '1h' ? 1 : timeframe === '6h' ? 6 : timeframe === '7d' ? 168 : 24
      const response = await fetch(`http://localhost:4000/api/predictions/comparison?hours=${hours}`)
      const data = await response.json()
      setComparisonData(data)
      
      // Calculate accuracy
      const validErrors = data.filter((d: ComparisonDataPoint) => d.error !== null)
      if (validErrors.length > 0) {
        const avgError = validErrors.reduce((sum: number, d: ComparisonDataPoint) => sum + (d.error || 0), 0) / validErrors.length
        setAccuracy(Math.max(0, 100 - avgError))
      }
    } catch (error) {
      console.error('Error fetching comparison data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatChartData = () => {
    if (comparisonData.length === 0) return []

    return comparisonData.map(point => ({
      time: new Date(point.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        ...(timeframe === '7d' && { month: 'short', day: 'numeric' })
      }),
      predicted: Math.round(point.predictedPrice),
      actual: Math.round(point.actualPrice),
      current: Math.round(point.currentPrice)
    }))
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const predicted = payload.find((p: any) => p.dataKey === 'predicted')?.value
      const actual = payload.find((p: any) => p.dataKey === 'actual')?.value
      const diff = actual && predicted ? ((actual - predicted) / predicted * 100) : 0

      return (
        <div className="bg-gray-900 border border-orange-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-orange-400 font-semibold">
              Predicted: ${predicted?.toLocaleString()}
            </p>
            <p className="text-blue-400 font-semibold">
              Actual: ${actual?.toLocaleString()}
            </p>
            {diff !== 0 && (
              <p className={`text-sm ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                Difference: {diff > 0 ? '+' : ''}{diff.toFixed(2)}%
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const chartData = formatChartData()
  const latestPoint = comparisonData[comparisonData.length - 1]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-orange-500" />
            Prediction vs Actual Price
          </h2>
          <p className="text-gray-400 mt-1">Real-time comparison of AI predictions against market reality</p>
        </div>
        <button
          onClick={fetchComparisonData}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {(['1h', '6h', '24h', '7d'] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeframe === tf
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tf.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Prediction Accuracy</span>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">{accuracy.toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">Average error rate</div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Data Points</span>
            <Activity className="text-blue-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">{comparisonData.length}</div>
          <div className="text-xs text-gray-500 mt-1">Predictions tracked</div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Latest Variance</span>
            {latestPoint && latestPoint.error ? (
              latestPoint.error < 2 ? (
                <TrendingUp className="text-green-500" size={20} />
              ) : (
                <TrendingDown className="text-red-500" size={20} />
              )
            ) : (
              <Activity className="text-gray-500" size={20} />
            )}
          </div>
          <div className="text-3xl font-bold text-white">
            {latestPoint?.error ? `${latestPoint.error.toFixed(2)}%` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 mt-1">Price prediction error</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p>No comparison data available yet</p>
              <p className="text-sm mt-2">Predictions will appear as they are generated</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={{ fill: '#f97316', r: 4 }}
                name="Predicted Price"
                animationDuration={500}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                name="Actual Price"
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-400">AI Predicted Price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-400">Market Actual Price</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Recent Predictions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Time</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Predicted</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Actual</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Error</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.slice(-10).reverse().map((point, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4 text-gray-300">
                    {new Date(point.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3 px-4 text-right text-orange-400 font-semibold">
                    ${point.predictedPrice.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-blue-400 font-semibold">
                    ${point.actualPrice.toLocaleString()}
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold ${
                    point.error && point.error < 2 ? 'text-green-400' : 
                    point.error && point.error < 5 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {point.error ? `${point.error.toFixed(2)}%` : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      point.confidence > 80 ? 'bg-green-500/20 text-green-400' :
                      point.confidence > 60 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {point.confidence.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PredictionComparison
