import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from './StatusBadge'
import { ClientBadge } from './ClientBadge'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import type { Order } from '@/lib/types'
import { formatCurrency, formatDateShort } from '@/lib/mock-data'
import { DeviceMobile, CalendarBlank, CurrencyDollar } from '@phosphor-icons/react'

interface OrderCardProps {
  order: Order
  onClick?: () => void
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0)
  const remainingBalance = order.estimatedCost - totalPaid

  return (
    <Card
      className="p-6 hover:shadow-lg transition-all cursor-pointer hover:border-accent"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-primary mb-1">
            {order.folio}
          </h3>
          <p className="text-sm text-muted-foreground">{order.client.name}</p>
        </div>
        <div className="flex flex-col gap-2">
          <StatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <DeviceMobile size={18} className="text-muted-foreground" />
          <span className="font-medium">
            {order.device.brand} {order.device.model}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarBlank size={18} />
          <span>Entrega: {formatDateShort(order.estimatedDelivery)}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <CurrencyDollar size={18} weight="fill" className="text-accent" />
            <span className="font-semibold text-lg">
              {formatCurrency(order.estimatedCost)}
            </span>
          </div>
          <div className="flex gap-2">
            {order.client.tier && <ClientBadge tier={order.client.tier} />}
            {order.priority === 'urgent' && (
              <Badge className="bg-red-100 text-red-700 border-0">
                Urgente
              </Badge>
            )}
          </div>
        </div>

        {order.paymentStatus !== 'pending' && (
          <div className="pt-2 border-t space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-green-700 font-medium">Pagado: {formatCurrency(totalPaid)}</span>
              {order.paymentStatus === 'partial' && (
                <span className="text-red-700 font-medium">Pendiente: {formatCurrency(remainingBalance)}</span>
              )}
            </div>
            {order.paymentStatus === 'partial' && (
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${(totalPaid / order.estimatedCost) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}