/**
 * Connection Status Component
 * Displays the current WebSocket connection status
 */

import { useWebSocketContext } from '@/contexts/WebSocketContext'
import { ConnectionStatus as ConnStatus } from '@/lib/websocket/types'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'

export function ConnectionStatus() {
  const { status } = useWebSocketContext()

  // Don't show anything when connected (to avoid UI clutter)
  if (status === ConnStatus.CONNECTED) {
    return null
  }

  const getStatusConfig = () => {
    switch (status) {
      case ConnStatus.CONNECTING:
        return {
          icon: <Wifi className="w-4 h-4 animate-pulse" />,
          text: 'Conectando...',
          className: 'bg-blue-500/90 text-white',
        }
      case ConnStatus.DISCONNECTED:
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Desconectado',
          className: 'bg-gray-500/90 text-white',
        }
      case ConnStatus.RECONNECTING:
        return {
          icon: <Wifi className="w-4 h-4 animate-pulse" />,
          text: 'Reconectando...',
          className: 'bg-yellow-500/90 text-white',
        }
      case ConnStatus.ERROR:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Error de conexión',
          className: 'bg-red-500/90 text-white',
        }
      default:
        return null
    }
  }

  const config = getStatusConfig()
  if (!config) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${config.className}`}
    >
      {config.icon}
      <span className="text-sm font-medium">{config.text}</span>
    </div>
  )
}
