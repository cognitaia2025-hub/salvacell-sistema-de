import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Order, Client } from '@/lib/types'
import { generateFolio, calculateClientTier, MOCK_CLIENTS } from '@/lib/mock-data'
import { toast } from 'sonner'
import { X } from '@phosphor-icons/react'

interface NewOrderDialogProps {
  onClose: () => void
  onSave: (order: Order) => void
}

export function NewOrderDialog({ onClose, onSave }: NewOrderDialogProps) {
  const [step, setStep] = useState(1)
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [newClientAltPhone, setNewClientAltPhone] = useState('')
  const [newClientAltContact, setNewClientAltContact] = useState('')
  const [phoneIsDevice, setPhoneIsDevice] = useState(false)
  const [newClientEmail, setNewClientEmail] = useState('')
  
  const [deviceBrand, setDeviceBrand] = useState('')
  const [deviceModel, setDeviceModel] = useState('')
  const [deviceImei, setDeviceImei] = useState('')
  const [devicePassword, setDevicePassword] = useState('')
  const [deviceAccessories, setDeviceAccessories] = useState('')
  
  const [problem, setProblem] = useState('')
  const [services, setServices] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [estimatedDelivery, setEstimatedDelivery] = useState('')
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal')

  const filteredClients = MOCK_CLIENTS.filter(
    (c) =>
      clientSearch === '' ||
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.includes(clientSearch)
  )

  const handleCreateClient = () => {
    if (!newClientName || !newClientPhone) {
      toast.error('Nombre y teléfono son requeridos')
      return
    }

    if (phoneIsDevice && !newClientAltContact) {
      toast.error('Contacto alterno es obligatorio cuando el teléfono a reparar es el del cliente')
      return
    }

    const client: Client = {
      id: `c${Date.now()}`,
      name: newClientName,
      phone: newClientPhone,
      alternatePhone: newClientAltPhone || undefined,
      alternateContact: newClientAltContact || undefined,
      email: newClientEmail || undefined,
      createdAt: new Date().toISOString(),
      tier: 'new',
      totalOrders: 1,
      totalSpent: 0
    }

    setSelectedClient(client)
    setStep(2)
    toast.success('Cliente registrado')
  }

  const handleSaveOrder = () => {
    if (!selectedClient) {
      toast.error('Selecciona un cliente')
      return
    }

    if (!deviceBrand || !deviceModel || !deviceImei) {
      toast.error('Completa la información del dispositivo')
      return
    }

    if (!problem || !services || !estimatedCost || !estimatedDelivery) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    const folio = generateFolio()
    const now = new Date().toISOString()

    const order: Order = {
      id: `o${Date.now()}`,
      folio,
      clientId: selectedClient.id,
      client: selectedClient,
      device: {
        brand: deviceBrand,
        model: deviceModel,
        imei: deviceImei,
        password: devicePassword || undefined,
        accessories: deviceAccessories || undefined
      },
      problem,
      services,
      estimatedCost: parseFloat(estimatedCost),
      estimatedDelivery,
      priority,
      status: 'received',
      paymentStatus: 'pending',
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          id: `h${Date.now()}`,
          status: 'received',
          timestamp: now,
          userId: '3',
          userName: 'Usuario Actual',
          notes: 'Orden creada'
        }
      ],
      payments: [],
      qrCode: folio
    }

    onSave(order)
    toast.success(`Orden ${folio} creada exitosamente`)
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().slice(0, 16)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center justify-between">
            Nueva Orden de Reparación
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute right-4 top-4"
            >
              <X size={20} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          <div className="flex gap-2 mb-6">
            <div
              className={`flex-1 h-2 rounded ${
                step >= 1 ? 'bg-primary' : 'bg-muted'
              }`}
            />
            <div
              className={`flex-1 h-2 rounded ${
                step >= 2 ? 'bg-primary' : 'bg-muted'
              }`}
            />
            <div
              className={`flex-1 h-2 rounded ${
                step >= 3 ? 'bg-primary' : 'bg-muted'
              }`}
            />
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  1. Información del Cliente
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label>Buscar cliente existente</Label>
                    <Input
                      placeholder="Nombre o teléfono..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                    />
                    {clientSearch && filteredClients.length > 0 && (
                      <div className="mt-2 border rounded-lg divide-y max-h-48 overflow-y-auto">
                        {filteredClients.map((client) => (
                          <button
                            key={client.id}
                            className="w-full p-3 text-left hover:bg-muted transition-colors"
                            onClick={() => {
                              setSelectedClient(client)
                              setStep(2)
                            }}
                          >
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {client.phone}
                              {client.tier && ` • ${client.totalOrders} órdenes`}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        O registrar nuevo cliente
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>Nombre completo *</Label>
                      <Input
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Teléfono principal *</Label>
                      <Input
                        type="tel"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <Checkbox
                        id="phone-is-device"
                        checked={phoneIsDevice}
                        onCheckedChange={(checked) => setPhoneIsDevice(checked as boolean)}
                      />
                      <label
                        htmlFor="phone-is-device"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        El teléfono a reparar es el mismo que el de contacto del cliente
                      </label>
                    </div>
                    {phoneIsDevice && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <Label className="text-red-900">Contacto alterno (obligatorio) *</Label>
                        <Input
                          type="tel"
                          value={newClientAltContact}
                          onChange={(e) => setNewClientAltContact(e.target.value)}
                          placeholder="Número de familiar o amigo"
                          className="mt-1"
                        />
                        <p className="text-xs text-red-700 mt-1">
                          Requerido para notificaciones mientras el dispositivo está en reparación
                        </p>
                      </div>
                    )}
                    <div>
                      <Label>Teléfono alternativo</Label>
                      <Input
                        type="tel"
                        value={newClientAltPhone}
                        onChange={(e) => setNewClientAltPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleCreateClient}>
                    Continuar con nuevo cliente
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && selectedClient && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  2. Información del Dispositivo
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cliente: {selectedClient.name}
                </p>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Marca *</Label>
                      <Input
                        value={deviceBrand}
                        onChange={(e) => setDeviceBrand(e.target.value)}
                        placeholder="Apple, Samsung..."
                      />
                    </div>
                    <div>
                      <Label>Modelo *</Label>
                      <Input
                        value={deviceModel}
                        onChange={(e) => setDeviceModel(e.target.value)}
                        placeholder="iPhone 13, Galaxy S23..."
                      />
                    </div>
                  </div>
                  <div>
                    <Label>IMEI / Serial *</Label>
                    <Input
                      value={deviceImei}
                      onChange={(e) => setDeviceImei(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Contraseña / PIN</Label>
                    <Input
                      type="password"
                      value={devicePassword}
                      onChange={(e) => setDevicePassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Accesorios incluidos</Label>
                    <Input
                      value={deviceAccessories}
                      onChange={(e) => setDeviceAccessories(e.target.value)}
                      placeholder="Funda, protector..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Atrás
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(3)}>
                    Continuar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  3. Detalles de la Reparación
                </h3>

                <div className="space-y-3">
                  <div>
                    <Label>Problema reportado *</Label>
                    <Textarea
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      placeholder="Describe el problema..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Servicios a realizar *</Label>
                    <Textarea
                      value={services}
                      onChange={(e) => setServices(e.target.value)}
                      placeholder="Cambio de pantalla, batería..."
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Costo estimado (MXN) *</Label>
                      <Input
                        type="number"
                        value={estimatedCost}
                        onChange={(e) => setEstimatedCost(e.target.value)}
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <Label>Prioridad</Label>
                      <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Fecha de entrega estimada *</Label>
                    <Input
                      type="datetime-local"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      min={getTomorrowDate()}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Atrás
                  </Button>
                  <Button className="flex-1" onClick={handleSaveOrder}>
                    Crear Orden
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}