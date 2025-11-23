import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

class NotificationService {
  private transporter: Transporter | null = null
  private emailEnabled: boolean
  private pushEnabled: boolean

  constructor() {
    this.emailEnabled = process.env.ENABLE_EMAIL_ALERTS === 'true'
    this.pushEnabled = process.env.ENABLE_PUSH_ALERTS === 'true'
    
    if (this.emailEnabled) {
      this.initializeEmailTransporter()
    }
  }

  private initializeEmailTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      })
      
      console.log('📧 Email notification service initialized')
    } catch (error) {
      console.error('Failed to initialize email service:', error)
      this.emailEnabled = false
    }
  }

  // Send email notification
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.emailEnabled || !this.transporter) {
      console.log('📧 Email notifications disabled')
      return false
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Bitcoin Whale Tracker" <noreply@whaletracker.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || `<p>${options.text}</p>`
      })

      console.log('✅ Email sent:', info.messageId)
      return true
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      return false
    }
  }

  // Send whale transaction alert
  async sendWhaleAlert(transaction: {
    hash: string
    value: number
    usdValue?: number
    classification?: string
  }) {
    const subject = `🐋 Large Bitcoin Transaction Detected`
    const text = `
A whale transaction has been detected:

Amount: ${transaction.value.toFixed(2)} BTC${transaction.usdValue ? ` (≈ $${transaction.usdValue.toLocaleString()})` : ''}
Type: ${transaction.classification || 'Unknown'}
Hash: ${transaction.hash}

View transaction: https://blockchain.com/btc/tx/${transaction.hash}
    `.trim()

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f7931a;">🐋 Large Bitcoin Transaction Detected</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> ${transaction.value.toFixed(2)} BTC${transaction.usdValue ? ` <span style="color: #666;">(≈ $${transaction.usdValue.toLocaleString()})</span>` : ''}</p>
          <p><strong>Type:</strong> ${transaction.classification || 'Unknown'}</p>
          <p><strong>Hash:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px;">${transaction.hash}</code></p>
        </div>
        <a href="https://blockchain.com/btc/tx/${transaction.hash}" 
           style="display: inline-block; background: #f7931a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          View Transaction
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This is an automated alert from Bitcoin Whale Tracker
        </p>
      </div>
    `

    return await this.sendEmail({
      to: process.env.EMAIL_USER || 'admin@example.com',
      subject,
      text,
      html
    })
  }

  // Send pattern detection alert
  async sendPatternAlert(pattern: {
    type: string
    confidence: number
    description: string
    volume: number
    impact: string
  }) {
    const impactEmoji = pattern.impact === 'bullish' ? '📈' : pattern.impact === 'bearish' ? '📉' : '➡️'
    const subject = `${impactEmoji} Pattern Detected: ${pattern.type.replace('_', ' ').toUpperCase()}`
    
    const text = `
A ${pattern.type.replace('_', ' ')} pattern has been detected:

Description: ${pattern.description}
Confidence: ${pattern.confidence}%
Volume: ${pattern.volume.toFixed(2)} BTC
Market Impact: ${pattern.impact.toUpperCase()}

This pattern may indicate ${pattern.impact === 'bullish' ? 'potential price increase' : pattern.impact === 'bearish' ? 'potential price decrease' : 'market consolidation'}.
    `.trim()

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f7931a;">${impactEmoji} Pattern Detected</h2>
        <h3 style="color: #333;">${pattern.type.replace('_', ' ').toUpperCase()}</h3>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>${pattern.description}</p>
          <div style="margin-top: 15px;">
            <div style="display: inline-block; background: #fff; padding: 8px 16px; border-radius: 4px; margin-right: 10px;">
              <strong>Confidence:</strong> ${pattern.confidence}%
            </div>
            <div style="display: inline-block; background: #fff; padding: 8px 16px; border-radius: 4px; margin-right: 10px;">
              <strong>Volume:</strong> ${pattern.volume.toFixed(2)} BTC
            </div>
            <div style="display: inline-block; background: ${pattern.impact === 'bullish' ? '#d4edda' : pattern.impact === 'bearish' ? '#f8d7da' : '#fff3cd'}; padding: 8px 16px; border-radius: 4px;">
              <strong>Impact:</strong> ${pattern.impact.toUpperCase()}
            </div>
          </div>
        </div>
        <p style="color: #666; font-style: italic;">
          ${pattern.impact === 'bullish' ? '📈 This pattern may indicate potential price increase' : 
            pattern.impact === 'bearish' ? '📉 This pattern may indicate potential price decrease' : 
            '➡️ This pattern indicates market consolidation'}
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This is an automated alert from Bitcoin Whale Tracker
        </p>
      </div>
    `

    return await this.sendEmail({
      to: process.env.EMAIL_USER || 'admin@example.com',
      subject,
      text,
      html
    })
  }

  // Send push notification (placeholder - would integrate with FCM, OneSignal, etc.)
  async sendPushNotification(title: string, body: string, data?: any): Promise<boolean> {
    if (!this.pushEnabled) {
      console.log('📱 Push notifications disabled')
      return false
    }

    console.log('📱 Push notification:', { title, body, data })
    // TODO: Integrate with Firebase Cloud Messaging or OneSignal
    return true
  }

  // Test email configuration
  async testEmailConfiguration(): Promise<boolean> {
    if (!this.transporter) {
      return false
    }

    try {
      await this.transporter.verify()
      console.log('✅ Email configuration is valid')
      return true
    } catch (error) {
      console.error('❌ Email configuration test failed:', error)
      return false
    }
  }
}

export default new NotificationService()
