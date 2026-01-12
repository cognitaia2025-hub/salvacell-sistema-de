import { StatusBadge } from './StatusBadge'
import type { StatusHistoryEntry } from '@/lib/types'
import { formatDate } from '@/lib/mock-data'
import { User } from '@phosphor-icons/react'

interface OrderTimelineProps {
  history: StatusHistoryEntry[]
}

export function OrderTimeline({ history }: OrderTimelineProps) {
  return (
    <div className="space-y-6">
      {history.map((entry, index) => (
        <div key={entry.id} className="relative pl-8">
          {index < history.length - 1 && (
            <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border -translate-x-1/2" />
          )}
          
          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={entry.status} />
              <span className="text-sm text-muted-foreground">
                {formatDate(entry.timestamp)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User size={16} />
              <span>{entry.userName}</span>
            </div>

            {entry.notes && (
              <p className="text-sm bg-muted p-3 rounded-md border">
                {entry.notes}
              </p>
            )}

            {entry.photos && entry.photos.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {entry.photos.map((photo, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded-md bg-muted border flex items-center justify-center text-xs text-muted-foreground"
                  >
                    📷 Foto {i + 1}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}