import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"
import { registerSW } from 'virtual:pwa-register'
import { toast } from 'sonner'

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Register Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    toast('Nueva versión disponible', {
      action: {
        label: 'Actualizar',
        onClick: () => updateSW(true)
      },
      duration: Infinity,
    })
  },
  onOfflineReady() {
    console.log('✅ App lista para trabajar offline')
    toast.success('App lista para trabajar offline')
  },
})

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
   </ErrorBoundary>
)
