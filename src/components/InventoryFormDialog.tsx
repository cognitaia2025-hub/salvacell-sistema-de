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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { InventoryItem } from '@/lib/types'

interface InventoryFormDialogProps {
  item: InventoryItem | null
  onClose: () => void
  onSave: (item: InventoryItem) => void
}

const CATEGORIES = [
  'Pantallas',
  'Baterías',
  'Cámaras',
  'Bocinas',
  'Micrófonos',
  'Conectores',
  'Flex',
  'Herramientas',
  'Adhesivos',
  'Otros'
]

export function InventoryFormDialog({ item, onClose, onSave }: InventoryFormDialogProps) {
  const [formData, setFormData] = useState<InventoryItem>(
    item || {
      id: crypto.randomUUID(),
      sku: '',
      name: '',
      category: 'Pantallas',
      buyPrice: 0,
      sellPrice: 0,
      currentStock: 0,
      minStock: 1,
      location: ''
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.sku.trim()) {
      newErrors.sku = 'El SKU es requerido'
    }
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }
    if (formData.buyPrice < 0) {
      newErrors.buyPrice = 'El precio debe ser mayor o igual a 0'
    }
    if (formData.sellPrice < 0) {
      newErrors.sellPrice = 'El precio debe ser mayor o igual a 0'
    }
    if (formData.currentStock < 0) {
      newErrors.currentStock = 'El stock no puede ser negativo'
    }
    if (formData.minStock < 0) {
      newErrors.minStock = 'El stock mínimo no puede ser negativo'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData)
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            {item
              ? 'Modifica los datos del producto en el inventario'
              : 'Agrega un nuevo producto al inventario'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU / Código *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => {
                  setFormData({ ...formData, sku: e.target.value.toUpperCase() })
                  setErrors({ ...errors, sku: '' })
                }}
                placeholder="PANT-IP13-BLK"
                className={errors.sku ? 'border-destructive' : ''}
              />
              {errors.sku && (
                <p className="text-sm text-destructive">{errors.sku}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Producto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                setErrors({ ...errors, name: '' })
              }}
              placeholder="Pantalla OLED iPhone 13 Pro"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyPrice">Precio de Compra *</Label>
              <Input
                id="buyPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.buyPrice}
                onChange={(e) => {
                  setFormData({ ...formData, buyPrice: parseFloat(e.target.value) || 0 })
                  setErrors({ ...errors, buyPrice: '' })
                }}
                placeholder="2500.00"
                className={errors.buyPrice ? 'border-destructive' : ''}
              />
              {errors.buyPrice && (
                <p className="text-sm text-destructive">{errors.buyPrice}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellPrice">Precio de Venta</Label>
              <Input
                id="sellPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.sellPrice}
                onChange={(e) => {
                  setFormData({ ...formData, sellPrice: parseFloat(e.target.value) || 0 })
                  setErrors({ ...errors, sellPrice: '' })
                }}
                placeholder="3500.00"
                className={errors.sellPrice ? 'border-destructive' : ''}
              />
              {errors.sellPrice && (
                <p className="text-sm text-destructive">{errors.sellPrice}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Dejar en 0 si es herramienta o material no vendible
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentStock">Stock Actual *</Label>
              <Input
                id="currentStock"
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => {
                  setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })
                  setErrors({ ...errors, currentStock: '' })
                }}
                placeholder="5"
                className={errors.currentStock ? 'border-destructive' : ''}
                disabled={!!item}
              />
              {errors.currentStock && (
                <p className="text-sm text-destructive">{errors.currentStock}</p>
              )}
              {item && (
                <p className="text-xs text-muted-foreground">
                  Usa "Registrar Movimiento" para modificar el stock
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Stock Mínimo *</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => {
                  setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })
                  setErrors({ ...errors, minStock: '' })
                }}
                placeholder="3"
                className={errors.minStock ? 'border-destructive' : ''}
              />
              {errors.minStock && (
                <p className="text-sm text-destructive">{errors.minStock}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación en Bodega</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Estante A-12"
            />
            <p className="text-xs text-muted-foreground">
              Ej: Estante A-12, Cajón C-05, etc.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {item ? 'Guardar Cambios' : 'Agregar Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
