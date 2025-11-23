import express from 'express'
import predictionService from '../services/predictionService'

const router = express.Router()

// Get current prediction
router.get('/current', async (req, res) => {
  try {
    const timeframe = (req.query.timeframe as string) || '24h'
    const prediction = await predictionService.generatePrediction(
      timeframe as '1h' | '24h' | '7d' | '30d'
    )
    
    res.json({
      success: true,
      data: prediction
    })
  } catch (error) {
    console.error('Error generating prediction:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate prediction'
    })
  }
})

// Get historical predictions
router.get('/history', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    const predictions = await predictionService.getHistoricalPredictions(days)
    
    res.json({
      success: true,
      data: predictions
    })
  } catch (error) {
    console.error('Error fetching prediction history:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prediction history'
    })
  }
})

// Add geopolitical event
router.post('/events', async (req, res) => {
  try {
    const event = await predictionService.addGeopoliticalEvent({
      date: new Date(req.body.date),
      type: req.body.type,
      severity: req.body.severity,
      description: req.body.description,
      impactOnBTC: req.body.impactOnBTC,
      region: req.body.region,
      duration: req.body.duration
    })
    
    res.json({
      success: true,
      data: event
    })
  } catch (error) {
    console.error('Error adding geopolitical event:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to add geopolitical event'
    })
  }
})

// Fetch and store historical data
router.post('/sync-historical', async (req, res) => {
  try {
    const days = parseInt(req.body.days) || 90
    const historicalData = await predictionService.fetchHistoricalBTCPrice(days)
    
    res.json({
      success: true,
      message: `Fetched ${historicalData.length} historical data points`,
      data: historicalData.slice(-10) // Return last 10 as sample
    })
  } catch (error) {
    console.error('Error syncing historical data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to sync historical data'
    })
  }
})

export default router
