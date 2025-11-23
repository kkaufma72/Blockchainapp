import { Bitcoin, Activity, Users, BarChart3, Trophy, TrendingUp, Bell, Brain, Sparkles, Radio, Building2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import WhaleTransactions from './components/WhaleTransactions'
import TrackedAddresses from './components/TrackedAddresses'
import Stats from './components/Stats'
import WhaleLeaderboard from './components/WhaleLeaderboard'
import TransactionFlow from './components/TransactionFlow'
import AlertSettings from './components/AlertSettings'
import PatternDetection from './components/PatternDetection'
import PredictionEngine from './components/PredictionEngine'
import PredictionComparison from './components/PredictionComparison'
import RealTimePriceTicker from './components/RealTimePriceTicker'
import { CorporateTreasuryDashboard } from './components/CorporateTreasuryDashboard'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-8 pb-6 border-b-2 border-bitcoin">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <div className="flex items-center justify-center gap-3">
              <Bitcoin className="w-10 h-10 text-bitcoin" />
              <h1 className="text-4xl font-bold text-bitcoin">Bitcoin Whale Tracker</h1>
            </div>
            <div className="flex-1" />
          </div>
          <p className="text-muted-foreground text-lg mb-4">
            Monitor large Bitcoin transactions and whale movements
          </p>
          {/* Real-Time Price Ticker */}
          <RealTimePriceTicker />
        </header>

        {/* Tabs Navigation */}
        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="grid w-full grid-cols-10 lg:w-full lg:max-w-6xl mx-auto">
            <TabsTrigger value="live" className="flex items-center gap-1 text-xs lg:text-sm">
              <Radio className="w-4 h-4" />
              <span className="hidden lg:inline">Live Chart</span>
              <span className="lg:hidden">Live</span>
            </TabsTrigger>
            <TabsTrigger value="treasury" className="flex items-center gap-1 text-xs lg:text-sm">
              <Building2 className="w-4 h-4" />
              <span className="hidden lg:inline">Treasury</span>
              <span className="lg:hidden">Corp</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-1 text-xs lg:text-sm">
              <Sparkles className="w-4 h-4" />
              <span className="hidden lg:inline">Predictions</span>
              <span className="lg:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-1 text-xs lg:text-sm">
              <Activity className="w-4 h-4" />
              <span className="hidden lg:inline">Transactions</span>
              <span className="lg:hidden">Txns</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-1 text-xs lg:text-sm">
              <Trophy className="w-4 h-4" />
              <span className="hidden lg:inline">Leaderboard</span>
              <span className="lg:hidden">Top</span>
            </TabsTrigger>
            <TabsTrigger value="flow" className="flex items-center gap-1 text-xs lg:text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden lg:inline">Flow</span>
              <span className="lg:hidden">Flow</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-1 text-xs lg:text-sm">
              <Brain className="w-4 h-4" />
              <span className="hidden lg:inline">Patterns</span>
              <span className="lg:hidden">Pat</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1 text-xs lg:text-sm">
              <Bell className="w-4 h-4" />
              <span className="hidden lg:inline">Alerts</span>
              <span className="lg:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-1 text-xs lg:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden lg:inline">Addresses</span>
              <span className="lg:hidden">Addr</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1 text-xs lg:text-sm">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden lg:inline">Stats</span>
              <span className="lg:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            <PredictionComparison />
          </TabsContent>

          <TabsContent value="treasury" className="space-y-4">
            <CorporateTreasuryDashboard />
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <PredictionEngine />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <WhaleTransactions />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <WhaleLeaderboard />
          </TabsContent>

          <TabsContent value="flow" className="space-y-4">
            <TransactionFlow />
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <PatternDetection />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <AlertSettings />
          </TabsContent>

          <TabsContent value="addresses" className="space-y-4">
            <TrackedAddresses />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Stats />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
