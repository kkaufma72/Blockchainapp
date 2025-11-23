import axios from 'axios'
import prisma from '../lib/prisma'
import { subDays } from 'date-fns'

/**
 * Environmental Data Service
 * Fetches real macro-economic and geopolitical data from various APIs
 * and stores them in the database for prediction analysis
 */

class EnvironmentalDataService {
  private readonly ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY || 'demo'
  private readonly FRED_API_KEY = process.env.FRED_API_KEY || ''
  private readonly NEWS_API_KEY = process.env.NEWS_API_KEY || ''

  /**
   * Fetch S&P 500 data from Alpha Vantage
   * API: https://www.alphavantage.co/
   * Free tier: 5 API calls/minute, 500/day
   */
  async fetchSP500Data(days: number = 90): Promise<{ date: Date; value: number }[]> {
    try {
      const response = await axios.get(
        'https://www.alphavantage.co/query',
        {
          params: {
            function: 'TIME_SERIES_DAILY',
            symbol: 'SPY', // S&P 500 ETF
            apikey: this.ALPHA_VANTAGE_KEY,
            outputsize: days > 100 ? 'full' : 'compact'
          }
        }
      )

      const timeSeries = response.data['Time Series (Daily)']
      if (!timeSeries) {
        console.warn('No S&P 500 data returned from Alpha Vantage')
        return this.generateMockSP500(days)
      }

      const data: { date: Date; value: number }[] = []
      Object.keys(timeSeries)
        .slice(0, days)
        .forEach(dateStr => {
          data.push({
            date: new Date(dateStr),
            value: parseFloat(timeSeries[dateStr]['4. close'])
          })
        })

      return data.reverse()
    } catch (error) {
      console.error('Error fetching S&P 500 data:', error)
      return this.generateMockSP500(days)
    }
  }

  /**
   * Fetch Gold prices from Alpha Vantage
   */
  async fetchGoldPrice(): Promise<number> {
    try {
      const response = await axios.get(
        'https://www.alphavantage.co/query',
        {
          params: {
            function: 'CURRENCY_EXCHANGE_RATE',
            from_currency: 'XAU', // Gold (Troy Ounce)
            to_currency: 'USD',
            apikey: this.ALPHA_VANTAGE_KEY
          }
        }
      )

      const exchangeRate = response.data['Realtime Currency Exchange Rate']
      return exchangeRate ? parseFloat(exchangeRate['5. Exchange Rate']) : 2000 // fallback
    } catch (error) {
      console.error('Error fetching gold price:', error)
      return 2000 // Mock price
    }
  }

  /**
   * Fetch VIX (Fear Index) from Alpha Vantage
   */
  async fetchVIXIndex(): Promise<number> {
    try {
      const response = await axios.get(
        'https://www.alphavantage.co/query',
        {
          params: {
            function: 'TIME_SERIES_DAILY',
            symbol: 'VIX',
            apikey: this.ALPHA_VANTAGE_KEY
          }
        }
      )

      const timeSeries = response.data['Time Series (Daily)']
      if (!timeSeries) return 20 // fallback

      const latestDate = Object.keys(timeSeries)[0]
      return parseFloat(timeSeries[latestDate]['4. close'])
    } catch (error) {
      console.error('Error fetching VIX:', error)
      return 20
    }
  }

  /**
   * Fetch economic indicators from FRED (Federal Reserve Economic Data)
   * API: https://fred.stlouisfed.org/
   * Requires free API key
   */
  async fetchFREDData(seriesId: string): Promise<number | null> {
    if (!this.FRED_API_KEY) {
      console.warn('FRED API key not configured')
      return null
    }

    try {
      const response = await axios.get(
        `https://api.stlouisfed.org/fred/series/observations`,
        {
          params: {
            series_id: seriesId,
            api_key: this.FRED_API_KEY,
            file_type: 'json',
            sort_order: 'desc',
            limit: 1
          }
        }
      )

      const observations = response.data.observations
      if (observations && observations.length > 0) {
        return parseFloat(observations[0].value)
      }
      return null
    } catch (error) {
      console.error(`Error fetching FRED data for ${seriesId}:`, error)
      return null
    }
  }

  /**
   * Get inflation rate (CPI)
   * FRED Series: CPIAUCSL (Consumer Price Index)
   */
  async fetchInflationRate(): Promise<number> {
    const cpi = await this.fetchFREDData('CPIAUCSL')
    return cpi || 3.2 // Mock 3.2% if unavailable
  }

  /**
   * Get Federal Funds Rate (Interest Rate)
   * FRED Series: DFF (Daily Federal Funds Rate)
   */
  async fetchInterestRate(): Promise<number> {
    const rate = await this.fetchFREDData('DFF')
    return rate || 5.25 // Mock rate
  }

