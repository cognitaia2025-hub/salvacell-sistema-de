import { useState, useEffect } from 'react'
import { offlineDetector } from '@/lib/pwa/offline-detector'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Check if already installed
    const checkInstalled = window.matchMedia('(display-mode: standalone)').matches
    setIsInstalled(checkInstalled)
    if (checkInstalled) {
      setIsInstallable(false)
    }

    // Subscribe to online/offline changes
    const unsubscribe = offlineDetector.subscribe(setIsOnline)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      unsubscribe()
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('✅ PWA instalada')
      setIsInstallable(false)
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
  }

  return {
    isOnline,
    isInstallable,
    installPWA,
    isInstalled,
  }
}
