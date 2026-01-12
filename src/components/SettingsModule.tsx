import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Storefront,
  Phone,
  EnvelopeSimple,
  MapPin,
  Clock,
  Bell,
  Shield,
  FileText,
  Palette,
  FloppyDisk,
  WhatsappLogo
} from '@phosphor-icons/react'

export interface ShopSettings {
  // Business Info
  shopName: string
  address: string
  phone: string
  whatsapp: string
  email: string
  website: string
  
  // Operating Hours
  openTime: string
  closeTime: string
  workDays: string
  
  // Workshop Rules (for public QR view)
  workshopRules: string
  
  // Warranty & Policies
  warrantyDays: number
  abandonedDeviceDays: number
  
  // Notifications
  notifyOnStatusChange: boolean
  notifyViaWhatsApp: boolean
  notifyViaEmail: boolean
  
  // Branding
  primaryColor: string
  logoUrl: string
}

const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'SalvaCell',
  address: 'Calle Ejemplo #123, Col. Centro, CDMX',
  phone: '555-123-4567',
  whatsapp: '5551234567',
  email: 'contacto@salvacell.com',
  website: 'www.salvacell.com',
  openTime: '09:00',
  closeTime: '19:00',
  workDays: 'Lunes a Sábado',
  workshopRules: `• El plazo de entrega puede variar según disponibilidad de repuestos.
• Los equipos no reclamados después de 30 días quedan a disposición del taller.
• La garantía del servicio es de 30 días sobre la reparación realizada.
• Se requiere identificación oficial para recoger el equipo.
• El pago del servicio debe realizarse al momento de la entrega.`,
  warrantyDays: 30,
  abandonedDeviceDays: 30,
  notifyOnStatusChange: true,
  notifyViaWhatsApp: true,
  notifyViaEmail: false,
  primaryColor: '#2563eb',
  logoUrl: ''
}

