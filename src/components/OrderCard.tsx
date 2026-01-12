import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from './StatusBadge'
import { ClientBadge } from './ClientBadge'
import type { Order } from '@/lib/types'
import { formatCurrency, formatDateShort } from '@/lib/mock-data'
import { DeviceMobile, CalendarBlank, CurrencyDollar } from '@phosphor-icons/react'

interface OrderCardProps {
  order: Order
  onClick?: () => void
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const isPaid = order.paymentStatus === 'paid'
  const isPartial = order.paymentStatus === 'partial'

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
        <StatusBadge status={order.status} />
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

        {(isPartial || isPaid) && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            {isPaid && '✓ Pagado completamente'}
            {isPartial &&
              `Anticipo: ${formatCurrency(order.payments.reduce((sum, p) => sum + p.amount, 0))}`}
          </div>
        )}
      </div>
    </Card>
  )
}