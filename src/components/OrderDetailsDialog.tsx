import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from './StatusBadge'
import { ClientBadge } from './ClientBadge'
import { OrderTimeline } from './OrderTimeline'
import { PhotoUpload } from './PhotoUpload'
import type { Order, OrderStatus } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/mock-data'
import {
  DeviceMobile,
  CalendarBlank,
  User,
  Phone,
  Envelope,
  CurrencyDollar,
  QrCode,
  X,
  ShareNetwork,
  Copy
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface OrderDetailsDialogProps {
  order: Order
  onClose: () => void
  onUpdate: (order: Order) => void
}

export function OrderDetailsDialog({
  order,
  onClose,
  onUpdate
}: OrderDetailsDialogProps) {
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status)
  const [statusNotes, setStatusNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])

  const handleStatusChange = () => {
    if (newStatus === order.status) {
      toast.error('Selecciona un estado diferente')
      return
    }

    setIsUpdating(true)

    setTimeout(() => {
      const updatedOrder: Order = {
        ...order,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        statusHistory: [
          ...order.statusHistory,
          {
            id: `h${Date.now()}`,
            status: newStatus,
            timestamp: new Date().toISOString(),
            userId: '2',
            userName: 'Usuario Actual',
            notes: statusNotes || undefined,
            photos: photos.length > 0 ? photos : undefined
          }
        ]
      }

      onUpdate(updatedOrder)
      setStatusNotes('')
      setPhotos([])
      setIsUpdating(false)
      toast.success('Estado actualizado correctamente')
    }, 500)
  }

  const handleCopyQRLink = () => {
    const publicUrl = `${window.location.origin}${window.location.pathname}?qr=${order.folio}`
    navigator.clipboard.writeText(publicUrl)
    toast.success('Enlace QR copiado al portapapeles')
  }

  const handleShareQRLink = async () => {
    const publicUrl = `${window.location.origin}${window.location.pathname}?qr=${order.folio}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Seguimiento de Orden ${order.folio}`,
          text: `Consulta el estado de tu reparación en SalvaCell`,
          url: publicUrl
        })
        toast.success('Enlace compartido')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopyQRLink()
        }
      }
    } else {
      handleCopyQRLink()
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-primary">
                {order.folio}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Creado: {formatDate(order.createdAt)}
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
            <TabsTrigger value="history" className="flex-1">
              Historial
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex-1">
              Pagos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 mt-6">
            <div className="flex items-center gap-3">
              <StatusBadge status={order.status} />
              {order.client.tier && <ClientBadge tier={order.client.tier} />}
              {order.priority === 'urgent' && (
                <span className="text-sm font-medium text-red-600">
                  ⚡ Urgente
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Cliente
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User size={18} className="text-muted-foreground" />
                      <span>{order.client.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-muted-foreground" />
                      <span>{order.client.phone}</span>
                    </div>
                    {order.client.email && (
                      <div className="flex items-center gap-2">
                        <Envelope size={18} className="text-muted-foreground" />
                        <span>{order.client.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Dispositivo
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DeviceMobile size={18} className="text-muted-foreground" />
                      <span className="font-medium">
                        {order.device.brand} {order.device.model}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      IMEI: {order.device.imei}
                    </div>
                    {order.device.password && (
                      <div className="text-sm text-muted-foreground">
                        Contraseña: {order.device.password}
                      </div>
                    )}
                    {order.device.accessories && (
                      <div className="text-sm text-muted-foreground">
                        Accesorios: {order.device.accessories}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Reparación
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Problema reportado:
                      </div>
                      <p className="text-sm">{order.problem}</p>
                    </div>
                    {order.diagnosis && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Diagnóstico:
                        </div>
                        <p className="text-sm">{order.diagnosis}</p>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Servicios:
                      </div>
                      <p className="text-sm font-medium">{order.services}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarBlank size={18} className="text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Entrega estimada
                    </div>
                    <div className="font-medium">
                      {formatDate(order.estimatedDelivery)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CurrencyDollar
                    size={18}
                    weight="fill"
                    className="text-accent"
                  />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Costo estimado
                    </div>
                    <div className="text-xl font-bold">
                      {formatCurrency(order.estimatedCost)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t space-y-4">
              <h3 className="text-sm font-medium">Cambiar Estado</h3>
              <div className="flex gap-3">
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Recibido</SelectItem>
                    <SelectItem value="diagnosing">En Diagnóstico</SelectItem>
                    <SelectItem value="waiting_parts">
                      Esperando Repuestos
                    </SelectItem>
                    <SelectItem value="in_repair">En Reparación</SelectItem>
                    <SelectItem value="repaired">Reparado</SelectItem>
                    <SelectItem value="delivered">Entregado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleStatusChange} disabled={isUpdating}>
                  {isUpdating ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </div>
              <Textarea
                placeholder="Notas adicionales (opcional)"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
              />
              <div>
                <h4 className="text-sm font-medium mb-2">Fotografías de Evidencia (opcional)</h4>
                <PhotoUpload onPhotosUploaded={setPhotos} />
              </div>
            </div>

            <div className="pt-6 border-t space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <QrCode size={20} />
                <span>Código QR: {order.qrCode}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopyQRLink}
                >
                  <Copy size={18} className="mr-2" />
                  Copiar Enlace QR
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleShareQRLink}
                >
                  <ShareNetwork size={18} className="mr-2" />
                  Compartir
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Comparte este enlace con el cliente para que consulte el estado de su orden en tiempo real
              </p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <OrderTimeline history={order.statusHistory} />
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <div className="space-y-4">
              {order.payments.length > 0 ? (
                <>
                  {order.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 border rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <div className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.method === 'cash' && 'Efectivo'}
                          {payment.method === 'card' && 'Tarjeta'}
                          {payment.method === 'transfer' && 'Transferencia'}
                          {' • '}
                          {formatDate(payment.timestamp)}
                        </div>
                        {payment.notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {payment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total pagado:</span>
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(
                          order.payments.reduce((sum, p) => sum + p.amount, 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium">Pendiente:</span>
                      <span className="text-xl font-bold text-amber-600">
                        {formatCurrency(
                          order.estimatedCost -
                            order.payments.reduce((sum, p) => sum + p.amount, 0)
                        )}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No hay pagos registrados
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}