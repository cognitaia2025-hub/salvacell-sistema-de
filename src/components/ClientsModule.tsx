import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClientBadge } from './ClientBadge'
import { ClientDetailsDialog } from './ClientDetailsDialog'
import type { Client, Order } from '@/lib/types'
import { formatCurrency } from '@/lib/mock-data'
import {
  MagnifyingGlass,
  User,
  Phone,
  Envelope
} from '@phosphor-icons/react'

export function ClientsModule() {
  const [clients] = useKV<Client[]>('clients', [])
  const [orders] = useKV<Order[]>('orders', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const clientsList = clients || []
  const ordersList = orders || []

  const filteredClients = clientsList.filter((client) => {
    const matchesSearch =
      searchQuery === '' ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesSearch
  })

  const getClientOrders = (clientId: string) => {
    return ordersList.filter((order) => order.clientId === clientId)
  }

  const getClientStats = (clientId: string) => {
    const clientOrders = getClientOrders(clientId)
    const totalSpent = clientOrders.reduce((sum, order) => {
      const paid = order.payments.reduce((pSum, p) => pSum + p.amount, 0)
      return sum + paid
    }, 0)

    return {
      totalOrders: clientOrders.length,
      totalSpent
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clientes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona tu base de datos de clientes
          </p>
        </div>
        <div className="text-sm font-medium">
          Total: {clientsList.length} clientes
        </div>
      </div>

      <div className="relative">
        <MagnifyingGlass
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Buscar por nombre, teléfono o email..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const stats = getClientStats(client.id)

          return (
            <Card
              key={client.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:border-accent"
              onClick={() => setSelectedClient(client)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {client.tier && <ClientBadge tier={client.tier} />}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">{client.phone}</span>
                </div>
                {client.alternatePhone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone size={16} className="flex-shrink-0" />
                    <span>{client.alternatePhone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Envelope size={16} className="flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                <div className="pt-3 border-t mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Órdenes</div>
                    <div className="font-bold text-lg">{stats.totalOrders}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Gastado</div>
                    <div className="font-bold text-lg text-green-600">
                      {formatCurrency(stats.totalSpent)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se encontraron clientes</p>
        </div>
      )}

      {selectedClient && (
        <ClientDetailsDialog
          client={selectedClient}
          orders={getClientOrders(selectedClient.id)}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  )
}
