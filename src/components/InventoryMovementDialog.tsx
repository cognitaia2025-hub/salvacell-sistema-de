import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { TrendUp, TrendDown, ArrowsClockwise } from '@phosphor-icons/react'
import type { InventoryItem, InventoryMovement } from '@/lib/types'

interface InventoryMovementDialogProps {
  item: InventoryItem
  onClose: () => void
  onSave: (movement: InventoryMovement, newStock: number) => void
}

export function InventoryMovementDialog({
  item,
  onClose,
  onSave,
}: InventoryMovementDialogProps) {
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjustment'>('in')
  const [quantity, setQuantity] = useState<number>(1)
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const newStock = 
    movementType === 'in'
      ? item.currentStock + quantity
      : movementType === 'out'
      ? item.currentStock - quantity
      : quantity

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (quantity <= 0 && movementType !== 'adjustment') {
      newErrors.quantity = 'La cantidad debe ser mayor a 0'
    }
    if (movementType === 'adjustment' && quantity < 0) {
      newErrors.quantity = 'El stock no puede ser negativo'
    }
    if (movementType === 'out' && quantity > item.currentStock) {
      newErrors.quantity = `No hay suficiente stock (disponible: ${item.currentStock})`
    }
    if (!reason.trim()) {
      newErrors.reason = 'El motivo es requerido'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const movement: InventoryMovement = {
      id: crypto.randomUUID(),
      itemId: item.id,
      type: movementType,
      quantity,
      reason,
      userId: '1',
      timestamp: new Date().toISOString(),
    }

    onSave(movement, newStock)
    onClose()
  }

  const getTypeConfig = () => {
    switch (movementType) {
      case 'in':
        return {
          label: 'Entrada',
          icon: <TrendUp size={20} />,
          color: 'bg-green-100 text-green-700 border-green-200',
          description: 'Agregar productos al inventario (compra, devolución)',
        }
      case 'out':
        return {
          label: 'Salida',
          icon: <TrendDown size={20} />,
          color: 'bg-red-100 text-red-700 border-red-200',
          description: 'Retirar productos del inventario (venta, uso en reparación)',
        }
      case 'adjustment':
        return {
          label: 'Ajuste',
          icon: <ArrowsClockwise size={20} />,
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          description: 'Ajustar stock a cantidad exacta (corrección, inventario físico)',
        }
    }
  }

  const typeConfig = getTypeConfig()

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento</DialogTitle>
          <DialogDescription>
            Registra una entrada, salida o ajuste de inventario
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-sm text-muted-foreground font-medium">Producto:</div>
            <div className="font-semibold">{item.name}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground font-medium">Stock actual:</div>
            <div className="text-2xl font-bold text-primary">{item.currentStock}</div>
            <div className="text-sm text-muted-foreground">unidades</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Tipo de Movimiento *</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={movementType === 'in' ? 'default' : 'outline'}
                onClick={() => {
                  setMovementType('in')
                  setErrors({})
                }}
                className="h-auto py-3 flex flex-col items-center gap-2"
              >
                <TrendUp size={24} />
                <span className="text-sm">Entrada</span>
              </Button>
              <Button
                type="button"
                variant={movementType === 'out' ? 'default' : 'outline'}
                onClick={() => {
                  setMovementType('out')
                  setErrors({})
                }}
                className="h-auto py-3 flex flex-col items-center gap-2"
              >
                <TrendDown size={24} />
                <span className="text-sm">Salida</span>
              </Button>
              <Button
                type="button"
                variant={movementType === 'adjustment' ? 'default' : 'outline'}
                onClick={() => {
                  setMovementType('adjustment')
                  setErrors({})
                }}
                className="h-auto py-3 flex flex-col items-center gap-2"
              >
                <ArrowsClockwise size={24} />
                <span className="text-sm">Ajuste</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{typeConfig.description}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {movementType === 'adjustment' ? 'Nueva Cantidad *' : 'Cantidad *'}
            </Label>
            <Input
              id="quantity"
              type="number"
              min={movementType === 'adjustment' ? 0 : 1}
              value={quantity}
              onChange={(e) => {
                setQuantity(parseInt(e.target.value) || 0)
                setErrors({ ...errors, quantity: '' })
              }}
              className={errors.quantity ? 'border-destructive' : ''}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo / Referencia *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setErrors({ ...errors, reason: '' })
              }}
              placeholder={
                movementType === 'in'
                  ? 'Ej: Compra a proveedor XYZ, Factura #12345'
                  : movementType === 'out'
                  ? 'Ej: Usado en orden SC-2024-001'
                  : 'Ej: Inventario físico, conteo manual'
              }
              rows={3}
              className={errors.reason ? 'border-destructive' : ''}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason}</p>
            )}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Nuevo stock:</div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">{newStock}</span>
                <span className="text-sm text-muted-foreground">unidades</span>
              </div>
            </div>
            {newStock < item.minStock && (
              <div className="mt-3 pt-3 border-t border-border">
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  ⚠️ Stock quedará por debajo del mínimo ({item.minStock})
                </Badge>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Registrar Movimiento</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
