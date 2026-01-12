import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { InventoryTable } from '@/components/InventoryTable'
import { InventoryFormDialog } from '@/components/InventoryFormDialog'
import { InventoryMovementDialog } from '@/components/InventoryMovementDialog'
import { InventoryStats } from '@/components/InventoryStats'
import { InventoryMovementHistory } from '@/components/InventoryMovementHistory'
import { InventorySeedDialog } from '@/components/InventorySeedDialog'
import { Plus, MagnifyingGlass, Funnel, Archive } from '@phosphor-icons/react'
import { MOCK_INVENTORY } from '@/lib/mock-data'
import type { InventoryItem, InventoryMovement } from '@/lib/types'
import { toast } from 'sonner'

export function InventoryModule() {
  const [items, setItems] = useKV<InventoryItem[]>('inventory', MOCK_INVENTORY)
  const [movements, setMovements] = useKV<InventoryMovement[]>('inventory-movements', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'movements'>('overview')
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [showNewItemDialog, setShowNewItemDialog] = useState(false)
  const [movementItem, setMovementItem] = useState<InventoryItem | null>(null)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)

  useEffect(() => {
    const handleInventoryUpdate = async () => {
      const updatedItems = await window.spark.kv.get<InventoryItem[]>('inventory')
      if (updatedItems) {
        setItems(updatedItems)
      }
    }

    window.addEventListener('inventory-updated', handleInventoryUpdate)
    return () => {
      window.removeEventListener('inventory-updated', handleInventoryUpdate)
    }
  }, [setItems])

  const itemsList = items || []
  const movementsList = movements || []

  const categories = Array.from(new Set(itemsList.map((item) => item.category))).sort()

  const filteredItems = itemsList.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && item.currentStock < item.minStock) ||
      (stockFilter === 'out' && item.currentStock === 0) ||
      (stockFilter === 'normal' && item.currentStock >= item.minStock)

    return matchesSearch && matchesCategory && matchesStock
  })

  const handleSaveItem = (item: InventoryItem) => {
    const exists = itemsList.find((i) => i.id === item.id)
    
    if (exists) {
      setItems((currentItems) =>
        (currentItems || []).map((i) => (i.id === item.id ? item : i))
      )
      toast.success('Producto actualizado correctamente')
    } else {
      setItems((currentItems) => [...(currentItems || []), item])
      toast.success('Producto agregado al inventario')
    }
    
    setEditingItem(null)
    setShowNewItemDialog(false)
  }

  const handleDeleteItem = (id: string) => {
    setDeleteItemId(id)
  }

  const confirmDelete = () => {
    if (!deleteItemId) return

    setItems((currentItems) =>
      (currentItems || []).filter((i) => i.id !== deleteItemId)
    )
    
    toast.success('Producto eliminado del inventario')
    setDeleteItemId(null)
  }

  const handleSaveMovement = (movement: InventoryMovement, newStock: number) => {
    setMovements((currentMovements) => [movement, ...(currentMovements || [])])
    
    setItems((currentItems) =>
      (currentItems || []).map((item) =>
        item.id === movement.itemId ? { ...item, currentStock: newStock } : item
      )
    )

    const item = itemsList.find((i) => i.id === movement.itemId)
    
    if (movement.type === 'in') {
      toast.success(`Entrada registrada: +${movement.quantity} ${item?.name}`)
    } else if (movement.type === 'out') {
      toast.success(`Salida registrada: -${movement.quantity} ${item?.name}`)
    } else {
      toast.success(`Ajuste registrado: ${item?.name} → ${newStock} unidades`)
    }

    if (newStock < (item?.minStock || 0)) {
      toast.warning(`⚠️ Stock bajo: ${item?.name}`, {
        description: `Stock actual (${newStock}) por debajo del mínimo (${item?.minStock})`
      })
    }

    setMovementItem(null)
  }

  const handleFilterLowStock = () => {
    setStockFilter('low')
    setActiveTab('overview')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Inventario</h2>
          <p className="text-muted-foreground">
            Gestión de repuestos y control de stock
          </p>
        </div>
        <div className="flex gap-2">
          <InventorySeedDialog />
          <Button size="lg" onClick={() => setShowNewItemDialog(true)} className="gap-2">
            <Plus size={20} weight="bold" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="overview">
            <Archive size={18} className="mr-2" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="movements">
            <Funnel size={18} className="mr-2" />
            Movimientos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <InventoryStats items={itemsList} onFilterLowStock={handleFilterLowStock} />

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Buscar por nombre, SKU o categoría..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estado de stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="normal">Stock normal</SelectItem>
                <SelectItem value="low">Stock bajo</SelectItem>
                <SelectItem value="out">Sin stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <InventoryTable
            items={filteredItems}
            onEdit={setEditingItem}
            onDelete={handleDeleteItem}
            onMovement={setMovementItem}
          />

          {filteredItems.length === 0 && itemsList.length > 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No se encontraron productos con los filtros aplicados
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('')
                  setCategoryFilter('all')
                  setStockFilter('all')
                }}
                className="mt-2"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="movements" className="space-y-6 mt-6">
          <InventoryMovementHistory movements={movementsList} items={itemsList} />
        </TabsContent>
      </Tabs>

      {(editingItem || showNewItemDialog) && (
        <InventoryFormDialog
          item={editingItem}
          onClose={() => {
            setEditingItem(null)
            setShowNewItemDialog(false)
          }}
          onSave={handleSaveItem}
        />
      )}

      {movementItem && (
        <InventoryMovementDialog
          item={movementItem}
          onClose={() => setMovementItem(null)}
          onSave={handleSaveMovement}
        />
      )}

      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente
              del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
