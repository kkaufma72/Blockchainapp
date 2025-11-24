import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Wallet, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TrackedAddress {
  address: string
  label: string
  type: string
  source?: string
}

interface AddressInfo {
  address: string
  balance: number
  totalReceived: number
  totalSent: number
  txCount: number
}

export default function TrackedAddresses() {
  const [addresses, setAddresses] = useState<TrackedAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      setError(null)
      const response = await api.get('/api/whales/tracked-addresses')
      setAddresses(response.data)
    } catch (err) {
      setError('Failed to fetch tracked addresses')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const monitorAddress = async (address: string) => {
    try {
      setSelectedAddress(address)
      setAddressInfo(null)
      const response = await api.get(`/api/whales/monitor/${address}`)
      setAddressInfo(response.data)
    } catch (err) {
      setError('Failed to monitor address')
      console.error(err)
    }
  }

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { variant: 'secondary' | 'default' | 'warning' | 'success', label: string }> = {
      exchange: { variant: 'secondary', label: 'Exchange' },
      whale: { variant: 'default', label: 'Whale' },
      public_figure: { variant: 'warning', label: 'Public Figure' },
      institution: { variant: 'success', label: 'Institution' }
    }
    const badge = badges[type] || { variant: 'default', label: type }
    return <Badge variant={badge.variant}>{badge.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Wallet className="w-6 h-6 animate-pulse text-bitcoin" />
        <span className="ml-2 text-muted-foreground">Loading tracked addresses...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Tracked Bitcoin Addresses</h2>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Known Addresses</h3>
          {addresses.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">No tracked addresses yet.</p>
              </CardContent>
            </Card>
          ) : (
            addresses.map((addr) => (
              <Card
                key={addr.address}
                className={`cursor-pointer transition-all hover:border-bitcoin/50 ${
                  selectedAddress === addr.address ? 'border-bitcoin' : ''
                }`}
                onClick={() => monitorAddress(addr.address)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{addr.label}</div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {addr.address.slice(0, 12)}...{addr.address.slice(-12)}
                      </div>
                    </div>
                    {getTypeBadge(addr.type)}
                  </div>
                  {addr.source && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Source: {addr.source}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Address Details</h3>
          {!selectedAddress ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  Select an address to view details
                </p>
              </CardContent>
            </Card>
          ) : !addressInfo ? (
            <Card>
              <CardContent className="py-12 flex justify-center">
                <Wallet className="w-6 h-6 animate-pulse text-bitcoin" />
                <span className="ml-2 text-muted-foreground">Loading address info...</span>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Balance Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Current Balance</div>
                  <div className="text-3xl font-bold text-bitcoin">
                    {addressInfo.balance.toFixed(8)} BTC
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      Total Received
                    </div>
                    <div className="text-lg font-semibold text-green-500">
                      {addressInfo.totalReceived.toFixed(8)} BTC
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      Total Sent
                    </div>
                    <div className="text-lg font-semibold text-red-500">
                      {addressInfo.totalSent.toFixed(8)} BTC
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Activity className="w-4 h-4" />
                    Total Transactions
                  </div>
                  <div className="text-xl font-semibold">{addressInfo.txCount}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
