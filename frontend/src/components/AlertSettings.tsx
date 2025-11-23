import { useState } from 'react'
import { Bell, BellOff, Mail, MessageSquare, Plus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AlertRule {
  id: number
  type: 'volume' | 'address' | 'price'
  condition: string
  threshold: number
  enabled: boolean
  notifications: ('email' | 'push')[]
}

export default function AlertSettings() {
  const [alerts, setAlerts] = useState<AlertRule[]>([
    {
      id: 1,
      type: 'volume',
      condition: 'Transaction above',
      threshold: 500,
      enabled: true,
      notifications: ['push']
    },
    {
      id: 2,
      type: 'address',
      condition: 'Wallet activity',
      threshold: 1000,
      enabled: true,
      notifications: ['email', 'push']
    }
  ])

  const toggleAlert = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ))
  }

  const removeAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  const getAlertIcon = (type: AlertRule['type']) => {
    switch (type) {
      case 'volume':
        return '📊'
      case 'address':
        return '👤'
      case 'price':
        return '💰'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-bitcoin" />
          <h2 className="text-2xl font-bold">Alert Settings</h2>
        </div>
        <Button className="bg-bitcoin hover:bg-bitcoin/90">
          <Plus className="w-4 h-4 mr-2" />
          New Alert
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <Card key={alert.id} className={`transition-all ${alert.enabled ? 'border-bitcoin/50' : 'opacity-60'}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-3xl">{getAlertIcon(alert.type)}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{alert.condition}</h3>
                      {alert.enabled ? (
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Paused</Badge>
                      )}
                    </div>
                    
                    <div className="text-2xl font-bold text-bitcoin mb-3">
                      {alert.threshold} BTC
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Notify via:</span>
                      <div className="flex gap-2">
                        {alert.notifications.includes('email') && (
                          <Badge variant="outline" className="gap-1">
                            <Mail className="w-3 h-3" />
                            Email
                          </Badge>
                        )}
                        {alert.notifications.includes('push') && (
                          <Badge variant="outline" className="gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Push
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAlert(alert.id)}
                  >
                    {alert.enabled ? (
                      <BellOff className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeAlert(alert.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">🔔 About Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>Volume Alerts:</strong> Get notified when transactions exceed your threshold
          </p>
          <p>
            • <strong>Address Alerts:</strong> Track specific wallet addresses and get alerts on activity
          </p>
          <p>
            • <strong>Price Alerts:</strong> Receive notifications when BTC price hits your target
          </p>
          <p className="text-xs pt-2 border-t border-border mt-4">
            💡 Connect email/push notification services to receive real-time alerts
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
