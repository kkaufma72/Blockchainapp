import express from 'express'
import databaseService from '../services/databaseService'

const router = express.Router()

// Get whale leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const leaderboard = await databaseService.getWhaleLeaderboard(limit)
    
    res.json({
      success: true,
      data: leaderboard
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch whale leaderboard'
    })
  }
})

// Get transaction history
router.get('/history', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24
    const transactions = await databaseService.getTransactionHistory(hours)
    
    res.json({
      success: true,
      data: transactions
    })
  } catch (error) {
    console.error('Error fetching history:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction history'
    })
  }
})

// Get hourly aggregates for charts
router.get('/aggregates', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24
    const aggregates = await databaseService.getHourlyAggregates(hours)
    
    res.json({
      success: true,
      data: aggregates
    })
  } catch (error) {
    console.error('Error fetching aggregates:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hourly aggregates'
    })
  }
})

// Get detected patterns
router.get('/patterns', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const patterns = await databaseService.getRecentPatterns(limit)
    
    res.json({
      success: true,
      data: patterns
    })
  } catch (error) {
    console.error('Error fetching patterns:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patterns'
    })
  }
})

// Get alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await databaseService.getActiveAlerts()
    
    res.json({
      success: true,
      data: alerts
    })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts'
    })
  }
})

// Create alert
router.post('/alerts', async (req, res) => {
  try {
    const alert = await databaseService.upsertAlert(req.body)
    
    res.json({
      success: true,
      data: alert
    })
  } catch (error) {
    console.error('Error creating alert:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create alert'
    })
  }
})

export default router