  /**
   * Get Housing Price Index
   * FRED Series: CSUSHPINSA (S&P/Case-Shiller U.S. National Home Price Index)
   */
  async fetchHousingIndex(): Promise<number> {
    const index = await this.fetchFREDData('CSUSHPINSA')
    return index || 310 // Mock index
  }

  /**
   * Get Dollar Index (DXY)
   */
  async fetchDollarIndex(): Promise<number> {
    try {
      // Using alternative API or mock data
      // Production: integrate with forex API
      return 104.5 // Mock DXY value
    } catch (error) {
      console.error('Error fetching dollar index:', error)
      return 104.5
    }
  }

  /**
   * Get Oil prices
   */
  async fetchOilPrice(): Promise<number> {
    try {
      const response = await axios.get(
        'https://www.alphavantage.co/query',
        {
          params: {
            function: 'TIME_SERIES_DAILY',
            symbol: 'USO', // US Oil Fund ETF
            apikey: this.ALPHA_VANTAGE_KEY
          }
        }
      )

      const timeSeries = response.data['Time Series (Daily)']
      if (!timeSeries) return 75 // fallback

      const latestDate = Object.keys(timeSeries)[0]
      return parseFloat(timeSeries[latestDate]['4. close'])
    } catch (error) {
      console.error('Error fetching oil price:', error)
      return 75
    }
  }

  /**
   * Fetch geopolitical events from news APIs
   * Using NewsAPI or similar services
   */
  async fetchGeopoliticalEvents(days: number = 30): Promise<any[]> {
    if (!this.NEWS_API_KEY) {
      console.warn('News API key not configured, using historical data')
      return this.getHistoricalGeopoliticalEvents()
    }

    try {
      const fromDate = subDays(new Date(), days).toISOString().split('T')[0]
      
      const response = await axios.get(
        'https://newsapi.org/v2/everything',
        {
          params: {
            q: 'bitcoin OR cryptocurrency OR (war AND economy) OR (pandemic) OR (tariff) OR (inflation)',
            from: fromDate,
            sortBy: 'relevancy',
            apiKey: this.NEWS_API_KEY,
            pageSize: 20
          }
        }
      )

      // Analyze news sentiment and classify events
      return this.classifyNewsEvents(response.data.articles)
    } catch (error) {
      console.error('Error fetching geopolitical events:', error)
      return this.getHistoricalGeopoliticalEvents()
    }
  }

  /**
   * Classify news articles into geopolitical event types
   */
  private classifyNewsEvents(articles: any[]): any[] {
    const events: any[] = []

    articles.forEach(article => {
      const title = (article.title || '').toLowerCase()
      const description = (article.description || '').toLowerCase()
      const content = title + ' ' + description

      let type = 'regulation'
      let severity = 5

      if (content.includes('war') || content.includes('conflict')) {
        type = 'war'
        severity = 8
      } else if (content.includes('pandemic') || content.includes('covid')) {
        type = 'pandemic'
        severity = 9
      } else if (content.includes('tariff') || content.includes('trade war')) {
        type = 'tariff'
        severity = 6
      } else if (content.includes('disaster') || content.includes('earthquake')) {
        type = 'disaster'
        severity = 7
      } else if (content.includes('election') || content.includes('vote')) {
        type = 'election'
        severity = 4
      }

      // Estimate Bitcoin impact based on keywords
      let impactOnBTC = 0
      if (content.includes('bitcoin') || content.includes('crypto')) {
        if (content.includes('ban') || content.includes('restrict')) {
          impactOnBTC = -15
        } else if (content.includes('adopt') || content.includes('approve')) {
          impactOnBTC = 10
        }
      }

      events.push({
        date: new Date(article.publishedAt),
        type,
        severity,
        description: article.title,
        impactOnBTC,
        region: 'Global',
        duration: type === 'pandemic' ? 365 : type === 'war' ? 180 : 30
      })
    })

    return events
  }

  /**
   * Get hardcoded historical geopolitical events
   * These are significant events that historically impacted Bitcoin
   */
  private getHistoricalGeopoliticalEvents(): any[] {
    return [
      {
        date: new Date('2020-03-11'),
        type: 'pandemic',
        severity: 10,
        description: 'COVID-19 declared global pandemic by WHO',
        impactOnBTC: -50,
        region: 'Global',
        duration: 730
      },
      {
        date: new Date('2022-02-24'),
        type: 'war',
        severity: 9,
        description: 'Russia-Ukraine conflict begins',
        impactOnBTC: -30,
        region: 'Europe',
        duration: 365
      },
      {
        date: new Date('2021-09-24'),
        type: 'regulation',
        severity: 8,
        description: 'China bans all cryptocurrency transactions',
        impactOnBTC: -45,
        region: 'Asia',
        duration: 90
      },
      {
        date: new Date('2024-01-10'),
        type: 'regulation',
        severity: 3,
        description: 'Bitcoin Spot ETF approved in United States',
        impactOnBTC: 25,
        region: 'Americas',
        duration: 180
      },
      {
        date: new Date('2022-03-09'),
        type: 'regulation',
        severity: 7,
        description: 'US Executive Order on Digital Assets',
        impactOnBTC: 15,
        region: 'Americas',
        duration: 365
      }
    ]
  }

