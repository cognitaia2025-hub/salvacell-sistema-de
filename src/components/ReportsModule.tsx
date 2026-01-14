import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  reportsAPI,
  type ReportPeriod,
  type OperationalStats,
  type FinancialStats,
  type InventoryStats,
  type ClientStats,
  type OrderTrend,
  type StatusDistribution,
} from '@/lib/api'
import {
  ChartBar,
  TrendUp,
  Package,
  Users,
  CurrencyCircleDollar,
  Clock,
  CalendarBlank,
  Star,
  Fire,
  SpinnerGap
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

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2']

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value)
}

export function ReportsModule() {
  const [period, setPeriod] = useState<ReportPeriod>('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for all stats
  const [operationalStats, setOperationalStats] = useState<OperationalStats | null>(null)
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null)
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(null)
  const [clientStats, setClientStats] = useState<ClientStats | null>(null)
  const [ordersTrend, setOrdersTrend] = useState<OrderTrend[]>([])
  const [ordersByStatus, setOrdersByStatus] = useState<StatusDistribution[]>([])

  // Fetch all data
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const [operational, financial, inventory, clients, trend, status] = await Promise.all([
          reportsAPI.getOperational(period),
          reportsAPI.getFinancial(period),
          reportsAPI.getInventory(),
          reportsAPI.getClients(period),
          reportsAPI.getOrdersTrend(period),
          reportsAPI.getOrdersByStatus(period),
        ])

        setOperationalStats(operational)
        setFinancialStats(financial)
        setInventoryStats(inventory)
        setClientStats(clients)
        setOrdersTrend(trend)
        setOrdersByStatus(status)
      } catch (err) {
        console.error('Error fetching reports:', err)
        setError('Error al cargar los reportes. Verifica que el backend esté corriendo.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <SpinnerGap size={48} className="animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando reportes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                <CardTitle className="text-3xl">{operationalStats?.total_orders || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {operationalStats?.urgent || 0} urgentes
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Entregadas</CardDescription>
                <CardTitle className="text-3xl text-green-600">{operationalStats?.delivered || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {operationalStats && operationalStats.total_orders > 0
                    ? Math.round((operationalStats.delivered / operationalStats.total_orders) * 100)
                    : 0}% completadas
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>En Proceso</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{operationalStats?.in_progress || 0}</CardTitle>
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
                  {operationalStats?.avg_repair_days || 0}d
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
                <CardTitle>Distribución de Estados</CardTitle>
                <CardDescription>Proporción de órdenes por estado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {ordersByStatus.map((_, index) => (
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
                  {formatCurrency(financialStats?.total_revenue || 0)}
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
                  {formatCurrency(financialStats?.total_pending || 0)}
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
                  {formatCurrency(financialStats?.avg_ticket || 0)}
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
                  const amount = financialStats?.by_method?.[method.key as keyof typeof financialStats.by_method] || 0
                  const total = financialStats?.total_revenue || 0
                  const percent = total > 0 ? (amount / total) * 100 : 0

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
                <CardTitle className="text-2xl">{formatCurrency(inventoryStats?.total_value || 0)}</CardTitle>
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
                <CardTitle className="text-2xl text-green-600">{formatCurrency(inventoryStats?.sell_value || 0)}</CardTitle>
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
                <CardTitle className="text-2xl text-amber-600">{inventoryStats?.low_stock || 0}</CardTitle>
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
                <CardTitle className="text-2xl text-red-600">{inventoryStats?.out_of_stock || 0}</CardTitle>
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
              {inventoryStats?.by_category && inventoryStats.by_category.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryStats.by_category} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos de inventario disponibles
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Reports */}
        <TabsContent value="clients" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Clientes</CardDescription>
                <CardTitle className="text-3xl">{clientStats?.total_clients || 0}</CardTitle>
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
                <CardTitle className="text-3xl text-purple-900">{clientStats?.recurring || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm text-purple-700">
                  <Fire size={16} />
                  {clientStats && clientStats.total_clients > 0
                    ? Math.round((clientStats.recurring / clientStats.total_clients) * 100)
                    : 0}% del total
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-blue-700">Clientes Nuevos</CardDescription>
                <CardTitle className="text-3xl text-blue-900">{clientStats?.new_clients || 0}</CardTitle>
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
                {!clientStats?.top_clients || clientStats.top_clients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No hay datos de clientes en el período seleccionado
                  </p>
                ) : (
                  clientStats.top_clients.map((client, index) => (
                    <div
                      key={client.name}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' :
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
                      { name: 'Nuevos', value: clientStats?.new_clients || 0 },
                      { name: 'Recurrentes', value: clientStats?.recurring || 0 }
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
