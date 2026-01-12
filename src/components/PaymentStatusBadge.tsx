import { Badge } from '@/components/ui/badge'
import type { PaymentStatus } from '@/lib/types'
import { CheckCircle, WarningCircle, Clock } from '@phosphor-icons/react'

interface PaymentStatusBadgeProps {
  status: PaymentStatus
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
          <Clock size={14} weight="fill" />
          Pendiente
        </Badge>
      )
    case 'partial':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
          <WarningCircle size={14} weight="fill" />
          Pago Parcial
        </Badge>
      )
    case 'paid':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
          <CheckCircle size={14} weight="fill" />
          Pagado
        </Badge>
      )
  }
}
