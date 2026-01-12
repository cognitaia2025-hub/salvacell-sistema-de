import { useState } from 'react'
import { StatusBadge } from './StatusBadge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { StatusHistoryEntry } from '@/lib/types'
import { formatDate } from '@/lib/mock-data'
import { User, Image as ImageIcon } from '@phosphor-icons/react'

interface OrderTimelineProps {
  history: StatusHistoryEntry[]
}

export function OrderTimeline({ history }: OrderTimelineProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

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
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageIcon size={16} />
                  <span>{entry.photos.length} foto(s) adjunta(s)</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {entry.photos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPhoto(photo)}
                      className="w-24 h-24 rounded-md bg-muted border hover:border-primary transition-colors overflow-hidden"
                    >
                      <img
                        src={photo}
                        alt={`Foto ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {selectedPhoto && (
        <Dialog open onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl">
            <img
              src={selectedPhoto}
              alt="Foto ampliada"
              className="w-full rounded-lg"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}