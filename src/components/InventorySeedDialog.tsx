import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Package, CheckCircle, XCircle, Info } from '@phosphor-icons/react'
import { seedVidriosTemplados, checkIfVidriosExist, getVidriosStats } from '@/lib/inventory-seed'
import { toast } from 'sonner'

export function InventorySeedDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    added: number
    skipped: number
    errors: string[]
  } | null>(null)
  const [stats, setStats] = useState<{
    sencillos: number
    privacidad: number
    protectoresSencillos: number
    protectoresUsoRudo: number
    total: number
  } | null>(null)
  const [hasExisting, setHasExisting] = useState(false)

  const checkExisting = async () => {
    const exists = await checkIfVidriosExist()
    setHasExisting(exists)
    
    if (exists) {
      const currentStats = await getVidriosStats()
      setStats(currentStats)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setResult(null)
      checkExisting()
    }
  }

  const handleSeed = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const seedResult = await seedVidriosTemplados()
      setResult(seedResult)
      
      if (seedResult.added > 0) {
        toast.success(`${seedResult.added} productos agregados al inventario`, {
          description: `Vidrios: ${Math.min(seedResult.added, 56)} | Protectores: ${Math.max(0, seedResult.added - 56)}`
        })
      }
      
      if (seedResult.skipped > 0) {
        toast.info(`${seedResult.skipped} productos ya existían`)
      }
      
      if (seedResult.errors.length > 0) {
        toast.error(`${seedResult.errors.length} errores al agregar productos`)
      }

      await checkExisting()
      
      window.dispatchEvent(new Event('inventory-updated'))
    } catch (error) {
      toast.error('Error al agregar productos', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setLoading(false)
    }
  }

  const progressValue = result 
    ? ((result.added + result.skipped) / 112) * 100 
    : 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Package size={18} />
          Agregar Productos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package size={24} className="text-primary" />
            Agregar Productos al Inventario
          </DialogTitle>
          <DialogDescription>
            Importa automáticamente 112 productos: 56 vidrios templados y 56 protectores para iPhone (modelos 11 a 17)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {hasExisting && stats && (
            <Alert>
              <Info size={18} />
              <AlertDescription>
                Ya tienes {stats.total} productos en el inventario: {stats.sencillos} vidrios sencillos, {stats.privacidad} vidrios privacidad, {stats.protectoresSencillos} protectores sencillos y {stats.protectoresUsoRudo} protectores uso rudo.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Vidrios Sencillos</CardTitle>
                <CardDescription>Vidrios templados estándar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">28</div>
                <p className="text-xs text-muted-foreground mt-1">productos</p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Precio compra:</span>
                    <span className="font-medium">$10 MXN</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Precio venta:</span>
                    <span className="font-medium">$50 MXN</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Vidrios Privacidad</CardTitle>
                <CardDescription>Con filtro anti espía</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">28</div>
                <p className="text-xs text-muted-foreground mt-1">productos</p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Precio compra:</span>
                    <span className="font-medium">$30 MXN</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Precio venta:</span>
                    <span className="font-medium">$150 MXN</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Protectores Sencillos</CardTitle>
                <CardDescription>Protección básica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">28</div>
                <p className="text-xs text-muted-foreground mt-1">productos</p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Precio compra:</span>
                    <span className="font-medium">$5 MXN</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Precio venta:</span>
                    <span className="font-medium">$30 MXN</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Protectores Uso Rudo</CardTitle>
                <CardDescription>Máxima protección</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">28</div>
                <p className="text-xs text-muted-foreground mt-1">productos</p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Precio compra:</span>
                    <span className="font-medium">$15 MXN</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Precio venta:</span>
                    <span className="font-medium">$80 MXN</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Modelos incluidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {['iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max'].map(model => (
                  <Badge key={model} variant="secondary" className="text-xs">{model}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['iPhone 12 mini', 'iPhone 12', 'iPhone 12 Pro', 'iPhone 12 Pro Max'].map(model => (
                  <Badge key={model} variant="secondary" className="text-xs">{model}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['iPhone 13 mini', 'iPhone 13', 'iPhone 13 Pro', 'iPhone 13 Pro Max'].map(model => (
                  <Badge key={model} variant="secondary" className="text-xs">{model}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max'].map(model => (
                  <Badge key={model} variant="secondary" className="text-xs">{model}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max'].map(model => (
                  <Badge key={model} variant="secondary" className="text-xs">{model}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['iPhone 16e', 'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max'].map(model => (
                  <Badge key={model} variant="secondary" className="text-xs">{model}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['iPhone 17', 'iPhone 17 Air', 'iPhone 17 Pro', 'iPhone 17 Pro Max'].map(model => (
                  <Badge key={model} variant="secondary" className="text-xs">{model}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Agregando productos...</span>
                <span className="font-medium">{Math.round(progressValue)}%</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resultado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.added > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={18} className="text-success" weight="fill" />
                    <span><strong>{result.added}</strong> productos agregados correctamente</span>
                  </div>
                )}
                
                {result.skipped > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Info size={18} className="text-warning" />
                    <span><strong>{result.skipped}</strong> productos ya existían (omitidos)</span>
                  </div>
                )}
                
                {result.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <XCircle size={18} className="text-destructive" weight="fill" />
                      <span><strong>{result.errors.length}</strong> errores</span>
                    </div>
                    <div className="bg-destructive/10 p-2 rounded text-xs space-y-1 max-h-32 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            {result ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!result && (
            <Button onClick={handleSeed} disabled={loading} className="gap-2">
              {loading ? (
                <>Agregando...</>
              ) : (
                <>
                  <Package size={18} />
                  Agregar al Inventario
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
