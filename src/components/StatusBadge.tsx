import { Badge } from '@/components/ui/badge'
import { ORDER_STATUS_CONFIG, type OrderStatus } from '@/lib/types'
import {
  CircleDashed,
  Hourglass,
  Gear,
  CheckCircle,
  XCircle,
  Package
} from '@phosphor-icons/react'

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

const STATUS_ICONS = {
  received: Package,
  diagnosing: CircleDashed,
  waiting_parts: Hourglass,
  in_repair: Gear,
  repaired: CheckCircle,
  delivered: CheckCircle,
  cancelled: XCircle
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status]
  const Icon = STATUS_ICONS[status]

  return (
    <Badge
      className={`${config.color} ${config.bgColor} border-0 font-medium flex items-center gap-1.5 ${className || ''}`}
    >
      <Icon size={16} weight="fill" />
      {config.label}
    </Badge>
  )
}