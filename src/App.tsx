import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { LoginForm } from '@/components/LoginForm'
import Dashboard from './components/Dashboard'
import { PublicOrderView } from './components/PublicOrderView'

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
  const urlParams = new URLSearchParams(window.location.search)
  const qrCode = urlParams.get('qr')

  // Public view for QR code orders (no authentication required)
  if (qrCode) {
    return <PublicOrderView folio={qrCode} />
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
    return <LoginForm />
  }

  // Show dashboard if authenticated
  return <Dashboard />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App