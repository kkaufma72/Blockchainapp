import React, { useEffect, useState } from 'react'
import { Building2, TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react'
import { API_URL } from '../lib/api'

interface TreasuryHolder {
  company: string
  btcHoldings: number
  ethHoldings: number
  marketValue: number
  percentOfTreasury?: number
  isLeveraged: boolean
  stockTicker?: string
}

interface TreasuryAnnouncement {
  company: string
  type: 'purchase' | 'sale' | 'report'
  amount: number
  timestamp: Date
  impact: number
}

interface TreasuryMetrics {
  totalBtcHoldings: number
  totalMarketValue: number
  supplyLockRatio: number
  weeklyChange: number
  monthlyChange: number
  leverageRisk: number
  concentrationRisk: number
  topHolders: TreasuryHolder[]
  recentAnnouncements: TreasuryAnnouncement[]
}

export const CorporateTreasuryDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<TreasuryMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/treasury/metrics`)
      if (!response.ok) throw new Error('Failed to fetch metrics')
      const data = await response.json()
      setMetrics(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000) // Every 5 minutes
    return () => clearInterval(interval)
  }, [])

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    )
  }

  if (error && !metrics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error: {error}</p>
        <button
          onClick={fetchMetrics}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Corporate Bitcoin Treasury</h2>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Holdings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Holdings</span>
            <Building2 className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics.totalBtcHoldings.toLocaleString()} BTC
          </div>
          <div className="text-sm text-gray-500 mt-1">
            ${(metrics.totalMarketValue / 1e9).toFixed(2)}B USD
          </div>
        </div>

        {/* Supply Lock */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Supply Locked</span>
            <AlertCircle className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics.supplyLockRatio.toFixed(2)}%
          </div>
          <div className="text-sm text-gray-500 mt-1">
            of circulating supply
          </div>
        </div>

        {/* Weekly Change */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">7D Change</span>
            {metrics.weeklyChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className={`text-2xl font-bold ${metrics.weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.weeklyChange >= 0 ? '+' : ''}{metrics.weeklyChange.toLocaleString()} BTC
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {metrics.weeklyChange >= 0 ? 'Accumulation' : 'Distribution'}
          </div>
        </div>

        {/* Monthly Change */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">30D Change</span>
            {metrics.monthlyChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className={`text-2xl font-bold ${metrics.monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.monthlyChange >= 0 ? '+' : ''}{metrics.monthlyChange.toLocaleString()} BTC
          </div>
          <div className="text-sm text-gray-500 mt-1">
            vs last month
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leverage Risk</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    metrics.leverageRisk > 50
                      ? 'bg-red-500'
                      : metrics.leverageRisk > 30
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(metrics.leverageRisk, 100)}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold text-gray-900">{metrics.leverageRisk.toFixed(1)}%</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {metrics.leverageRisk > 50 ? 'High leverage - liquidation risk' : 'Moderate leverage levels'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Concentration Risk</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    metrics.concentrationRisk > 70
                      ? 'bg-red-500'
                      : metrics.concentrationRisk > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(metrics.concentrationRisk, 100)}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold text-gray-900">{metrics.concentrationRisk.toFixed(1)}%</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Top 5 holders control {metrics.concentrationRisk.toFixed(0)}% of total
          </p>
        </div>
      </div>

      {/* Top Holders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Corporate Holders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Holdings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Treasury
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.topHolders.slice(0, 10).map((holder, index) => (
                <tr key={holder.company} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-semibold">
                        {index + 1}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{holder.company}</div>
                        {holder.stockTicker && (
                          <div className="text-sm text-gray-500">${holder.stockTicker}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {holder.btcHoldings.toLocaleString()} BTC
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${(holder.marketValue / 1e9).toFixed(2)}B
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {holder.percentOfTreasury?.toFixed(0) || 'N/A'}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {holder.isLeveraged ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Leveraged
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Cash
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Announcements */}
      {metrics.recentAnnouncements.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {metrics.recentAnnouncements.slice(0, 5).map((announcement, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {announcement.type === 'purchase' ? (
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                    ) : announcement.type === 'sale' ? (
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {announcement.company} {announcement.type === 'purchase' ? 'purchased' : announcement.type === 'sale' ? 'sold' : 'reported'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {announcement.amount > 0 ? `${announcement.amount.toLocaleString()} BTC` : 'Treasury update'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(announcement.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {announcement.impact !== 0 && (
                    <div className={`text-sm font-medium ${announcement.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {announcement.impact > 0 ? '+' : ''}{(announcement.impact * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
