import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { Order, Payment, PaymentMethod, PaymentStatus } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/mock-data'
import {
  CurrencyDollar,
  Plus,
  CreditCard,
  Money,
  Bank,
  CheckCircle,
  WarningCircle,
  Clock
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PaymentManagerProps {
  order: Order
  onUpdate: (order: Order) => void
}

export function PaymentManager({ order, onUpdate }: PaymentManagerProps) {
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentNotes, setPaymentNotes] = useState('')

  const totalPaid = order.payments.reduce((sum, payment) => sum + payment.amount, 0)
  const remainingBalance = order.estimatedCost - totalPaid
  const paymentPercentage = (totalPaid / order.estimatedCost) * 100

  const getPaymentStatus = (): PaymentStatus => {
    if (totalPaid === 0) return 'pending'
    if (totalPaid >= order.estimatedCost) return 'paid'
    return 'partial'
  }

  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount)

    if (!amount || amount <= 0) {
      toast.error('Ingresa un monto válido')
      return
    }

    if (amount > remainingBalance) {
      toast.error(`El monto excede el saldo pendiente de ${formatCurrency(remainingBalance)}`)
      return
    }

    const newPayment: Payment = {
      id: `p${Date.now()}`,
      amount,
      method: paymentMethod,
      timestamp: new Date().toISOString(),
      userId: '1',
      userName: 'Usuario Actual',
      notes: paymentNotes || undefined
    }

    const updatedOrder: Order = {
      ...order,
      payments: [...order.payments, newPayment],
      paymentStatus: getPaymentStatus(),
      updatedAt: new Date().toISOString()
    }

    const newTotal = totalPaid + amount
    updatedOrder.paymentStatus = newTotal === 0 ? 'pending' : newTotal >= order.estimatedCost ? 'paid' : 'partial'

    onUpdate(updatedOrder)
    
    setPaymentAmount('')
    setPaymentMethod('cash')
    setPaymentNotes('')
    setShowAddPayment(false)

    const paymentType = newTotal >= order.estimatedCost ? 'completo' : newTotal === amount && order.payments.length === 0 ? 'anticipo' : 'parcial'
    toast.success(`Pago ${paymentType} registrado correctamente`)
  }

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return <Money size={16} weight="fill" />
      case 'card':
        return <CreditCard size={16} weight="fill" />
      case 'transfer':
        return <Bank size={16} weight="fill" />
    }
  }

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return 'Efectivo'
      case 'card':
        return 'Tarjeta'
      case 'transfer':
        return 'Transferencia'
    }
  }

  const getPaymentStatusBadge = () => {
    const status = getPaymentStatus()
    
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Clock size={14} className="mr-1" weight="fill" />
            Pendiente
          </Badge>
        )
      case 'partial':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <WarningCircle size={14} className="mr-1" weight="fill" />
            Pago Parcial
          </Badge>
        )
      case 'paid':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle size={14} className="mr-1" weight="fill" />
            Pagado
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Costo Total</div>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(order.estimatedCost)}
            </div>
          </div>
          {getPaymentStatusBadge()}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Total Pagado</div>
            <div className="text-xl font-semibold text-green-700">
              {formatCurrency(totalPaid)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Saldo Pendiente</div>
            <div className="text-xl font-semibold text-red-700">
              {formatCurrency(remainingBalance)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progreso de pago</span>
            <span>{paymentPercentage.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
              style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {!showAddPayment && remainingBalance > 0 && (
        <Button
          onClick={() => setShowAddPayment(true)}
          className="w-full gap-2"
          size="lg"
        >
          <Plus size={20} weight="bold" />
          Registrar Pago
        </Button>
      )}

      {showAddPayment && (
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Nuevo Pago</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddPayment(false)
                setPaymentAmount('')
                setPaymentMethod('cash')
                setPaymentNotes('')
              }}
            >
              Cancelar
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Monto a Pagar *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={remainingBalance}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentAmount((remainingBalance * 0.5).toFixed(2))}
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentAmount(remainingBalance.toFixed(2))}
                >
                  Total
                </Button>
              </div>
            </div>

            <div>
              <Label>Método de Pago *</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <Money size={16} weight="fill" />
                      Efectivo
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} weight="fill" />
                      Tarjeta
                    </div>
                  </SelectItem>
                  <SelectItem value="transfer">
                    <div className="flex items-center gap-2">
                      <Bank size={16} weight="fill" />
                      Transferencia
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notas (opcional)</Label>
              <Textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Número de referencia, observaciones..."
                rows={2}
              />
            </div>

            <Button onClick={handleAddPayment} className="w-full gap-2" size="lg">
              <CurrencyDollar size={20} weight="fill" />
              Confirmar Pago de {paymentAmount ? formatCurrency(parseFloat(paymentAmount)) : '$0.00'}
            </Button>
          </div>
        </div>
      )}

      {order.payments.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Historial de Pagos</h3>
          <div className="space-y-2">
            {order.payments
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((payment, index) => (
                <div
                  key={payment.id}
                  className="bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl font-bold text-green-700">
                          {formatCurrency(payment.amount)}
                        </div>
                        <Badge variant="outline" className="gap-1">
                          {getPaymentMethodIcon(payment.method)}
                          {getPaymentMethodLabel(payment.method)}
                        </Badge>
                        {index === 0 && order.payments.length === 1 && payment.amount < order.estimatedCost && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Anticipo
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Registrado: {formatDate(payment.timestamp)}</div>
                        <div>Por: {payment.userName}</div>
                        {payment.notes && (
                          <div className="text-xs mt-2 bg-muted/50 rounded px-2 py-1">
                            {payment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {order.payments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <CurrencyDollar size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No se han registrado pagos para esta orden</p>
        </div>
      )}
    </div>
  )
}
