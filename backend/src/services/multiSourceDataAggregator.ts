import axios from 'axios'
import prisma from '../lib/prisma'
import { subDays, subHours } from 'date-fns'
import Sentiment from 'sentiment'
// @ts-ignore - sentiment module lacks proper types

/**
 * Multi-Source Data Aggregator
 * Fetches data from ALL available sources that impact Bitcoin price
 */

const sentiment = new Sentiment()

interface AggregatedData {
  timestamp: Date
  btcPrice: number
  tradFi: TradFiMetrics
  onChain: OnChainMetrics
  sentiment: SentimentMetrics
  macro: MacroMetrics
  defi: DeFiMetrics
}

interface TradFiMetrics {
  sp500: number
  nasdaq: number
  dowJones: number
  goldPrice: number
  silverPrice: number
  dollarIndex: number
  oilPrice: number
  bondYield10Y: number
  vixIndex: number
}

interface OnChainMetrics {
  hashRate: number
  difficulty: number
  activeAddresses: number
  transactionCount: number
  averageFee: number
  mempoolSize: number
  exchangeNetflow: number
  whaleTransactions: number
  nvtRatio: number
  mvrv: number
}

interface SentimentMetrics {
  overallScore: number
  twitterMentions: number
  redditPosts: number
  newsVolume: number
  fearGreedIndex: number
  socialVolume: number
  developerActivity: number
}

interface MacroMetrics {
  inflationRate: number
  interestRate: number
  unemploymentRate: number
  gdpGrowth: number
  m2MoneySupply: number
  housingIndex: number
  consumerConfidence: number
  retailSales: number
}

interface DeFiMetrics {
  totalValueLocked: number
  dexVolume24h: number
  ethGasPrice: number
  stablecoinMarketCap: number
  btcDominance: number
  altcoinSeason: number
}

class MultiSourceDataAggregator {
  private readonly COINGECKO_KEY = process.env.COINGECKO_API_KEY
  private readonly ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY || 'demo'
  private readonly FRED_KEY = process.env.FRED_API_KEY
  private readonly NEWS_API_KEY = process.env.NEWS_API_KEY
  private readonly CRYPTOCOMPARE_KEY = process.env.CRYPTOCOMPARE_API_KEY
  private readonly MESSARI_KEY = process.env.MESSARI_API_KEY
  private readonly GLASSNODE_KEY = process.env.GLASSNODE_API_KEY
  private readonly TWITTER_TOKEN = process.env.TWITTER_BEARER_TOKEN
  private readonly GOOGLE_SERP_KEY = process.env.GOOGLE_SERP_API_KEY

  // ===========================================
  // TRADITIONAL FINANCE DATA
  // ===========================================

  async fetchTradFiMetrics(): Promise<TradFiMetrics> {
    console.log('📈 Fetching Traditional Finance data...')

    const [sp500, nasdaq, dowJones, gold, silver, dollar, oil, bonds, vix] = await Promise.allSettled([
      this.fetchAlphaVantage('SPY', 'S&P 500'),
      this.fetchAlphaVantage('QQQ', 'NASDAQ'),
      this.fetchAlphaVantage('DIA', 'Dow Jones'),
      this.fetchGoldPrice(),
      this.fetchSilverPrice(),
      this.fetchDollarIndex(),
      this.fetchOilPrice(),
      this.fetchBondYields(),
      this.fetchVIX()
    ])

    return {
      sp500: this.extractValue(sp500, 450),
      nasdaq: this.extractValue(nasdaq, 380),
      dowJones: this.extractValue(dowJones, 350),
      goldPrice: this.extractValue(gold, 2000),
      silverPrice: this.extractValue(silver, 25),
      dollarIndex: this.extractValue(dollar, 104),
      oilPrice: this.extractValue(oil, 75),
      bondYield10Y: this.extractValue(bonds, 4.5),
      vixIndex: this.extractValue(vix, 20)
    }
  }

