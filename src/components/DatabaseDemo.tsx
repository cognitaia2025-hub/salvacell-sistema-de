import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { db } from '@/lib/database/db'
import { Database, ArrowsClockwise, CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function DatabaseDemo() {
  const [stats, setStats] = useState({
    clients: 0,
    devices: 0,
    orders: 0,
    history: 0,
    payments: 0,
    inventory: 0
  })
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<Array<{ test: string; passed: boolean; message: string }>>([])

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)
    try {
      const clients = await db.getAllClients()
      const orders = await db.getAllOrders()
      const inventory = await db.getAllInventoryItems()
      
      let historyCount = 0
      let paymentsCount = 0
      let devicesCount = 0
      
      for (const order of orders) {
        const history = await db.getOrderHistory(order.id)
        const payments = await db.getPaymentsByOrderId(order.id)
        historyCount += history.length
        paymentsCount += payments.length
      }
      
      for (const client of clients) {
        const devices = await db.getDevicesByClientId(client.id)
        devicesCount += devices.length
      }

      setStats({
        clients: clients.length,
        devices: devicesCount,
        orders: orders.length,
        history: historyCount,
        payments: paymentsCount,
        inventory: inventory.length
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
      toast.error('Error cargando estadísticas')
    } finally {
      setLoading(false)
    }
  }

  async function runIntegrityTests() {
    const results: Array<{ test: string; passed: boolean; message: string }> = []
    
    try {
      const testClient = await db.insertClient({
        name: "Cliente de Prueba",
        phone: "5559999999",
        email: "test@test.com"
      })
      results.push({
        test: "Inserción de Cliente",
        passed: true,
        message: `Cliente creado con ID: ${testClient.id}`
      })

      try {
        await db.insertDevice({
          clientId: "invalid_client_id",
          brand: "Test",
          model: "Test",
          imei: "000000000000000"
        })
        results.push({
          test: "Foreign Key Constraint (Device → Client)",
          passed: false,
          message: "FALLÓ: Permitió crear dispositivo con clientId inválido"
        })
      } catch (error) {
        results.push({
          test: "Foreign Key Constraint (Device → Client)",
          passed: true,
          message: "✓ Rechazó correctamente dispositivo con clientId inválido"
        })
      }

      const testDevice = await db.insertDevice({
        clientId: testClient.id,
        brand: "Samsung",
        model: "Galaxy Test",
        imei: "111111111111111"
      })
      results.push({
        test: "Inserción de Device (con FK válido)",
        passed: true,
        message: `Dispositivo creado con ID: ${testDevice.id}`
      })

      const testOrder = await db.insertOrder({
        folio: `TEST-${Date.now()}`,
        clientId: testClient.id,
        deviceId: testDevice.id,
        status: "received",
        priority: "normal",
        problemDescription: "Prueba de integridad",
        services: "Test",
        estimatedCost: 100,
        estimatedDelivery: new Date().toISOString(),
        paymentStatus: "pending",
        totalAmount: 100,
        paidAmount: 0
      })
      results.push({
        test: "Inserción de Order (con múltiples FKs)",
        passed: true,
        message: `Orden creada con folio: ${testOrder.folio}`
      })

      const historyBefore = await db.getOrderHistory(testOrder.id)
      results.push({
        test: "Auto-creación de History Entry",
        passed: historyBefore.length === 1,
        message: historyBefore.length === 1 
          ? "✓ Historial creado automáticamente al crear orden"
          : "FALLÓ: No se creó entrada de historial"
      })

      await db.insertPayment({
        orderId: testOrder.id,
        amount: 50,
        method: "cash",
        notes: "Pago de prueba"
      })
      
      const updatedOrder = await db.getOrderById(testOrder.id)
      results.push({
        test: "Actualización automática de paidAmount",
        passed: updatedOrder?.paidAmount === 50,
        message: updatedOrder?.paidAmount === 50
          ? "✓ paidAmount actualizado correctamente a 50"
          : `FALLÓ: paidAmount es ${updatedOrder?.paidAmount}, esperado 50`
      })
      results.push({
        test: "Actualización automática de paymentStatus",
        passed: updatedOrder?.paymentStatus === "partial",
        message: updatedOrder?.paymentStatus === "partial"
          ? "✓ paymentStatus cambió a 'partial'"
          : `FALLÓ: paymentStatus es ${updatedOrder?.paymentStatus}, esperado 'partial'`
      })

      const fullOrder = await db.getOrderWithRelations(testOrder.id)
      results.push({
        test: "Query Relacional (JOIN)",
        passed: !!fullOrder?.client && !!fullOrder?.device,
        message: fullOrder?.client && fullOrder?.device
          ? `✓ JOIN exitoso: ${fullOrder.client.name} - ${fullOrder.device.brand} ${fullOrder.device.model}`
          : "FALLÓ: No se pudieron obtener relaciones"
      })

      const searchResults = await db.searchOrders("Prueba de integridad")
      results.push({
        test: "Búsqueda Relacional",
        passed: searchResults.length > 0,
        message: searchResults.length > 0
          ? `✓ Encontró ${searchResults.length} orden(es) por descripción`
          : "FALLÓ: No encontró la orden por búsqueda"
      })

      const clientStats = await db.getClientWithStats(testClient.id)
      results.push({
        test: "Agregación de Estadísticas",
        passed: clientStats?.totalOrders === 1,
        message: clientStats?.totalOrders === 1
          ? `✓ Estadísticas calculadas: ${clientStats.totalOrders} orden(es)`
          : "FALLÓ: Estadísticas incorrectas"
      })

      setTestResults(results)
      toast.success(`Tests completados: ${results.filter(r => r.passed).length}/${results.length} exitosos`)

    } catch (error) {
      console.error('Test failed:', error)
      toast.error('Error ejecutando tests')
    }
  }

  const passedTests = testResults.filter(r => r.passed).length
  const totalTests = testResults.length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database size={32} weight="duotone" className="text-primary" />
            <div>
              <CardTitle>Base de Datos Relacional</CardTitle>
              <CardDescription>
                Arquitectura PostgreSQL-compliant con 8 tablas y foreign keys
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              Sistema con integridad referencial, validación de foreign keys y actualizaciones en cascada
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Clients</div>
              <div className="text-2xl font-bold">{stats.clients}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Devices</div>
              <div className="text-2xl font-bold">{stats.devices}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Orders</div>
              <div className="text-2xl font-bold">{stats.orders}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">History Entries</div>
              <div className="text-2xl font-bold">{stats.history}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Payments</div>
              <div className="text-2xl font-bold">{stats.payments}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Inventory Items</div>
              <div className="text-2xl font-bold">{stats.inventory}</div>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button onClick={loadStats} disabled={loading} variant="outline" className="gap-2">
              <ArrowsClockwise size={16} />
              Actualizar Stats
            </Button>
            <Button onClick={runIntegrityTests} className="gap-2">
              <CheckCircle size={16} />
              Ejecutar Tests de Integridad
            </Button>
          </div>

          {testResults.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Resultados de Tests</h3>
                  <Badge variant={passedTests === totalTests ? "default" : "secondary"}>
                    {passedTests}/{totalTests} Exitosos
                  </Badge>
                </div>
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        result.passed ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'
                      }`}
                    >
                      {result.passed ? (
                        <CheckCircle size={20} weight="fill" className="text-success mt-0.5" />
                      ) : (
                        <WarningCircle size={20} weight="fill" className="text-destructive mt-0.5" />
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="font-medium text-sm">{result.test}</div>
                        <div className="text-xs text-muted-foreground">{result.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Relaciones Implementadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline">1:N</Badge>
            <span className="text-muted-foreground">clients → devices</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">1:N</Badge>
            <span className="text-muted-foreground">clients → orders</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">1:1</Badge>
            <span className="text-muted-foreground">devices → orders</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">1:N</Badge>
            <span className="text-muted-foreground">orders → order_history</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">1:N</Badge>
            <span className="text-muted-foreground">orders → order_photos</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">1:N</Badge>
            <span className="text-muted-foreground">orders → payments</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">1:N</Badge>
            <span className="text-muted-foreground">inventory_items → inventory_movements</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
