import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import type { Order } from '@/lib/types'
import type { ShopSettings } from '@/components/SettingsModule'
import { formatDate, formatCurrency } from '@/lib/mock-data'
import {
  DeviceMobile,
  Package,
  CheckCircle,
  Clock,
  Phone,
  WarningCircle,
  Camera,
  ClockCounterClockwise
} from '@phosphor-icons/react'

interface PublicOrderViewProps {
  folio: string
}

const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'SalvaCell',
  address: 'Calle Ejemplo #123, Col. Centro, CDMX',
  phone: '555-123-4567',
  whatsapp: '5551234567',
  email: 'contacto@salvacell.com',
  website: 'www.salvacell.com',
  openTime: '09:00',
  closeTime: '19:00',
  workDays: 'Lunes a Sábado',
  workshopRules: `• El plazo de entrega puede variar según disponibilidad de repuestos.
• Los equipos no reclamados después de 30 días quedan a disposición del taller.
• La garantía del servicio es de 30 días sobre la reparación realizada.
• Se requiere identificación oficial para recoger el equipo.
• El pago del servicio debe realizarse al momento de la entrega.`,
  warrantyDays: 30,
  abandonedDeviceDays: 30,
  notifyOnStatusChange: true,
  notifyViaWhatsApp: true,
  notifyViaEmail: false,
  primaryColor: '#2563eb',
  logoUrl: ''
}

export function PublicOrderView({ folio }: PublicOrderViewProps) {
  const [orders] = useKV<Order[]>('orders', [])
  const [settings] = useKV<ShopSettings>('shop_settings', DEFAULT_SETTINGS)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const shopSettings = settings || DEFAULT_SETTINGS

  useEffect(() => {
    const ordersList = orders || []
    const foundOrder = ordersList.find((o) => o.folio === folio || o.qrCode === folio)
    setOrder(foundOrder || null)
    setLoading(false)
  }, [orders, folio])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Clock size={48} className="mx-auto text-muted-foreground animate-spin mb-4" />
            <p className="text-muted-foreground">Cargando información...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <WarningCircle size={64} className="mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Orden no encontrada</h2>
            <p className="text-muted-foreground">
              No se encontró ninguna orden con el código proporcionado.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusSteps = [
    { key: 'received', label: 'Recibido' },
    { key: 'diagnosing', label: 'En Diagnóstico' },
    { key: 'waiting_parts', label: 'Esperando Repuestos' },
    { key: 'in_repair', label: 'En Reparación' },
    { key: 'repaired', label: 'Reparado' },
    { key: 'delivered', label: 'Entregado' }
  ]

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status)
  const progress = ((currentStepIndex + 1) / statusSteps.length) * 100

  // Get all photos from status history
  const historyPhotos = order.statusHistory
    .filter(h => h.photos && h.photos.length > 0)
    .flatMap(h => h.photos || [])

  // Recent status changes for the timeline (last 5)
  const recentHistory = order.statusHistory.slice(-5).reverse()

  const statusLabels: Record<string, string> = {
    received: 'Recibido',
    diagnosing: 'En Diagnóstico',
    waiting_parts: 'Esperando Repuestos',
    in_repair: 'En Reparación',
    repaired: 'Reparado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">{shopSettings.shopName}</h1>
          <p className="text-muted-foreground">
            Seguimiento de tu Reparación
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {order.folio}
              </div>
              <div className="text-sm font-normal text-muted-foreground">
                Recibido: {formatDate(order.createdAt)}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Estado del Servicio</span>
                <span className="text-sm font-bold text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="mt-4 space-y-3">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex
                  
                  return (
                    <div
                      key={step.key}
                      className={`flex items-center gap-3 ${
                        isCompleted ? 'opacity-100' : 'opacity-40'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle size={20} weight="fill" />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            isCurrent ? 'text-primary' : ''
                          }`}
                        >
                          {step.label}
                          {isCurrent && (
                            <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                              Actual
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DeviceMobile size={20} />
                Información del Dispositivo
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Equipo:</span>
                  <span className="font-medium">
                    {order.device.brand} {order.device.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IMEI:</span>
                  <span className="font-mono text-xs">
                    {order.device.imei}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package size={20} />
                Detalles del Servicio
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Problema:</div>
                  <div className="font-medium">{order.problem}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Servicio:</div>
                  <div className="font-medium">{order.services}</div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted-foreground">Costo estimado:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(order.estimatedCost)}
                  </span>
                </div>
                {order.payments.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">Pagado:</span>
                      <span className="text-lg font-bold text-green-700">
                        {formatCurrency(order.payments.reduce((sum, p) => sum + p.amount, 0))}
                      </span>
                    </div>
                    {order.paymentStatus === 'partial' && (
                      <div className="flex justify-between items-center">
                        <span className="text-red-700 font-medium">Pendiente:</span>
                        <span className="text-lg font-bold text-red-700">
                          {formatCurrency(order.estimatedCost - order.payments.reduce((sum, p) => sum + p.amount, 0))}
                        </span>
                      </div>
                    )}
                    {order.paymentStatus === 'paid' && (
                      <div className="text-xs text-green-700 text-center pt-1">
                        ✓ Pagado completamente
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Entrega estimada:</span>
                  <span className="font-medium">
                    {formatDate(order.estimatedDelivery)}
                  </span>
                </div>
              </div>
            </div>

            {order.priority === 'urgent' && (
              <>
                <Separator />
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-red-700 font-semibold text-sm">
                    ⚡ Servicio Urgente - Prioridad Alta
                  </div>
                </div>
              </>
            )}

            {/* Diagnosis Photos Section */}
            {historyPhotos.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Camera size={20} />
                    Fotografías de Diagnóstico
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {historyPhotos.slice(0, 6).map((photo, index) => (
                      <div 
                        key={index}
                        className="aspect-square rounded-lg bg-muted overflow-hidden"
                      >
                        <img 
                          src={photo} 
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {historyPhotos.length > 6 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      +{historyPhotos.length - 6} fotos más
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Status History Summary */}
            {recentHistory.length > 1 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ClockCounterClockwise size={20} />
                    Historial Reciente
                  </h3>
                  <div className="space-y-2">
                    {recentHistory.map((entry, index) => (
                      <div 
                        key={entry.id}
                        className={`text-sm p-2 rounded ${index === 0 ? 'bg-primary/10' : 'bg-muted/50'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{statusLabels[entry.status] || entry.status}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.timestamp)}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reglamento del Taller</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground whitespace-pre-line">
            {shopSettings.workshopRules}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="pt-6 text-center">
            <Phone size={32} className="mx-auto mb-3" weight="fill" />
            <h3 className="font-bold text-lg mb-2">¿Necesitas ayuda?</h3>
            <p className="text-sm text-blue-100 mb-4">
              Contáctanos para cualquier consulta sobre tu reparación
            </p>
            <div className="font-bold text-xl">{shopSettings.phone}</div>
            {shopSettings.whatsapp && (
              <a 
                href={`https://wa.me/${shopSettings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-4 py-2 bg-green-500 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
              >
                💬 WhatsApp
              </a>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>{shopSettings.shopName} - Sistema de Gestión de Reparaciones</p>
          <p className="mt-1">© {new Date().getFullYear()} Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  )
}
