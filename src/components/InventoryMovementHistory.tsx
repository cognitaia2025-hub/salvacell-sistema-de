import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { TrendUp, TrendDown, ArrowsClockwise, User, Clock } from '@phosphor-icons/react'
import type { InventoryMovement, InventoryItem } from '@/lib/types'
import { formatDate } from '@/lib/mock-data'

interface InventoryMovementHistoryProps {
  movements: InventoryMovement[]
  items: InventoryItem[]
}

export function InventoryMovementHistory({
  movements,
  items,
}: InventoryMovementHistoryProps) {
  const sortedMovements = [...movements].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const getItemName = (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    return item?.name || 'Producto desconocido'
  }

  const getMovementIcon = (type: InventoryMovement['type']) => {
    switch (type) {
      case 'in':
        return <TrendUp size={20} className="text-green-600" weight="bold" />
      case 'out':
        return <TrendDown size={20} className="text-red-600" weight="bold" />
      case 'adjustment':
        return <ArrowsClockwise size={20} className="text-blue-600" weight="bold" />
    }
  }

  const getMovementLabel = (type: InventoryMovement['type']) => {
    switch (type) {
      case 'in':
        return 'Entrada'
      case 'out':
        return 'Salida'
      case 'adjustment':
        return 'Ajuste'
    }
  }

  const getMovementBadgeColor = (type: InventoryMovement['type']) => {
    switch (type) {
      case 'in':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'out':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'adjustment':
        return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  if (sortedMovements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p>No hay movimientos registrados</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Historial de Movimientos</span>
          <Badge variant="outline">{sortedMovements.length} registros</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {sortedMovements.map((movement, index) => (
              <div key={movement.id}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getMovementIcon(movement.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm">
                          {getItemName(movement.itemId)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${getMovementBadgeColor(movement.type)} text-xs`}>
                            {getMovementLabel(movement.type)}
                          </Badge>
                          <span className="text-sm font-semibold">
                            {movement.type === 'adjustment'
                              ? `→ ${movement.quantity}`
                              : movement.type === 'in'
                              ? `+${movement.quantity}`
                              : `-${movement.quantity}`}
                          </span>
                          {movement.type !== 'adjustment' && (
                            <span className="text-xs text-muted-foreground">unidades</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {formatDate(movement.timestamp)}
                        </div>
                      </div>
                    </div>
                    {movement.reason && (
                      <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        {movement.reason}
                      </div>
                    )}
                    {movement.orderId && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>Vinculado a orden:</span>
                        <span className="font-mono font-semibold">{movement.orderId}</span>
                      </div>
                    )}
                  </div>
                </div>
                {index < sortedMovements.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
