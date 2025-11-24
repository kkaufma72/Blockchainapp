import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { RefreshCw, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface WhaleTransaction {
  hash: string
  time: number
  btcAmount: number
  usdAmount?: number
  fromAddresses: string[]
  toAddresses: string[]
  type: string
}

export default function WhaleTransactions() {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchTransactions = async () => {
    try {
      setError(null)
      const response = await api.get('/api/whales/transactions?limit=20')
      setTransactions(response.data)
    } catch (err) {
      setError('Failed to fetch whale transactions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchTransactions, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`
  }

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { variant: 'success' | 'warning' | 'secondary' | 'default', label: string }> = {
      exchange_deposit: { variant: 'success', label: 'Exchange Deposit' },
      exchange_withdrawal: { variant: 'warning', label: 'Exchange Withdrawal' },
      large_transfer: { variant: 'secondary', label: 'Large Transfer' },
      unknown: { variant: 'default', label: 'Unknown' }
    }
    const badge = badges[type] || badges.unknown
    return <Badge variant={badge.variant}>{badge.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-bitcoin" />
        <span className="ml-2 text-muted-foreground">Loading whale transactions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recent Whale Transactions (≥100 BTC)</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-input"
            />
            <span className="text-muted-foreground">Auto-refresh (30s)</span>
          </label>
          <Button onClick={fetchTransactions} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">No whale transactions found at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <Card key={tx.hash} className="hover:border-bitcoin/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-2xl font-bold text-bitcoin">
                        {tx.btcAmount.toFixed(2)} BTC
                      </div>
                      {tx.usdAmount && (
                        <div className="text-sm text-muted-foreground mt-1">
                          ≈ {formatUSD(tx.usdAmount)}
                        </div>
                      )}
                    </div>
                    {getTypeBadge(tx.type)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatDate(tx.time)}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  <span className="font-mono">{formatAddress(tx.hash)}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2">FROM</div>
                    <div className="space-y-1">
                      {tx.fromAddresses.slice(0, 2).map((addr, i) => (
                        <div key={i} className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {formatAddress(addr)}
                        </div>
                      ))}
                      {tx.fromAddresses.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{tx.fromAddresses.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2">TO</div>
                    <div className="space-y-1">
                      {tx.toAddresses.slice(0, 2).map((addr, i) => (
                        <div key={i} className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {formatAddress(addr)}
                        </div>
                      ))}
                      {tx.toAddresses.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{tx.toAddresses.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
