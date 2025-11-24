import { useState, useEffect } from 'react'
import { Blocks, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Stats() {
  const [latestBlock, setLatestBlock] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setError(null)
      // Fetch real Bitcoin blockchain data from Blockchain.info public API
      const response = await fetch('https://blockchain.info/latestblock?cors=true')
      const data = await response.json()
      setLatestBlock(data)
    } catch (err) {
      setError('Failed to fetch blockchain stats')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Refresh every 2 minutes
    const interval = setInterval(fetchStats, 120000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Blocks className="w-6 h-6 animate-pulse text-bitcoin" />
        <span className="ml-2 text-muted-foreground">Loading statistics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Bitcoin Network Statistics</h2>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {latestBlock && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Blocks className="w-5 h-5 text-bitcoin" />
                Latest Block
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Block Height</div>
                  <div className="text-3xl font-bold text-bitcoin">
                    {latestBlock.height?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Block Time</div>
                  <div className="text-lg">
                    {latestBlock.time ? formatDate(latestBlock.time) : 'N/A'}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Block Hash</div>
                <code className="text-xs bg-muted px-3 py-2 rounded block break-all">
                  {latestBlock.hash || 'N/A'}
                </code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-bitcoin" />
                About This Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                This application monitors the Bitcoin blockchain for large transactions (≥100 BTC) 
                that may indicate whale activity. The tracker uses public blockchain data and 
                known public addresses to identify potential patterns.
              </p>
              <div className="bg-bitcoin/10 border border-bitcoin/30 rounded-lg p-4">
                <div className="font-semibold text-bitcoin mb-2">Note:</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Bitcoin addresses are pseudonymous. Address attribution is based on publicly 
                  disclosed information, exchange labels, and chain analysis patterns. This tool 
                  is for educational and analytical purposes only.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bitcoin mt-2" />
                  <span><strong>AI Prediction Engine:</strong> Multi-factor analysis using technical indicators, whale activity, S&P 500 correlations, geopolitical events, and macro indicators for buy/sell/short recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bitcoin mt-2" />
                  <span>Real-time monitoring of whale transactions (≥100 BTC)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bitcoin mt-2" />
                  <span>Live BTC price integration with 24h change tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bitcoin mt-2" />
                  <span>USD value conversion for all transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bitcoin mt-2" />
                  <span>Whale leaderboard by transaction volume</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bitcoin mt-2" />
                  <span>Interactive charts showing transaction flow and patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bitcoin mt-2" />
                  <span>AI-powered pattern detection (accumulation, distribution, consolidation)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bitcoin mt-2" />
                  <span>Historical data storage with SQLite/PostgreSQL</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bitcoin mt-2" />
                  <span>Customizable alerts for volume thresholds and address activity</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bitcoin mt-2" />
                  <span>Email notifications for whale activity and patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bitcoin mt-2" />
                  <span>Track known public addresses (exchanges, public figures)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bitcoin mt-2" />
                  <span>Auto-refresh with live blockchain updates</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
