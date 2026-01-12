import { Badge } from '@/components/ui/badge'
import { CLIENT_TIER_CONFIG, type ClientTier } from '@/lib/types'
import { User, Fire, Star } from '@phosphor-icons/react'

interface ClientBadgeProps {
  tier: ClientTier
  className?: string
}

const TIER_ICONS = {
  new: User,
  frequent: Fire,
  vip: Star
}

export function ClientBadge({ tier, className }: ClientBadgeProps) {
  const config = CLIENT_TIER_CONFIG[tier]
  const Icon = TIER_ICONS[tier]

  return (
    <Badge
      variant="outline"
      className={`${config.color} border-current flex items-center gap-1 ${className || ''}`}
    >
      <Icon size={14} weight="fill" />
      {config.label}
    </Badge>
  )
}