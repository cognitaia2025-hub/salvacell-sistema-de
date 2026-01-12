import { Toaster } from 'sonner'
import Dashboard from './components/Dashboard'
import { PublicOrderView } from './components/PublicOrderView'

function App() {
  const urlParams = new URLSearchParams(window.location.search)
  const qrCode = urlParams.get('qr')

  if (qrCode) {
    return <PublicOrderView folio={qrCode} />
  }

  return (
    <>
      <Dashboard />
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App