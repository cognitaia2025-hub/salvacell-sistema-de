import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  metricsAPI,
  type DashboardMetrics,
} from '@/lib/api'
import {
  Users,
  Activity,
  TrendUp,
  Clock,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Star,
  Server,
  Gauge,
  SpinnerGap
} from '@phosphor-icons/react'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-MX').format(value)
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true)
      setError(null)

      try {
        const data = await metricsAPI.getDashboard()
        setMetrics(data)
      } catch (err) {
        console.error('Error fetching metrics:', err)
        setError('Error al cargar las métricas. Verifica que el backend esté corriendo.')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()

    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <SpinnerGap size={48} className="animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return null
  }

  const { user_engagement, system_performance, operational } = metrics

  return (
    <div className="space-y-6">
      {/* User Engagement Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users size={20} className="text-primary" />
          Métricas de Compromiso de Usuario
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-700">Usuarios Activos Diarios (DAU)</CardDescription>
              <CardTitle className="text-3xl text-blue-900">
                {formatNumber(user_engagement.daily_active_users)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-700">
                Activos hoy
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-700">Usuarios Activos Mensuales (MAU)</CardDescription>
              <CardTitle className="text-3xl text-purple-900">
                {formatNumber(user_engagement.monthly_active_users)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-purple-700">
                Activos este mes
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tasa de Retención</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {user_engagement.user_retention_rate.toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Usuarios que regresan
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Usuarios Registrados</CardDescription>
              <CardTitle className="text-3xl">
                {formatNumber(user_engagement.total_registered_users)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Usuarios activos en el sistema
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-700">Nuevos Usuarios</CardDescription>
              <CardTitle className="text-3xl text-green-900">
                {formatNumber(user_engagement.new_users_this_month)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-700">
                Este mes
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Performance Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Server size={20} className="text-primary" />
          Rendimiento del Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tiempo de Respuesta Promedio</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Clock size={28} className="text-muted-foreground" />
                {system_performance.avg_response_time_ms.toFixed(0)}ms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {system_performance.avg_response_time_ms < 100 ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle size={16} /> Excelente
                  </span>
                ) : system_performance.avg_response_time_ms < 300 ? (
                  <span className="text-yellow-600">Bueno</span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertCircle size={16} /> Requiere atención
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-700">Tiempo de Actividad</CardDescription>
              <CardTitle className="text-3xl text-green-900 flex items-center gap-2">
                <Activity size={28} />
                {system_performance.system_uptime_percent.toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-700">
                Sistema operativo
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Solicitudes</CardDescription>
              <CardTitle className="text-3xl">
                {formatNumber(system_performance.total_requests)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Desde el inicio
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tasa de Errores</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {system_performance.error_rate_percent.toFixed(2)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {system_performance.error_rate_percent < 1 ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle size={16} /> Excelente
                  </span>
                ) : system_performance.error_rate_percent < 5 ? (
                  <span className="text-yellow-600">Aceptable</span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertCircle size={16} /> Requiere atención
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sesiones Activas</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Users size={28} className="text-muted-foreground" />
                {formatNumber(system_performance.active_sessions)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Usuarios conectados
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Operational Metrics Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gauge size={20} className="text-primary" />
          Indicadores Operacionales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-700">Órdenes de Hoy</CardDescription>
              <CardTitle className="text-3xl text-blue-900">
                {formatNumber(operational.total_orders_today)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-700">
                Órdenes recibidas hoy
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-700">En Proceso</CardDescription>
              <CardTitle className="text-3xl text-purple-900">
                {formatNumber(operational.orders_in_progress)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-purple-700">
                Órdenes activas
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-700">Completadas Hoy</CardDescription>
              <CardTitle className="text-3xl text-green-900">
                {formatNumber(operational.orders_completed_today)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-700">
                Órdenes entregadas
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700">Órdenes Pendientes</CardDescription>
              <CardTitle className="text-3xl text-amber-900">
                {formatNumber(operational.pending_orders)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-amber-700">
                En espera de finalización
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-700">Ingresos de Hoy</CardDescription>
              <CardTitle className="text-3xl text-emerald-900 flex items-center gap-2">
                <DollarSign size={28} />
                {formatCurrency(operational.revenue_today)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-emerald-700 flex items-center gap-1">
                <TrendUp size={16} />
                Pagos recibidos
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Satisfacción del Cliente (CSAT)</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Star size={28} className="text-amber-500" weight="fill" />
                {operational.customer_satisfaction_score.toFixed(1)}/5.0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {operational.customer_satisfaction_score >= 4.5 ? (
                  <span className="text-green-600">Excelente</span>
                ) : operational.customer_satisfaction_score >= 3.5 ? (
                  <span className="text-yellow-600">Bueno</span>
                ) : (
                  <span className="text-red-600">Necesita mejora</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
