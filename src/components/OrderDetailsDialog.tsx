import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
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
import { PaymentManager } from './PaymentManager'
import type { ShopSettings } from './SettingsModule'
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
  Copy,
  Printer
} from '@phosphor-icons/react'
import { toast } from 'sonner'

const DEFAULT_LABEL_SETTINGS = {
  labelWidth: '80mm',
  labelHeight: '50mm'
}

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
  const [settings] = useKV<ShopSettings>('shop_settings', null)
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

  const handlePrintLabel = () => {
    const publicUrl = `${window.location.origin}${window.location.pathname}?qr=${order.folio}`
    const labelWidth = settings?.labelWidth || DEFAULT_LABEL_SETTINGS.labelWidth
    const labelHeight = settings?.labelHeight || DEFAULT_LABEL_SETTINGS.labelHeight
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Etiqueta - ${order.folio}</title>
        <style>
          @page {
            size: ${labelWidth} ${labelHeight};
            margin: 3mm;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 8px;
            font-size: 11px;
          }
          .label-container {
            border: 1px solid #000;
            padding: 8px;
            height: calc(${labelHeight} - 22px);
            display: flex;
            gap: 10px;
          }
          .qr-section {
            flex-shrink: 0;
            text-align: center;
          }
          .qr-code {
            width: 70px;
            height: 70px;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            border: 1px solid #ccc;
            margin-bottom: 4px;
          }
          .info-section {
            flex: 1;
            overflow: hidden;
          }
          .folio {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 4px;
            color: #000;
          }
          .client-name {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 2px;
          }
          .phone {
            font-size: 11px;
            margin-bottom: 4px;
          }
          .device {
            font-size: 10px;
            margin-bottom: 2px;
          }
          .imei {
            font-size: 9px;
            color: #555;
          }
          .date {
            font-size: 8px;
            color: #666;
            margin-top: 4px;
          }
        </style>
      </head>
      <body>
        <div class="label-container">
          <div class="qr-section">
            <div class="qr-code">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(publicUrl)}" width="70" height="70" alt="QR"/>
            </div>
            <div style="font-size: 8px;">${order.folio}</div>
          </div>
          <div class="info-section">
            <div class="folio">${order.folio}</div>
            <div class="client-name">${order.client.name}</div>
            <div class="phone">Tel: ${order.client.phone}</div>
            <div class="device">${order.device.brand} ${order.device.model}</div>
            <div class="imei">IMEI: ${order.device.imei}</div>
            <div class="date">Recibido: ${new Date(order.createdAt).toLocaleDateString('es-MX')}</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
          }
        </script>
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      toast.success('Abriendo ventana de impresión...')
    } else {
      toast.error('Por favor habilita las ventanas emergentes para imprimir')
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
                  Copiar Enlace
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleShareQRLink}
                >
                  <ShareNetwork size={18} className="mr-2" />
                  Compartir
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handlePrintLabel}
                >
                  <Printer size={18} className="mr-2" />
                  Imprimir Etiqueta
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                La etiqueta incluye: nombre del cliente, teléfono, datos del equipo (marca/modelo/IMEI) y código QR
              </p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <OrderTimeline history={order.statusHistory} />
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <PaymentManager order={order} onUpdate={onUpdate} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}