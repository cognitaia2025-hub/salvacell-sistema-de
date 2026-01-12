import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OrderCard } from '@/components/OrderCard'
import { OrderDetailsDialog } from '@/components/OrderDetailsDialog'
import { NewOrderDialog } from '@/components/NewOrderDialog'
import { InventoryModule } from '@/components/InventoryModule'
import type { Order, InventoryItem } from '@/lib/types'
import { MOCK_ORDERS, MOCK_INVENTORY } from '@/lib/mock-data'
import {
  House,
  ClipboardText,
  Archive,
  ChartBar,
  GearSix,
  Plus,
  MagnifyingGlass,
  WarningCircle
} from '@phosphor-icons/react'

type ViewMode = 'dashboard' | 'orders' | 'inventory' | 'reports' | 'settings'

function Dashboard() {
  const [orders, setOrders] = useKV<Order[]>('orders', MOCK_ORDERS)
  const [inventory, setInventory] = useKV<InventoryItem[]>('inventory', MOCK_INVENTORY)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const ordersList = orders || []
  const inventoryList = inventory || []

  const filteredOrders = ordersList.filter((order) => {
    const matchesSearch =
      searchQuery === '' ||
      order.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.device.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.device.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.device.imei.includes(searchQuery)

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: ordersList.length,
    inProgress: ordersList.filter(
      (o) => !['delivered', 'cancelled'].includes(o.status)
    ).length,
    repaired: ordersList.filter((o) => o.status === 'repaired').length,
    urgent: ordersList.filter((o) => o.priority === 'urgent').length
  }

  const lowStockItems = inventoryList.filter((item) => item.currentStock < item.minStock)
  const outOfStockItems = inventoryList.filter((item) => item.currentStock === 0)
  const lowStockCount = lowStockItems.length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">SalvaCell</h1>
              <p className="text-sm text-muted-foreground">
                Sistema de Gestión de Reparaciones
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setShowNewOrder(true)}
              className="gap-2"
            >
              <Plus size={20} weight="bold" />
              Nueva Orden
            </Button>
          </div>
        </div>
      </header>

      <nav className="border-b bg-card sticky top-[73px] z-10">
        <div className="container mx-auto px-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="w-full justify-start border-b-0 bg-transparent h-auto p-0">
              <TabsTrigger value="dashboard" className="gap-2">
                <House size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <ClipboardText size={18} />
                <span className="hidden md:inline">Órdenes</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="gap-2">
                <Archive size={18} />
                <span className="hidden md:inline">Inventario</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <ChartBar size={18} />
                <span className="hidden md:inline">Reportes</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <GearSix size={18} />
                <span className="hidden md:inline">Configuración</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {viewMode === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-700 mb-1">
                  Total Órdenes
                </div>
                <div className="text-3xl font-bold text-blue-900">
                  {stats.total}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="text-sm font-medium text-purple-700 mb-1">
                  En Proceso
                </div>
                <div className="text-3xl font-bold text-purple-900">
                  {stats.inProgress}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-700 mb-1">
                  Reparadas
                </div>
                <div className="text-3xl font-bold text-green-900">
                  {stats.repaired}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                <div className="text-sm font-medium text-red-700 mb-1">
                  Urgentes
                </div>
                <div className="text-3xl font-bold text-red-900">
                  {stats.urgent}
                </div>
              </div>
            </div>

            {lowStockCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <WarningCircle size={24} className="text-amber-600 flex-shrink-0" weight="fill" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    Alerta de Inventario
                  </h3>
                  <p className="text-sm text-amber-700 mb-3">
                    {lowStockCount} producto(s) por debajo del stock mínimo
                    {outOfStockItems.length > 0 && ` (${outOfStockItems.length} sin stock)`}.{' '}
                    <button
                      onClick={() => setViewMode('inventory')}
                      className="underline font-medium hover:text-amber-900"
                    >
                      Ver inventario
                    </button>
                  </p>
                  <div className="space-y-1">
                    {lowStockItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="text-xs bg-white/50 p-2 rounded flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-amber-900">
                          {item.currentStock === 0 ? (
                            <span className="font-bold">Sin stock</span>
                          ) : (
                            <>Stock: {item.currentStock} / {item.minStock} mín</>
                          )}
                        </span>
                      </div>
                    ))}
                    {lowStockItems.length > 3 && (
                      <div className="text-xs text-amber-700 pt-1">
                        +{lowStockItems.length - 3} producto(s) más
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-4">Órdenes Activas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ordersList
                  .filter((o) => !['delivered', 'cancelled'].includes(o.status))
                  .slice(0, 6)
                  .map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={() => setSelectedOrder(order)}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Buscar por folio, cliente, IMEI..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="received">Recibido</SelectItem>
                  <SelectItem value="diagnosing">En Diagnóstico</SelectItem>
                  <SelectItem value="waiting_parts">Esperando Repuestos</SelectItem>
                  <SelectItem value="in_repair">En Reparación</SelectItem>
                  <SelectItem value="repaired">Reparado</SelectItem>
                  <SelectItem value="delivered">Entregado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => setSelectedOrder(order)}
                />
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No se encontraron órdenes
                </p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'inventory' && <InventoryModule />}

        {viewMode === 'reports' && (
          <div className="text-center py-12">
            <ChartBar size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Módulo de Reportes</h2>
            <p className="text-muted-foreground">
              Análisis y reportes del negocio próximamente
            </p>
          </div>
        )}

        {viewMode === 'settings' && (
          <div className="text-center py-12">
            <GearSix size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Configuración</h2>
            <p className="text-muted-foreground">
              Ajustes del sistema próximamente
            </p>
          </div>
        )}
      </main>

      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={(updatedOrder) => {
            setOrders((currentOrders) =>
              (currentOrders || []).map((o) =>
                o.id === updatedOrder.id ? updatedOrder : o
              )
            )
            setSelectedOrder(updatedOrder)
          }}
        />
      )}

      {showNewOrder && (
        <NewOrderDialog
          onClose={() => setShowNewOrder(false)}
          onSave={(newOrder) => {
            setOrders((currentOrders) => [newOrder, ...(currentOrders || [])])
            setShowNewOrder(false)
          }}
        />
      )}
    </div>
  )
}

export default Dashboard