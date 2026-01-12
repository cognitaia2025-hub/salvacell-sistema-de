import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { ClientBadge } from './ClientBadge'
import { OrderCard } from './OrderCard'
import type { Client, Order } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/mock-data'
import {
  User,
  Phone,
  Envelope,
  CalendarBlank,
  X
} from '@phosphor-icons/react'

interface ClientDetailsDialogProps {
  client: Client
  orders: Order[]
  onClose: () => void
}

export function ClientDetailsDialog({
  client,
  orders,
  onClose
}: ClientDetailsDialogProps) {
  const totalSpent = orders.reduce((sum, order) => {
    const paid = order.payments.reduce((pSum, p) => pSum + p.amount, 0)
    return sum + paid
  }, 0)

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-primary">
                {client.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Cliente desde {formatDate(client.createdAt)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute right-4 top-4"
            >
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">
              Información
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1">
              Historial de Órdenes ({orders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 mt-6">
            <div className="flex items-center gap-2">
              {client.tier && <ClientBadge tier={client.tier} />}
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Información de Contacto
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User size={18} className="text-muted-foreground" />
                        <span>{client.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={18} className="text-muted-foreground" />
                        <div>
                          <div className="font-medium">{client.phone}</div>
                          <div className="text-xs text-muted-foreground">
                            Teléfono principal
                          </div>
                        </div>
                      </div>
                      {client.alternatePhone && (
                        <div className="flex items-center gap-2">
                          <Phone size={18} className="text-muted-foreground" />
                          <div>
                            <div>{client.alternatePhone}</div>
                            <div className="text-xs text-muted-foreground">
                              Teléfono alternativo
                            </div>
                          </div>
                        </div>
                      )}
                      {client.alternateContact && (
                        <div className="flex items-center gap-2">
                          <Phone size={18} className="text-muted-foreground" />
                          <div>
                            <div>{client.alternateContact}</div>
                            <div className="text-xs text-muted-foreground">
                              Contacto alterno
                            </div>
                          </div>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Envelope size={18} className="text-muted-foreground" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CalendarBlank size={18} className="text-muted-foreground" />
                        <div>
                          <div>{formatDate(client.createdAt)}</div>
                          <div className="text-xs text-muted-foreground">
                            Fecha de registro
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Estadísticas
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-700 mb-1">
                          Total de Visitas
                        </div>
                        <div className="text-3xl font-bold text-blue-900">
                          {orders.length}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <div className="text-sm text-green-700 mb-1">
                          Total Gastado
                        </div>
                        <div className="text-3xl font-bold text-green-900">
                          {formatCurrency(totalSpent)}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                        <div className="text-sm text-purple-700 mb-1">
                          Promedio por Visita
                        </div>
                        <div className="text-3xl font-bold text-purple-900">
                          {formatCurrency(orders.length > 0 ? totalSpent / orders.length : 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Equipos Registrados
              </h3>
              <div className="space-y-2">
                {sortedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {order.device.brand} {order.device.model}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        IMEI: {order.device.imei}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay equipos registrados
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Historial completo de servicios ordenado cronológicamente
              </div>
              {sortedOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="font-bold text-lg text-primary">
                          {order.folio}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {formatCurrency(order.estimatedCost)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Pagado: {formatCurrency(
                            order.payments.reduce((sum, p) => sum + p.amount, 0)
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Equipo: </span>
                        <span className="font-medium">
                          {order.device.brand} {order.device.model}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Servicio: </span>
                        <span>{order.services}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Estado: </span>
                        <span className="font-medium capitalize">
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No hay órdenes registradas para este cliente
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