  private async fetchAlphaVantage(symbol: string, name: string): Promise<number> {
    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: this.ALPHA_VANTAGE_KEY
        },
        timeout: 5000
      })

      const quote = response.data['Global Quote']
      if (quote && quote['05. price']) {
        const price = parseFloat(quote['05. price'])
        console.log(`  ✓ ${name}: $${price.toFixed(2)}`)
        return price
      }
      throw new Error('No data')
    } catch (error) {
      console.log(`  ✗ ${name}: Using fallback`)
      throw error
    }
  }

  private async fetchGoldPrice(): Promise<number> {
    try {
      // Using GLD ETF as proxy for gold
      return await this.fetchAlphaVantage('GLD', 'Gold')
    } catch {
      return 2050
    }
  }

  private async fetchSilverPrice(): Promise<number> {
    try {
      return await this.fetchAlphaVantage('SLV', 'Silver')
    } catch {
      return 24
    }
  }

  private async fetchDollarIndex(): Promise<number> {
    try {
      return await this.fetchAlphaVantage('UUP', 'Dollar Index')
    } catch {
      return 104.5
    }
  }

  private async fetchOilPrice(): Promise<number> {
    try {
      return await this.fetchAlphaVantage('USO', 'Oil')
    } catch {
      return 78
    }
  }

  private async fetchBondYields(): Promise<number> {
    try {
      if (this.FRED_KEY) {
        const response = await axios.get('https://api.stlouisfed.org/fred/series/observations', {
          params: {
            series_id: 'DGS10',
            api_key: this.FRED_KEY,
            limit: 1,
            sort_order: 'desc',
            file_type: 'json'
          }
        })
        const value = response.data.observations[0]?.value
        if (value) return parseFloat(value)
      }
      throw new Error('No FRED key')
    } catch {
      return 4.5
    }
  }

  private async fetchVIX(): Promise<number> {
    try {
      return await this.fetchAlphaVantage('VXX', 'VIX')
    } catch {
      return 18
    }
  }

  // ===========================================
  // ON-CHAIN METRICS
  // ===========================================

  async fetchOnChainMetrics(): Promise<OnChainMetrics> {
    console.log('⛓️  Fetching On-Chain data...')

    const [blockchain, glassnode, messari] = await Promise.allSettled([
      this.fetchBlockchainInfo(),
      this.fetchGlassnodeMetrics(),
      this.fetchMessariMetrics()
    ])

    const blockchainData = this.extractValue(blockchain, {})
    const glassnodeData = this.extractValue(glassnode, {})
    const messariData = this.extractValue(messari, {})

    return {
      hashRate: blockchainData.hashRate || 400e18,
      difficulty: blockchainData.difficulty || 60e12,
      activeAddresses: glassnodeData.activeAddresses || 900000,
      transactionCount: blockchainData.transactionCount || 250000,
      averageFee: blockchainData.averageFee || 2.5,
      mempoolSize: blockchainData.mempoolSize || 50,
      exchangeNetflow: glassnodeData.exchangeNetflow || 0,
      whaleTransactions: blockchainData.whaleTransactions || 50,
      nvtRatio: messariData.nvtRatio || 65,
      mvrv: glassnodeData.mvrv || 1.8
    }
  }

  private async fetchBlockchainInfo(): Promise<any> {
    try {
      const response = await axios.get('https://blockchain.info/stats', {
        params: { format: 'json' },
        timeout: 5000
      })

      console.log('  ✓ Blockchain.info data fetched')
      return {
        hashRate: response.data.hash_rate || 0,
        difficulty: response.data.difficulty || 0,
        transactionCount: response.data.n_tx || 0,
        mempoolSize: response.data.mempool_size || 0,
        averageFee: response.data.miners_revenue_btc / response.data.n_tx || 0
      }
    } catch (error) {
      console.log('  ✗ Blockchain.info: Using fallback')
      return {}
    }
  }

  private async fetchGlassnodeMetrics(): Promise<any> {
    if (!this.GLASSNODE_KEY) {
      console.log('  ✗ Glassnode: No API key')
      return {}
    }

    try {
      const [activeAddresses, exchangeNetflow, mvrv] = await Promise.all([
        axios.get('https://api.glassnode.com/v1/metrics/addresses/active_count', {
          params: { a: 'BTC', api_key: this.GLASSNODE_KEY }
        }),
        axios.get('https://api.glassnode.com/v1/metrics/transactions/transfers_volume_exchanges_net', {
          params: { a: 'BTC', api_key: this.GLASSNODE_KEY }
        }),
        axios.get('https://api.glassnode.com/v1/metrics/market/mvrv', {
          params: { a: 'BTC', api_key: this.GLASSNODE_KEY }
        })
      ])

      console.log('  ✓ Glassnode metrics fetched')
      return {
        activeAddresses: activeAddresses.data[0]?.v || 0,
        exchangeNetflow: exchangeNetflow.data[0]?.v || 0,
        mvrv: mvrv.data[0]?.v || 0
      }
    } catch (error) {
      console.log('  ✗ Glassnode: Error fetching')
      return {}
    }
  }

  private async fetchMessariMetrics(): Promise<any> {
    try {
      const response = await axios.get('https://data.messari.io/api/v1/assets/bitcoin/metrics', {
        headers: this.MESSARI_KEY ? { 'x-messari-api-key': this.MESSARI_KEY } : {},
        timeout: 5000
      })

      const data = response.data.data
      console.log('  ✓ Messari data fetched')
      return {
        nvtRatio: data.market_data?.nvt || 0,
        realizedCap: data.marketcap?.realized_usd || 0
      }
    } catch (error) {
      console.log('  ✗ Messari: Using fallback')
      return {}
    }
  }

  // ===========================================
  // SENTIMENT & SOCIAL METRICS
  // ===========================================

  async fetchSentimentMetrics(): Promise<SentimentMetrics> {
    console.log('😊 Fetching Sentiment data...')

    const [news, social, fearGreed, github] = await Promise.allSettled([
      this.fetchNewsData(),
      this.fetchSocialData(),
      this.fetchFearGreedIndex(),
      this.fetchGitHubActivity()
    ])

    const newsData = this.extractValue(news, { score: 0, volume: 0 })
    const socialData = this.extractValue(social, { twitter: 0, reddit: 0, volume: 0 })
    const fearGreedData = this.extractValue(fearGreed, 50)
    const githubData = this.extractValue(github, 0)

    return {
      overallScore: newsData.score,
      twitterMentions: socialData.twitter,
      redditPosts: socialData.reddit,
      newsVolume: newsData.volume,
      fearGreedIndex: fearGreedData,
      socialVolume: socialData.volume,
      developerActivity: githubData
    }
  }

  private async fetchNewsData(): Promise<any> {
    // Try Google SERP API first for better coverage
    if (this.GOOGLE_SERP_KEY) {
      try {
        const response = await axios.get('https://serpapi.com/search', {
          params: {
            q: 'bitcoin cryptocurrency news',
            api_key: this.GOOGLE_SERP_KEY,
            tbm: 'nws', // News search
            num: 100
          },
          timeout: 5000
        })

        const articles = response.data.news_results || []
        let totalScore = 0

        articles.forEach((article: any) => {
          const text = `${article.title} ${article.snippet}`
          const result = sentiment.analyze(text)
          totalScore += result.score
        })

        const avgScore = articles.length > 0 ? totalScore / articles.length : 0
        console.log(`  ✓ News sentiment (SERP): ${avgScore.toFixed(2)} (${articles.length} articles)`)

        return {
          score: avgScore,
          volume: articles.length
        }
      } catch (error) {
        console.log('  ⚠️  Google SERP failed, trying NewsAPI...')
      }
    }

    // Fallback to NewsAPI
    if (!this.NEWS_API_KEY) {
      console.log('  ✗ NewsAPI: No API key')
      return { score: 0, volume: 0 }
    }

    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'bitcoin OR cryptocurrency',
          from: subDays(new Date(), 1).toISOString(),
          sortBy: 'publishedAt',
          apiKey: this.NEWS_API_KEY,
          pageSize: 100
        },
        timeout: 5000
      })

      const articles = response.data.articles
      let totalScore = 0

      articles.forEach((article: any) => {
        const text = `${article.title} ${article.description}`
        const result = sentiment.analyze(text)
        totalScore += result.score
      })

      const avgScore = articles.length > 0 ? totalScore / articles.length : 0
      console.log(`  ✓ News sentiment: ${avgScore.toFixed(2)} (${articles.length} articles)`)

      return {
        score: avgScore,
        volume: articles.length
      }
    } catch (error) {
      console.log('  ✗ NewsAPI: Error fetching')
      return { score: 0, volume: 0 }
    }
  }

  private async fetchSocialData(): Promise<any> {
    try {
      // Using CryptoCompare social stats
      const response = await axios.get('https://min-api.cryptocompare.com/data/social/coin/latest', {
        params: {
          coinId: 1182,
          api_key: this.CRYPTOCOMPARE_KEY
        },
        timeout: 5000
      })

      const data = response.data.Data
      console.log('  ✓ Social data fetched')

      return {
        twitter: data.Twitter?.followers || 0,
        reddit: data.Reddit?.subscribers || 0,
        volume: (data.Twitter?.statuses || 0) + (data.Reddit?.comments_per_hour || 0)
      }
    } catch (error) {
      console.log('  ✗ Social data: Using fallback')
      return { twitter: 5000000, reddit: 500000, volume: 10000 }
    }
  }

  private async fetchFearGreedIndex(): Promise<number> {
    try {
      const response = await axios.get('https://api.alternative.me/fng/', {
        timeout: 5000
      })

      const value = parseInt(response.data.data[0].value)
      console.log(`  ✓ Fear & Greed Index: ${value}`)
      return value
    } catch (error) {
      console.log('  ✗ Fear & Greed: Using fallback')
      return 50
    }
  }

  private async fetchGitHubActivity(): Promise<number> {
    try {
      const response = await axios.get('https://api.github.com/repos/bitcoin/bitcoin/stats/commit_activity', {
        timeout: 5000
      })

      const recentWeek = response.data[response.data.length - 1]
      const commits = recentWeek?.total || 0
      console.log(`  ✓ GitHub commits (last week): ${commits}`)
      return commits
    } catch (error) {
      console.log('  ✗ GitHub: Using fallback')
      return 50
    }
  }

  // ===========================================
  // MACRO ECONOMIC DATA
  // ===========================================

  async fetchMacroMetrics(): Promise<MacroMetrics> {
    console.log('💰 Fetching Macro Economic data...')

    if (!this.FRED_KEY) {
      console.log('  ✗ FRED API key not configured, using fallback data')
      return this.getFallbackMacroMetrics()
    }

    const series = {
      inflation: 'CPIAUCSL',
      interestRate: 'DFF',
      unemployment: 'UNRATE',
      gdp: 'GDPC1',
      m2: 'M2SL',
      housing: 'CSUSHPINSA',
      consumerConf: 'UMCSENT',
      retailSales: 'RSXFS'
    }

    const results = await Promise.allSettled(
      Object.entries(series).map(([key, seriesId]) =>
        this.fetchFREDSeries(seriesId, key)
      )
    )

    const data: any = {}
    results.forEach((result, index) => {
      const key = Object.keys(series)[index]
      data[key] = this.extractValue(result, 0)
    })

    return {
      inflationRate: data.inflation || 3.2,
      interestRate: data.interestRate || 5.25,
      unemploymentRate: data.unemployment || 3.8,
      gdpGrowth: data.gdp || 2.1,
      m2MoneySupply: data.m2 || 21000,
      housingIndex: data.housing || 310,
      consumerConfidence: data.consumerConf || 102,
      retailSales: data.retailSales || 710
    }
  }

  private async fetchFREDSeries(seriesId: string, name: string): Promise<number> {
    try {
      const response = await axios.get('https://api.stlouisfed.org/fred/series/observations', {
        params: {
          series_id: seriesId,
          api_key: this.FRED_KEY,
          limit: 1,
          sort_order: 'desc',
          file_type: 'json'
        },
        timeout: 5000
      })

      const value = parseFloat(response.data.observations[0].value)
      console.log(`  ✓ ${name}: ${value}`)
      return value
    } catch (error) {
      console.log(`  ✗ ${name}: Error`)
      throw error
    }
  }

  private getFallbackMacroMetrics(): MacroMetrics {
    return {
      inflationRate: 3.2,
      interestRate: 5.25,
      unemploymentRate: 3.8,
      gdpGrowth: 2.1,
      m2MoneySupply: 21000,
      housingIndex: 310,
      consumerConfidence: 102,
      retailSales: 710
    }
  }

  // ===========================================
  // DEFI METRICS
  // ===========================================

  async fetchDeFiMetrics(): Promise<DeFiMetrics> {
    console.log('🏦 Fetching DeFi data...')

    const [tvl, dexVolume, gasPrice, stablecoins, dominance] = await Promise.allSettled([
      this.fetchTVL(),
      this.fetchDEXVolume(),
      this.fetchGasPrice(),
      this.fetchStablecoinMarketCap(),
      this.fetchBTCDominance()
    ])

    return {
      totalValueLocked: this.extractValue(tvl, 50e9),
      dexVolume24h: this.extractValue(dexVolume, 5e9),
      ethGasPrice: this.extractValue(gasPrice, 30),
      stablecoinMarketCap: this.extractValue(stablecoins, 150e9),
      btcDominance: this.extractValue(dominance, 52),
      altcoinSeason: 45
    }
  }

  private async fetchTVL(): Promise<number> {
    try {
      const response = await axios.get('https://api.llama.fi/v2/chains', {
        timeout: 5000
      })

      const totalTVL = response.data.reduce((sum: number, chain: any) => sum + (chain.tvl || 0), 0)
      console.log(`  ✓ Total TVL: $${(totalTVL / 1e9).toFixed(2)}B`)
      return totalTVL
    } catch (error) {
      console.log('  ✗ TVL: Using fallback')
      return 50e9
    }
  }

  private async fetchDEXVolume(): Promise<number> {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/exchanges', {
        headers: this.COINGECKO_KEY ? { 'x-cg-pro-api-key': this.COINGECKO_KEY } : {},
        timeout: 5000
      })

      const dexes = response.data.filter((ex: any) => ex.trust_score >= 7)
      const volume = dexes.reduce((sum: number, dex: any) => sum + (dex.trade_volume_24h_btc || 0), 0)
      console.log(`  ✓ DEX Volume: ${volume.toFixed(2)} BTC`)
      return volume * 95000 // Convert to USD
    } catch (error) {
      console.log('  ✗ DEX Volume: Using fallback')
      return 5e9
    }
  }

  private async fetchGasPrice(): Promise<number> {
    try {
      const response = await axios.get('https://api.etherscan.io/api', {
        params: {
          module: 'gastracker',
          action: 'gasoracle'
        },
        timeout: 5000
      })

      const gasPrice = parseInt(response.data.result.ProposeGasPrice)
      console.log(`  ✓ ETH Gas Price: ${gasPrice} Gwei`)
      return gasPrice
    } catch (error) {
      console.log('  ✗ Gas Price: Using fallback')
      return 30
    }
  }

  private async fetchStablecoinMarketCap(): Promise<number> {
    try {
      const stablecoins = ['tether', 'usd-coin', 'dai', 'binance-usd']
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: stablecoins.join(','),
          vs_currencies: 'usd',
          include_market_cap: true
        },
        headers: this.COINGECKO_KEY ? { 'x-cg-pro-api-key': this.COINGECKO_KEY } : {},
        timeout: 5000
      })

      let totalCap = 0
      Object.values(response.data).forEach((coin: any) => {
        totalCap += coin.usd_market_cap || 0
      })

      console.log(`  ✓ Stablecoin Market Cap: $${(totalCap / 1e9).toFixed(2)}B`)
      return totalCap
    } catch (error) {
      console.log('  ✗ Stablecoin Cap: Using fallback')
      return 150e9
    }
  }

  private async fetchBTCDominance(): Promise<number> {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/global', {
        headers: this.COINGECKO_KEY ? { 'x-cg-pro-api-key': this.COINGECKO_KEY } : {},
        timeout: 5000
      })

      const dominance = response.data.data.market_cap_percentage.btc
      console.log(`  ✓ BTC Dominance: ${dominance.toFixed(2)}%`)
      return dominance
    } catch (error) {
      console.log('  ✗ BTC Dominance: Using fallback')
      return 52
    }
  }

  // ===========================================
  // AGGREGATION & STORAGE
  // ===========================================

  async aggregateAllData(): Promise<AggregatedData> {
    console.log('\n🌍 Starting Multi-Source Data Aggregation...\n')

    const startTime = Date.now()

    // Fetch BTC price first
    const btcResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'bitcoin', vs_currencies: 'usd' },
      headers: this.COINGECKO_KEY ? { 'x-cg-pro-api-key': this.COINGECKO_KEY } : {}
    })
    const btcPrice = btcResponse.data.bitcoin.usd

    // Fetch all data sources in parallel
    const [tradFi, onChain, sentiment, macro, defi] = await Promise.all([
      this.fetchTradFiMetrics(),
      this.fetchOnChainMetrics(),
      this.fetchSentimentMetrics(),
      this.fetchMacroMetrics(),
      this.fetchDeFiMetrics()
    ])

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`\n✅ Data aggregation complete in ${duration}s\n`)

    return {
      timestamp: new Date(),
      btcPrice,
      tradFi,
      onChain,
      sentiment,
      macro,
      defi
    }
  }

  async storeAggregatedData(data: AggregatedData): Promise<void> {
    try {
      // Store macro indicators
      await prisma.macroIndicator.create({
        data: {
          date: data.timestamp,
          btcPrice: data.btcPrice,
          sp500: data.tradFi.sp500,
          goldPrice: data.tradFi.goldPrice,
          dollarIndex: data.tradFi.dollarIndex,
          oilPrice: data.tradFi.oilPrice,
          inflationRate: data.macro.inflationRate,
          interestRate: data.macro.interestRate,
          vixIndex: data.tradFi.vixIndex,
          housingIndex: data.macro.housingIndex
        }
      })

      // Store sentiment data
      await prisma.sentimentData.create({
        data: {
          timestamp: data.timestamp,
          source: 'aggregated',
          sentimentScore: data.sentiment.overallScore / 10, // Normalize to -1 to 1
          volumeScore: data.sentiment.socialVolume / 1000,
          keywords: 'bitcoin,crypto',
          newsCount: data.sentiment.newsVolume,
          positiveCount: Math.max(0, data.sentiment.overallScore),
          negativeCount: Math.max(0, -data.sentiment.overallScore),
          neutralCount: 0,
          rawData: JSON.stringify(data.sentiment)
        }
      })

      console.log('💾 Data stored in database')
    } catch (error) {
      console.error('Error storing aggregated data:', error)
    }
  }

  // Helper method
  private extractValue(result: PromiseSettledResult<any>, fallback: any): any {
    return result.status === 'fulfilled' ? result.value : fallback
  }

  // ===========================================
  // MAIN SYNC METHOD
  // ===========================================

  async syncAllSources(): Promise<void> {
    try {
      const data = await this.aggregateAllData()
      await this.storeAggregatedData(data)
      
      console.log('\n📊 Summary:')
      console.log(`   BTC Price: $${data.btcPrice.toLocaleString()}`)
      console.log(`   S&P 500: ${data.tradFi.sp500.toFixed(2)}`)
      console.log(`   Fear & Greed: ${data.sentiment.fearGreedIndex}`)
      console.log(`   Active Addresses: ${data.onChain.activeAddresses.toLocaleString()}`)
      console.log(`   Total TVL: $${(data.defi.totalValueLocked / 1e9).toFixed(2)}B`)
      console.log(`   BTC Dominance: ${data.defi.btcDominance.toFixed(2)}%`)
    } catch (error) {
      console.error('Error in syncAllSources:', error)
    }
  }
}

export const multiSourceDataAggregator = new MultiSourceDataAggregator()
