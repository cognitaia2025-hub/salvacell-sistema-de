import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  WarningCircle,
  Package,
  TrendUp,
  TrendDown,
  CurrencyCircleDollar,
  Archive,
} from '@phosphor-icons/react'
import type { InventoryItem } from '@/lib/types'
import { formatCurrency } from '@/lib/mock-data'

interface InventoryStatsProps {
  items: InventoryItem[]
  onFilterLowStock: () => void
}

export function InventoryStats({ items, onFilterLowStock }: InventoryStatsProps) {
  const totalItems = items.length
  const totalValue = items.reduce(
    (sum, item) => sum + item.currentStock * item.buyPrice,
    0
  )
  const lowStockItems = items.filter((item) => item.currentStock < item.minStock)
  const outOfStockItems = items.filter((item) => item.currentStock === 0)
  const totalStockUnits = items.reduce((sum, item) => sum + item.currentStock, 0)

  const categoryBreakdown = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { count: 0, value: 0 }
    }
    acc[item.category].count += item.currentStock
    acc[item.category].value += item.currentStock * item.buyPrice
    return acc
  }, {} as Record<string, { count: number; value: number }>)

  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Package size={18} />
              Productos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{totalItems}</div>
            <p className="text-xs text-blue-700 mt-1">
              {totalStockUnits} unidades en stock
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <CurrencyCircleDollar size={18} />
              Valor del Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-green-700 mt-1">Precio de compra</p>
          </CardContent>
        </Card>

        <Card
          className={`border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 ${
            lowStockItems.length > 0 ? 'ring-2 ring-amber-400' : ''
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
              <WarningCircle size={18} weight="fill" />
              Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">
              {lowStockItems.length}
            </div>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs text-amber-700 hover:text-amber-900 mt-1"
              onClick={onFilterLowStock}
              disabled={lowStockItems.length === 0}
            >
              Ver productos afectados →
            </Button>
          </CardContent>
        </Card>

        <Card
          className={`border-red-200 bg-gradient-to-br from-red-50 to-red-100 ${
            outOfStockItems.length > 0 ? 'ring-2 ring-red-400' : ''
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <Archive size={18} />
              Sin Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">
              {outOfStockItems.length}
            </div>
            <p className="text-xs text-red-700 mt-1">
              {outOfStockItems.length === 0 ? '¡Todo disponible!' : 'Requieren reabastecimiento'}
            </p>
          </CardContent>
        </Card>
      </div>

      {topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendUp size={20} />
              Valor por Categoría (Top 5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategories.map(([category, data], index) => {
                const percentage = (data.value / totalValue) * 100
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {data.count} unidades
                        </span>
                      </div>
                      <span className="font-semibold">{formatCurrency(data.value)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
