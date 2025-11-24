import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Trophy, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface LeaderboardEntry {
  address: string
  label?: string
  totalVolume: number
  transactionCount: number
  rank: number
}

export default function WhaleLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/api/analytics/leaderboard?limit=10')
      if (response.data.success) {
        setLeaderboard(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`
  }

  const formatBTC = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-orange-600'
    return 'text-muted-foreground'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Trophy className="w-6 h-6 animate-pulse text-bitcoin" />
        <span className="ml-2 text-muted-foreground">Loading leaderboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-6 h-6 text-bitcoin" />
        <h2 className="text-2xl font-bold">Whale Leaderboard</h2>
        <Badge variant="secondary" className="ml-2">Top by Volume</Badge>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry) => (
          <Card key={entry.address} className="hover:border-bitcoin/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`text-3xl font-bold ${getRankColor(entry.rank)} min-w-[40px]`}>
                  #{entry.rank}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold mb-1">
                        {entry.label || 'Unknown Address'}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {formatAddress(entry.address)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <TrendingUp className="w-4 h-4" />
                        Total Volume
                      </div>
                      <div className="text-xl font-bold text-bitcoin">
                        {formatBTC(entry.totalVolume)} BTC
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Wallet className="w-4 h-4" />
                        Transactions
                      </div>
                      <div className="text-xl font-semibold">
                        {entry.transactionCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            💡 Leaderboard tracks historical transaction volumes. Connect a database to enable full tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