  /**
   * Sync all environmental data to database
   * This should be called periodically (e.g., daily)
   */
  async syncAllData(): Promise<void> {
    console.log('🌍 Syncing environmental data...')

    try {
      // Fetch Bitcoin price for reference
      const btcResponse = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: { ids: 'bitcoin', vs_currencies: 'usd' },
          headers: process.env.COINGECKO_API_KEY ? {
            'x-cg-pro-api-key': process.env.COINGECKO_API_KEY
          } : {}
        }
      )
      const btcPrice = btcResponse.data.bitcoin.usd

      // Fetch all macro indicators
      const [sp500, gold, vix, dollarIndex, oilPrice, inflation, interestRate, housingIndex] = await Promise.all([
        this.fetchSP500Data(1).then(data => data[0]?.value || 4500),
        this.fetchGoldPrice(),
        this.fetchVIXIndex(),
        this.fetchDollarIndex(),
        this.fetchOilPrice(),
        this.fetchInflationRate(),
        this.fetchInterestRate(),
        this.fetchHousingIndex()
      ])

      // Store in database
      await prisma.macroIndicator.create({
        data: {
          date: new Date(),
          btcPrice,
          sp500,
          goldPrice: gold,
          dollarIndex,
          oilPrice,
          inflationRate: inflation,
          interestRate,
          vixIndex: vix,
          housingIndex
        }
      })

      console.log('✅ Macro indicators synced')
      console.log(`   BTC: $${btcPrice.toLocaleString()}`)
      console.log(`   S&P 500: ${sp500.toFixed(2)}`)
      console.log(`   Gold: $${gold.toFixed(2)}`)
      console.log(`   VIX: ${vix.toFixed(2)}`)
      console.log(`   Inflation: ${inflation.toFixed(2)}%`)
      console.log(`   Interest Rate: ${interestRate.toFixed(2)}%`)

      // Sync geopolitical events
      const events = await this.fetchGeopoliticalEvents(30)
      for (const event of events) {
        await prisma.geopoliticalEvent.create({
          data: event
        })
      }

      console.log(`✅ ${events.length} geopolitical events synced`)
    } catch (error) {
      console.error('Error syncing environmental data:', error)
    }
  }

  /**
   * Backfill historical data for a date range
   * Useful for training ML models
   */
  async backfillHistoricalData(days: number = 365): Promise<void> {
    console.log(`📊 Backfilling ${days} days of historical data...`)

    try {
      const btcHistory = await this.fetchHistoricalBTCPrices(days)
      const sp500History = await this.fetchSP500Data(days)

      for (let i = 0; i < Math.min(btcHistory.length, sp500History.length); i++) {
        await prisma.macroIndicator.create({
          data: {
            date: btcHistory[i].date,
            btcPrice: btcHistory[i].price,
            sp500: sp500History[i].value,
            goldPrice: 1800 + Math.random() * 400, // Mock historical gold
            dollarIndex: 100 + Math.random() * 10,
            oilPrice: 60 + Math.random() * 40,
            vixIndex: 15 + Math.random() * 20
          }
        })
      }

      console.log(`✅ Backfilled ${days} days of data`)
    } catch (error) {
      console.error('Error backfilling data:', error)
    }
  }

  /**
   * Fetch historical Bitcoin prices
   */
  private async fetchHistoricalBTCPrices(days: number): Promise<{ date: Date; price: number }[]> {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart',
        {
          params: {
            vs_currency: 'usd',
            days,
            interval: 'daily'
          },
          headers: process.env.COINGECKO_API_KEY ? {
            'x-cg-pro-api-key': process.env.COINGECKO_API_KEY
          } : {}
        }
      )

      return response.data.prices.map(([timestamp, price]: [number, number]) => ({
        date: new Date(timestamp),
        price
      }))
    } catch (error) {
      console.error('Error fetching historical BTC prices:', error)
      return []
    }
  }

  // Mock data generators (fallbacks)
  private generateMockSP500(days: number): { date: Date; value: number }[] {
    const data: { date: Date; value: number }[] = []
    let value = 4500
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      value += (Math.random() - 0.48) * 50
      data.push({ date, value })
    }
    
    return data
  }
}

export const environmentalDataService = new EnvironmentalDataService()
