import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Activity, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface VolumeData {
  time: string
  volume: number
  count: number
}

export default function TransactionFlow() {
  const [volumeData, setVolumeData] = useState<VolumeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAggregates()
    const interval = setInterval(fetchAggregates, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchAggregates = async () => {
    try {
      const response = await api.get('/api/analytics/aggregates?hours=24')
      if (response.data.success && response.data.data.length > 0) {
        setVolumeData(response.data.data)
      } else {
        // Use mock data if no real data yet
        generateMockData()
      }
    } catch (error) {
      console.error('Error fetching aggregates:', error)
      generateMockData()
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => {
    const now = Date.now()
    const mockData: VolumeData[] = Array.from({ length: 24 }, (_, i) => {
      const time = new Date(now - (23 - i) * 60 * 60 * 1000)
      return {
        time: time.toLocaleTimeString('en-US', { hour: '2-digit' }),
        volume: Math.random() * 5000 + 1000,
        count: Math.floor(Math.random() * 20) + 5
      }
    })
    setVolumeData(mockData)
  }

  const formatBTC = (value: number) => {
    return `${(value / 1000).toFixed(1)}k`
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold mb-1">{payload[0].payload.time}</p>
          <p className="text-sm text-bitcoin">
            Volume: {payload[0].value.toFixed(2)} BTC
          </p>
          {payload[0].payload.count && (
            <p className="text-sm text-muted-foreground">
              Transactions: {payload[0].payload.count}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Activity className="w-6 h-6 animate-pulse text-bitcoin" />
        <span className="ml-2 text-muted-foreground">Loading charts...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="w-6 h-6 text-bitcoin" />
        <h2 className="text-2xl font-bold">Transaction Flow</h2>
      </div>

      <Tabs defaultValue="volume" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="volume">Volume Chart</TabsTrigger>
          <TabsTrigger value="count">Transaction Count</TabsTrigger>
        </TabsList>

        <TabsContent value="volume" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-bitcoin" />
                Whale Transaction Volume (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f7931a" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f7931a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#888"
                    tick={{ fill: '#888', fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={formatBTC}
                    stroke="#888"
                    tick={{ fill: '#888', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#f7931a" 
                    fillOpacity={1} 
                    fill="url(#volumeGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="count" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-bitcoin" />
                Transaction Count (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#888"
                    tick={{ fill: '#888', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#888"
                    tick={{ fill: '#888', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#f7931a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            📊 Charts show simulated 24h data. Enable historical tracking to see real trends over time.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
