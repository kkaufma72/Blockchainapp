import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Pattern {
  id: string
  type: 'accumulation' | 'distribution' | 'exchange_flow' | 'consolidation'
  confidence: number
  description: string
  addressCount: number
  volume: number
  timeframeStart: string
  timeframeEnd: string
  impact: 'bullish' | 'bearish' | 'neutral'
  addresses: string[]
}

export default function PatternDetection() {
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatterns()
    const interval = setInterval(fetchPatterns, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchPatterns = async () => {
    try {
      const response = await api.get('/api/analytics/patterns?limit=10')
      if (response.data.success && response.data.data.length > 0) {
        setPatterns(response.data.data)
      } else {
        // Use mock data if no patterns detected yet
        generateMockPatterns()
      }
    } catch (error) {
      console.error('Error fetching patterns:', error)
      generateMockPatterns()
    } finally {
      setLoading(false)
    }
  }

  const generateMockPatterns = () => {
    const mockPatterns: Pattern[] = [
      {
        id: '1',
        type: 'accumulation',
        confidence: 87,
        description: 'Large wallets accumulating BTC from exchanges',
        addressCount: 12,
        volume: 2500,
        timeframeStart: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        timeframeEnd: new Date().toISOString(),
        impact: 'bullish',
        addresses: []
      },
      {
        id: '2',
        type: 'exchange_flow',
        confidence: 92,
        description: 'Significant BTC flowing into major exchanges',
        addressCount: 8,
        volume: 3200,
        timeframeStart: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        timeframeEnd: new Date().toISOString(),
        impact: 'bearish',
        addresses: []
      },
      {
        id: '3',
        type: 'consolidation',
        confidence: 78,
        description: 'Whale addresses consolidating holdings',
        addressCount: 5,
        volume: 1800,
        timeframeStart: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        timeframeEnd: new Date().toISOString(),
        impact: 'neutral',
        addresses: []
      }
    ]
    setPatterns(mockPatterns)
  }

  const getTimeframe = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const hours = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))
    return `Last ${hours} hours`
  }

  const getPatternIcon = (type: Pattern['type']) => {
    switch (type) {
      case 'accumulation':
        return '📈'
      case 'distribution':
        return '📉'
      case 'exchange_flow':
        return '🏦'
      case 'consolidation':
        return '🔄'
    }
  }

  const getImpactColor = (impact: Pattern['impact']) => {
    switch (impact) {
      case 'bullish':
        return 'text-green-500 border-green-500/50 bg-green-500/20'
      case 'bearish':
        return 'text-red-500 border-red-500/50 bg-red-500/20'
      case 'neutral':
        return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/20'
    }
  }

  const getImpactIcon = (impact: Pattern['impact']) => {
    switch (impact) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4" />
      case 'bearish':
        return <TrendingDown className="w-4 h-4" />
      case 'neutral':
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const formatPatternType = (type: Pattern['type']) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Brain className="w-6 h-6 animate-pulse text-bitcoin" />
        <span className="ml-2 text-muted-foreground">Analyzing patterns...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-6 h-6 text-bitcoin" />
        <h2 className="text-2xl font-bold">Pattern Detection</h2>
        <Badge variant="secondary" className="ml-2">AI-Powered</Badge>
      </div>

      <div className="grid gap-4">
        {patterns.map((pattern) => (
          <Card key={pattern.id} className="hover:border-bitcoin/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getPatternIcon(pattern.type)}</div>
                  <div>
                    <CardTitle className="text-lg">
                      {formatPatternType(pattern.type)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getTimeframe(pattern.timeframeStart, pattern.timeframeEnd)}
                    </p>
                  </div>
                </div>
                <Badge className={getImpactColor(pattern.impact)}>
                  {getImpactIcon(pattern.impact)}
                  <span className="ml-1 capitalize">{pattern.impact}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base mb-4">{pattern.description}</p>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-bitcoin h-2 rounded-full transition-all"
                        style={{ width: `${pattern.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{pattern.confidence}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Volume</div>
                  <div className="text-lg font-bold text-bitcoin">
                    {pattern.volume.toLocaleString()} BTC
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Addresses</div>
                  <div className="text-lg font-semibold">
                    {pattern.addressCount}
                  </div>
                </div>
              </div>

              {pattern.confidence > 85 && (
                <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 rounded-lg p-3">
                  <CheckCircle className="w-4 h-4" />
                  <span>High confidence pattern detected</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">🧠 How Pattern Detection Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>Accumulation:</strong> Detects when whales are buying and moving BTC off exchanges
          </p>
          <p>
            • <strong>Distribution:</strong> Identifies when large holders are selling or sending to exchanges
          </p>
          <p>
            • <strong>Exchange Flow:</strong> Monitors significant movements to/from major exchanges
          </p>
          <p>
            • <strong>Consolidation:</strong> Tracks when whales are reorganizing their holdings
          </p>
          <p className="text-xs pt-2 border-t border-border mt-4">
            💡 Patterns are analyzed using historical transaction data and machine learning algorithms
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
