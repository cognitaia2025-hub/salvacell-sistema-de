import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { ConnectionStatus } from '@/components/WebSocket/ConnectionStatus'
import { NotificationToast } from '@/components/WebSocket/NotificationToast'
import { LoginForm } from '@/components/LoginForm'
import Dashboard from './components/Dashboard'
import { PublicOrderView } from './components/PublicOrderView'
import { OfflineIndicator } from '@/components/PWA/OfflineIndicator'
import { InstallPrompt } from '@/components/PWA/InstallPrompt'
import { usePWA } from '@/hooks/use-pwa'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const { isOnline, isInstallable, installPWA } = usePWA()
  const urlParams = new URLSearchParams(window.location.search)
  const qrCode = urlParams.get('qr')

  // Public view for QR code orders (no authentication required)
  if (qrCode) {
    return (
      <>
        <OfflineIndicator isOnline={isOnline} />
        <PublicOrderView folio={qrCode} />
      </>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <OfflineIndicator isOnline={isOnline} />
        <LoginForm />
      </>
    )
  }

  // Show dashboard if authenticated
  return (
    <>
      <OfflineIndicator isOnline={isOnline} />
      {isInstallable && <InstallPrompt onInstall={installPWA} />}
      <Dashboard />
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <ConnectionStatus />
          <NotificationToast />
          <AppContent />
          <Toaster position="top-right" richColors />
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App