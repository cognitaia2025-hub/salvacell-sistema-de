import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  PencilSimple,
  Trash,
  TrendUp,
  TrendDown,
  WarningCircle,
  CheckCircle,
} from '@phosphor-icons/react'
import type { InventoryItem } from '@/lib/types'
import { formatCurrency } from '@/lib/mock-data'

interface InventoryTableProps {
  items: InventoryItem[]
  onEdit: (item: InventoryItem) => void
  onDelete: (id: string) => void
  onMovement: (item: InventoryItem) => void
}

export function InventoryTable({ items, onEdit, onDelete, onMovement }: InventoryTableProps) {
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'category'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const sortedItems = [...items].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1
    if (sortBy === 'stock') {
      return (a.currentStock - b.currentStock) * multiplier
    }
    if (sortBy === 'category') {
      return a.category.localeCompare(b.category) * multiplier
    }
    return a.name.localeCompare(b.name) * multiplier
  })

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return {
        label: 'Sin stock',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: <WarningCircle size={16} weight="fill" />
      }
    }
    if (item.currentStock < item.minStock) {
      return {
        label: 'Stock bajo',
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: <WarningCircle size={16} weight="fill" />
      }
    }
    return {
      label: 'Stock normal',
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: <CheckCircle size={16} weight="fill" />
    }
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('name')}
                className="font-semibold"
              >
                Producto
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('category')}
                className="font-semibold"
              >
                Categoría
              </Button>
            </TableHead>
            <TableHead className="text-center">SKU</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('stock')}
                className="font-semibold"
              >
                Stock
              </Button>
            </TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-right">Precio Compra</TableHead>
            <TableHead className="text-right">Precio Venta</TableHead>
            <TableHead className="text-center">Ubicación</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                No hay productos en el inventario
              </TableCell>
            </TableRow>
          ) : (
            sortedItems.map((item) => {
              const status = getStockStatus(item)
              return (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm text-muted-foreground">
                    {item.sku}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{item.currentStock}</span>
                      <span className="text-muted-foreground text-sm">
                        / {item.minStock} mín
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${status.color} gap-1`}>
                      {status.icon}
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-muted-foreground">
                    {formatCurrency(item.buyPrice)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {item.sellPrice > 0 ? formatCurrency(item.sellPrice) : '-'}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {item.location || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMovement(item)}
                        title="Registrar movimiento"
                      >
                        <TrendUp size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                        title="Editar producto"
                      >
                        <PencilSimple size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                        className="text-destructive hover:text-destructive"
                        title="Eliminar producto"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
