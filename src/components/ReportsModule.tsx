import { useMemo, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Order, InventoryItem, InventoryMovement } from '@/lib/types'
import { MOCK_ORDERS, MOCK_INVENTORY, formatCurrency, formatDateShort } from '@/lib/mock-data'
import {
  ChartBar,
  TrendUp,
  TrendDown,
  Package,
  Users,
  CurrencyCircleDollar,
  Clock,
  CalendarBlank,
  ArrowRight,
  Star,
  Fire
} from '@phosphor-icons/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

type ReportPeriod = '7d' | '30d' | '90d' | '1y' | 'all'

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2']

export function ReportsModule() {
  const [orders] = useKV<Order[]>('orders', MOCK_ORDERS)
  const [inventory] = useKV<InventoryItem[]>('inventory', MOCK_INVENTORY)
  const [movements] = useKV<InventoryMovement[]>('inventory_movements', [])
  const [period, setPeriod] = useState<ReportPeriod>('30d')

  const ordersList = orders || []
  const inventoryList = inventory || []
  const movementsList = movements || []

  // Filter orders by period
  const filteredOrders = useMemo(() => {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        return ordersList
    }

    return ordersList.filter(o => new Date(o.createdAt) >= startDate)
  }, [ordersList, period])

  // Operational stats
  const operationalStats = useMemo(() => {
    const total = filteredOrders.length
    const delivered = filteredOrders.filter(o => o.status === 'delivered').length
    const inProgress = filteredOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length
    const cancelled = filteredOrders.filter(o => o.status === 'cancelled').length
    const urgent = filteredOrders.filter(o => o.priority === 'urgent').length

    // Calculate average repair time (from received to delivered)
    const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered')
    let avgRepairTime = 0
    if (deliveredOrders.length > 0) {
      const totalTime = deliveredOrders.reduce((sum, order) => {
        const deliveredEntry = order.statusHistory.find(h => h.status === 'delivered')
        if (deliveredEntry) {
          const diff = new Date(deliveredEntry.timestamp).getTime() - new Date(order.createdAt).getTime()
          return sum + diff
        }
        return sum
      }, 0)
      avgRepairTime = totalTime / deliveredOrders.length / (1000 * 60 * 60 * 24) // in days
    }

    return { total, delivered, inProgress, cancelled, urgent, avgRepairTime }
  }, [filteredOrders])

  // Financial stats
  const financialStats = useMemo(() => {
    const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered')
    const totalRevenue = deliveredOrders.reduce((sum, o) => {
      return sum + o.payments.reduce((psum, p) => psum + p.amount, 0)
    }, 0)

    const totalPending = filteredOrders
      .filter(o => o.paymentStatus !== 'paid' && o.status !== 'cancelled')
      .reduce((sum, o) => {
        const paid = o.payments.reduce((psum, p) => psum + p.amount, 0)
        return sum + (o.estimatedCost - paid)
      }, 0)

    // Revenue by payment method
    const byMethod: Record<string, number> = { cash: 0, card: 0, transfer: 0 }
    filteredOrders.forEach(o => {
      o.payments.forEach(p => {
        byMethod[p.method] = (byMethod[p.method] || 0) + p.amount
      })
    })

    return { totalRevenue, totalPending, byMethod }
  }, [filteredOrders])

  // Services distribution
  const servicesDistribution = useMemo(() => {
    const serviceCount: Record<string, number> = {}
    filteredOrders.forEach(order => {
      const services = order.services.split(',').map(s => s.trim())
      services.forEach(service => {
        const key = service.toLowerCase().includes('pantalla') ? 'Cambio de Pantalla'
          : service.toLowerCase().includes('batería') ? 'Cambio de Batería'
          : service.toLowerCase().includes('diagnóstico') ? 'Diagnóstico'
          : service.toLowerCase().includes('software') ? 'Reparación Software'
          : 'Otros'
        serviceCount[key] = (serviceCount[key] || 0) + 1
      })
    })

    return Object.entries(serviceCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredOrders])

  // Orders by status
  const ordersByStatus = useMemo(() => {
    const statusCount: Record<string, number> = {}
    const statusLabels: Record<string, string> = {
      received: 'Recibido',
      diagnosing: 'Diagnóstico',
      waiting_parts: 'Esp. Repuestos',
      in_repair: 'En Reparación',
      repaired: 'Reparado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    }
    filteredOrders.forEach(order => {
      const label = statusLabels[order.status] || order.status
      statusCount[label] = (statusCount[label] || 0) + 1
    })

    return Object.entries(statusCount)
      .map(([name, value]) => ({ name, value }))
  }, [filteredOrders])

  // Inventory stats
  const inventoryStats = useMemo(() => {
    const totalValue = inventoryList.reduce((sum, item) => sum + (item.buyPrice * item.currentStock), 0)
    const sellValue = inventoryList.reduce((sum, item) => sum + (item.sellPrice * item.currentStock), 0)
    const lowStock = inventoryList.filter(i => i.currentStock <= i.minStock && i.currentStock > 0).length
    const outOfStock = inventoryList.filter(i => i.currentStock === 0).length

    // Value by category
    const byCategory: Record<string, number> = {}
    inventoryList.forEach(item => {
      byCategory[item.category] = (byCategory[item.category] || 0) + (item.buyPrice * item.currentStock)
    })

    const categoryData = Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    return { totalValue, sellValue, lowStock, outOfStock, categoryData }
  }, [inventoryList])

  // Client stats
  const clientStats = useMemo(() => {
    const clientMap: Record<string, { name: string, orders: number, spent: number }> = {}
    filteredOrders.forEach(order => {
      const clientId = order.clientId
      if (!clientMap[clientId]) {
        clientMap[clientId] = {
          name: order.client.name,
          orders: 0,
          spent: 0
        }
      }
      clientMap[clientId].orders++
      clientMap[clientId].spent += order.payments.reduce((sum, p) => sum + p.amount, 0)
    })

    const clients = Object.values(clientMap)
    const totalClients = clients.length
    const recurring = clients.filter(c => c.orders > 1).length
    const newClients = clients.filter(c => c.orders === 1).length

    const topClients = clients
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5)

    return { totalClients, recurring, newClients, topClients }
  }, [filteredOrders])

  // Orders trend (by date)
  const ordersTrend = useMemo(() => {
    const dateMap: Record<string, number> = {}
    filteredOrders.forEach(order => {
      const date = formatDateShort(order.createdAt)
      dateMap[date] = (dateMap[date] || 0) + 1
    })

    return Object.entries(dateMap)
      .map(([date, count]) => ({ date, orders: count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14) // Last 14 days max
  }, [filteredOrders])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reportes y Analítica</h2>
          <p className="text-muted-foreground">
            Análisis del rendimiento del negocio
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
            <SelectTrigger className="w-[180px]">
              <CalendarBlank size={16} className="mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
              <SelectItem value="all">Todo el tiempo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="operational" className="space-y-6">
        <TabsList>
          <TabsTrigger value="operational" className="gap-2">
            <ChartBar size={16} />
            Operativos
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <CurrencyCircleDollar size={16} />
            Financieros
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Package size={16} />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="clients" className="gap-2">
            <Users size={16} />
            Clientes
          </TabsTrigger>
        </TabsList>

        {/* Operational Reports */}
        <TabsContent value="operational" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Órdenes</CardDescription>
                <CardTitle className="text-3xl">{operationalStats.total}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {operationalStats.urgent} urgentes
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Entregadas</CardDescription>
                <CardTitle className="text-3xl text-green-600">{operationalStats.delivered}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {operationalStats.total > 0 
                    ? Math.round((operationalStats.delivered / operationalStats.total) * 100) 
                    : 0}% completadas
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>En Proceso</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{operationalStats.inProgress}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Actualmente activas
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Tiempo Promedio</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Clock size={28} className="text-muted-foreground" />
                  {operationalStats.avgRepairTime.toFixed(1)}d
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Días hasta entrega
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Órdenes por Estado</CardTitle>
                <CardDescription>Distribución actual de órdenes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ordersByStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Servicios Más Solicitados</CardTitle>
                <CardDescription>Tipos de reparación más comunes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={servicesDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {servicesDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Orders Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Órdenes</CardTitle>
              <CardDescription>Órdenes recibidas en el período</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={ordersTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Reports */}
        <TabsContent value="financial" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-green-700">Ingresos Totales</CardDescription>
                <CardTitle className="text-3xl text-green-900">
                  {formatCurrency(financialStats.totalRevenue)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm text-green-700">
                  <TrendUp size={16} />
                  Pagos recibidos
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-amber-700">Cuentas por Cobrar</CardDescription>
                <CardTitle className="text-3xl text-amber-900">
                  {formatCurrency(financialStats.totalPending)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm text-amber-700">
                  <Clock size={16} />
                  Pendiente de pago
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Ticket Promedio</CardDescription>
                <CardTitle className="text-3xl">
                  {formatCurrency(
                    operationalStats.delivered > 0 
                      ? financialStats.totalRevenue / operationalStats.delivered 
                      : 0
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Por orden entregada
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Ingresos por Método de Pago</CardTitle>
              <CardDescription>Distribución de pagos recibidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: 'cash', label: 'Efectivo', color: 'bg-green-500' },
                  { key: 'card', label: 'Tarjeta', color: 'bg-blue-500' },
                  { key: 'transfer', label: 'Transferencia', color: 'bg-purple-500' }
                ].map(method => {
                  const amount = financialStats.byMethod[method.key] || 0
                  const percent = financialStats.totalRevenue > 0 
                    ? (amount / financialStats.totalRevenue) * 100 
                    : 0

                  return (
                    <div key={method.key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{method.label}</span>
                        <span className="font-medium">{formatCurrency(amount)} ({percent.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${method.color} transition-all`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Reports */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Valor del Inventario</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(inventoryStats.totalValue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Costo de adquisición
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Valor Potencial</CardDescription>
                <CardTitle className="text-2xl text-green-600">{formatCurrency(inventoryStats.sellValue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Precio de venta
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Stock Bajo</CardDescription>
                <CardTitle className="text-2xl text-amber-600">{inventoryStats.lowStock}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Necesitan reabastecimiento
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Sin Stock</CardDescription>
                <CardTitle className="text-2xl text-red-600">{inventoryStats.outOfStock}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Productos agotados
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Value by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Valor por Categoría</CardTitle>
              <CardDescription>Distribución del inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inventoryStats.categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Low Stock Alert List */}
          {inventoryStats.lowStock > 0 && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="text-amber-900">⚠️ Productos con Stock Bajo</CardTitle>
                <CardDescription className="text-amber-700">
                  Requieren reabastecimiento pronto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inventoryList
                    .filter(i => i.currentStock <= i.minStock && i.currentStock > 0)
                    .map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-amber-700">{item.currentStock} / {item.minStock}</div>
                          <div className="text-sm text-muted-foreground">Actual / Mínimo</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Client Reports */}
        <TabsContent value="clients" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Clientes</CardDescription>
                <CardTitle className="text-3xl">{clientStats.totalClients}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  En el período seleccionado
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-purple-700">Clientes Recurrentes</CardDescription>
                <CardTitle className="text-3xl text-purple-900">{clientStats.recurring}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm text-purple-700">
                  <Fire size={16} />
                  {clientStats.totalClients > 0 
                    ? Math.round((clientStats.recurring / clientStats.totalClients) * 100) 
                    : 0}% del total
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-blue-700">Clientes Nuevos</CardDescription>
                <CardTitle className="text-3xl text-blue-900">{clientStats.newClients}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-blue-700">
                  Primera visita
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Clients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star size={20} className="text-amber-500" weight="fill" />
                Mejores Clientes
              </CardTitle>
              <CardDescription>Por monto gastado en el período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clientStats.topClients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No hay datos de clientes en el período seleccionado
                  </p>
                ) : (
                  clientStats.topClients.map((client, index) => (
                    <div 
                      key={client.name} 
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-amber-100 text-amber-700' :
                          index === 1 ? 'bg-slate-200 text-slate-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {client.orders} orden{client.orders !== 1 ? 'es' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatCurrency(client.spent)}</div>
                        <div className="text-sm text-muted-foreground">Total pagado</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Client Distribution Pie */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Clientes</CardTitle>
              <CardDescription>Nuevos vs Recurrentes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Nuevos', value: clientStats.newClients },
                      { name: 'Recurrentes', value: clientStats.recurring }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="#2563eb" />
                    <Cell fill="#7c3aed" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