export function SettingsModule() {
  const [settings, setSettings] = useKV<ShopSettings>('shop_settings', DEFAULT_SETTINGS)
  const [hasChanges, setHasChanges] = useState(false)

  const currentSettings = settings || DEFAULT_SETTINGS

  const handleChange = (field: keyof ShopSettings, value: string | number | boolean) => {
    setSettings({
      ...currentSettings,
      [field]: value
    })
    setHasChanges(true)
  }

  const handleSave = () => {
    toast.success('Configuración guardada correctamente')
    setHasChanges(false)
  }

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
    setHasChanges(true)
    toast.info('Configuración restaurada a valores predeterminados')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Configuración</h2>
          <p className="text-muted-foreground">
            Ajustes del sistema y datos del negocio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            Restaurar
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
            <FloppyDisk size={18} />
            Guardar Cambios
          </Button>
        </div>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="business" className="gap-2">
            <Storefront size={16} />
            <span className="hidden md:inline">Negocio</span>
          </TabsTrigger>
          <TabsTrigger value="policies" className="gap-2">
            <FileText size={16} />
            <span className="hidden md:inline">Políticas</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell size={16} />
            <span className="hidden md:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette size={16} />
            <span className="hidden md:inline">Apariencia</span>
          </TabsTrigger>
        </TabsList>

        {/* Business Info */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Storefront size={20} />
                Información del Negocio
              </CardTitle>
              <CardDescription>
                Datos generales del taller que se muestran en documentos y vista pública
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Nombre del Taller</Label>
                  <Input
                    id="shopName"
                    value={currentSettings.shopName}
                    onChange={(e) => handleChange('shopName', e.target.value)}
                    placeholder="Nombre del negocio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={currentSettings.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="www.ejemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin size={16} />
                  Dirección
                </Label>
                <Input
                  id="address"
                  value={currentSettings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Dirección completa"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone size={16} />
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    value={currentSettings.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="555-123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <WhatsappLogo size={16} className="text-green-600" />
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    value={currentSettings.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    placeholder="5551234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <EnvelopeSimple size={16} />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={currentSettings.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contacto@taller.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Horario de Operación
              </CardTitle>
              <CardDescription>
                Horarios de atención del taller
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openTime">Hora de Apertura</Label>
                  <Input
                    id="openTime"
                    type="time"
                    value={currentSettings.openTime}
                    onChange={(e) => handleChange('openTime', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeTime">Hora de Cierre</Label>
                  <Input
                    id="closeTime"
                    type="time"
                    value={currentSettings.closeTime}
                    onChange={(e) => handleChange('closeTime', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workDays">Días Laborales</Label>
                  <Input
                    id="workDays"
                    value={currentSettings.workDays}
                    onChange={(e) => handleChange('workDays', e.target.value)}
                    placeholder="Lunes a Sábado"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} />
                Garantía y Políticas
              </CardTitle>
              <CardDescription>
                Configuración de tiempos de garantía y retención de equipos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warrantyDays">Días de Garantía</Label>
                  <Input
                    id="warrantyDays"
                    type="number"
                    min="0"
                    value={currentSettings.warrantyDays}
                    onChange={(e) => handleChange('warrantyDays', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Días de garantía sobre reparaciones realizadas
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abandonedDeviceDays">Días para Equipo Abandonado</Label>
                  <Input
                    id="abandonedDeviceDays"
                    type="number"
                    min="0"
                    value={currentSettings.abandonedDeviceDays}
                    onChange={(e) => handleChange('abandonedDeviceDays', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Días después de los cuales un equipo no reclamado queda a disposición del taller
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Reglamento del Taller
              </CardTitle>
              <CardDescription>
                Este texto se muestra en la página pública de seguimiento por QR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="workshopRules">Reglas y Políticas</Label>
                <Textarea
                  id="workshopRules"
                  value={currentSettings.workshopRules}
                  onChange={(e) => handleChange('workshopRules', e.target.value)}
                  placeholder="Escriba las reglas del taller..."
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use • al inicio de cada línea para crear una lista con viñetas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={20} />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>
                Ajusta cómo se notifica a los clientes sobre sus reparaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificar al cambiar estado</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar notificación automática cuando cambie el estado de una orden
                  </p>
                </div>
                <Switch
                  checked={currentSettings.notifyOnStatusChange}
                  onCheckedChange={(checked) => handleChange('notifyOnStatusChange', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base">Canales de Notificación</Label>
                
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50 border-green-200">
                  <div className="flex items-center gap-3">
                    <WhatsappLogo size={24} className="text-green-600" />
                    <div className="space-y-0.5">
                      <Label className="text-base">WhatsApp</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar mensajes vía WhatsApp Business API
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={currentSettings.notifyViaWhatsApp}
                    onCheckedChange={(checked) => handleChange('notifyViaWhatsApp', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <EnvelopeSimple size={24} className="text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label className="text-base">Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar notificaciones por correo electrónico
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={currentSettings.notifyViaEmail}
                    onCheckedChange={(checked) => handleChange('notifyViaEmail', checked)}
                  />
                </div>
              </div>

              {currentSettings.notifyViaWhatsApp && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Mensaje de ejemplo:</h4>
                  <div className="p-3 bg-white rounded-lg border text-sm">
                    <p>Hola Juan Pérez! 👋</p>
                    <p className="mt-2">Tu equipo Apple iPhone 13 Pro ha cambiado de estado:</p>
                    <p className="font-medium mt-1">📱 Nuevo estado: En Reparación</p>
                    <p className="mt-2">Puedes ver el progreso aquí: [link]</p>
                    <p className="mt-2 text-muted-foreground">- SalvaCell</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette size={20} />
                Personalización Visual
              </CardTitle>
              <CardDescription>
                Ajusta la apariencia del sistema y documentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Color Principal</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={currentSettings.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={currentSettings.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      placeholder="#2563eb"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Color usado en encabezados y elementos destacados
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL del Logo</Label>
                  <Input
                    id="logoUrl"
                    value={currentSettings.logoUrl}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="https://ejemplo.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Logo para documentos y tickets impresos
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <Label className="text-base mb-4 block">Vista Previa</Label>
                <div 
                  className="p-6 rounded-lg border"
                  style={{ borderColor: currentSettings.primaryColor }}
                >
                  <div 
                    className="text-2xl font-bold mb-2"
                    style={{ color: currentSettings.primaryColor }}
                  >
                    {currentSettings.shopName}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{currentSettings.address}</p>
                    <p>Tel: {currentSettings.phone} | WhatsApp: {currentSettings.whatsapp}</p>
                    <p>{currentSettings.email}</p>
                    <p>Horario: {currentSettings.openTime} - {currentSettings.closeTime} ({currentSettings.workDays})</p>
                  </div>
                  <div 
                    className="mt-4 px-4 py-2 rounded text-white inline-block"
                    style={{ backgroundColor: currentSettings.primaryColor }}
                  >
                    Botón de Ejemplo
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {hasChanges && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-auto p-4 bg-primary text-primary-foreground rounded-lg shadow-lg flex items-center justify-between gap-4">
          <span>Tienes cambios sin guardar</span>
          <Button variant="secondary" size="sm" onClick={handleSave} className="gap-2">
            <FloppyDisk size={16} />
            Guardar
          </Button>
        </div>
      )}
    </div>
  )
}
