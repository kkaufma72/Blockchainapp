import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { TrendingUp, TrendingDown, Minus, Brain, AlertTriangle, Target, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface PredictionData {
  recommendation: 'buy' | 'sell' | 'short' | 'hold'
  confidence: number
  predictedPrice: number
  currentPrice: number
  strength: number
  timeframe: string
  riskLevel: 'low' | 'medium' | 'high'
  factors: {
    name: string
    impact: number
    description: string
  }[]
  entryPrice?: number
  stopLoss?: number
  takeProfit?: number
  reasoning: string
}

export default function PredictionEngine() {
  const [prediction, setPrediction] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h')

  useEffect(() => {
    fetchPrediction()
  }, [timeframe])

  const fetchPrediction = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/predictions/current?timeframe=${timeframe}`)
      if (response.data.success) {
        setPrediction(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching prediction:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'buy':
        return 'text-green-500 border-green-500/50 bg-green-500/20'
      case 'sell':
        return 'text-orange-500 border-orange-500/50 bg-orange-500/20'
      case 'short':
        return 'text-red-500 border-red-500/50 bg-red-500/20'
      default:
        return 'text-blue-500 border-blue-500/50 bg-blue-500/20'
    }
  }

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'buy':
        return <TrendingUp className="w-6 h-6" />
      case 'sell':
      case 'short':
        return <TrendingDown className="w-6 h-6" />
      default:
        return <Minus className="w-6 h-6" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-500 bg-green-500/20'
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/20'
      case 'high':
        return 'text-red-500 bg-red-500/20'
      default:
        return 'text-gray-500 bg-gray-500/20'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Brain className="w-6 h-6 animate-pulse text-bitcoin" />
        <span className="ml-2 text-muted-foreground">Analyzing market conditions...</span>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Unable to generate prediction. Please try again.</p>
        <Button onClick={fetchPrediction} className="mt-4 bg-bitcoin hover:bg-bitcoin/90">
          Retry
        </Button>
      </div>
    )
  }

  const priceChange = ((prediction.predictedPrice - prediction.currentPrice) / prediction.currentPrice) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-bitcoin" />
          <h2 className="text-2xl font-bold">AI Prediction Engine</h2>
          <Badge variant="secondary" className="ml-2">Multi-Factor Analysis</Badge>
        </div>
        <div className="flex gap-2">
          {(['1h', '24h', '7d', '30d'] as const).map((tf) => (
            <Button
              key={tf}
              size="sm"
              variant={timeframe === tf ? 'default' : 'outline'}
              onClick={() => setTimeframe(tf)}
              className={timeframe === tf ? 'bg-bitcoin hover:bg-bitcoin/90' : ''}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Prediction Card */}
      <Card className={`border-2 ${getRecommendationColor(prediction.recommendation)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`text-4xl ${getRecommendationColor(prediction.recommendation)}`}>
                {getRecommendationIcon(prediction.recommendation)}
              </div>
              <div>
                <CardTitle className="text-3xl uppercase">
                  {prediction.recommendation}
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Timeframe: {prediction.timeframe}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Confidence</div>
              <div className="text-3xl font-bold text-bitcoin">
                {prediction.confidence.toFixed(0)}%
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getRiskColor(prediction.riskLevel)}>
                  <Shield className="w-3 h-3 mr-1" />
                  {prediction.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Current Price</div>
              <div className="text-2xl font-bold">
                {formatPrice(prediction.currentPrice)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Predicted Price</div>
              <div className={`text-2xl font-bold ${priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPrice(prediction.predictedPrice)}
                <span className="text-sm ml-2">
                  ({priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Signal Strength</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-3">
                  <div
                    className="bg-bitcoin h-3 rounded-full transition-all"
                    style={{ width: `${(prediction.strength / 10) * 100}%` }}
                  />
                </div>
                <span className="text-lg font-semibold">{prediction.strength.toFixed(1)}/10</span>
              </div>
            </div>
          </div>

          {/* Trade Setup */}
          {(prediction.recommendation === 'buy' || prediction.recommendation === 'sell' || prediction.recommendation === 'short') && (
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-bitcoin" />
                <h3 className="font-semibold">Suggested Trade Setup</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Entry Price</div>
                  <div className="font-semibold">{formatPrice(prediction.entryPrice || prediction.currentPrice)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Stop Loss</div>
                  <div className="font-semibold text-red-500">{formatPrice(prediction.stopLoss || 0)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Take Profit</div>
                  <div className="font-semibold text-green-500">{formatPrice(prediction.takeProfit || 0)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Reasoning */}
          <div className="bg-bitcoin/10 border border-bitcoin/30 rounded-lg p-4">
            <p className="text-sm leading-relaxed">{prediction.reasoning}</p>
          </div>
        </CardContent>
      </Card>

      {/* Contributing Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Contributing Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prediction.factors
              .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
              .map((factor, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                  <div className={`text-2xl ${factor.impact > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {factor.impact > 0 ? '↗' : '↘'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{factor.name}</h4>
                      <Badge variant={factor.impact > 0 ? 'default' : 'destructive'} className="text-xs">
                        Impact: {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{factor.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Disclaimer:</strong> This prediction is generated using AI analysis of multiple market indicators including technical analysis, whale activity, macro correlations, and geopolitical events. Past performance does not guarantee future results. This is not financial advice. Always do your own research and never invest more than you can afford to lose.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
