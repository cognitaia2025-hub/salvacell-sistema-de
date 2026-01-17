import { X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface InstallPromptProps {
  onInstall: () => void
}

export function InstallPrompt({ onInstall }: InstallPromptProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border z-50">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X size={20} />
      </button>

      <div className="pr-6">
        <h3 className="font-semibold mb-1">Instalar SalvaCell</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Instala la app para acceso rápido y trabajo offline
        </p>
        <div className="flex gap-2">
          <Button onClick={onInstall} size="sm">
            Instalar
          </Button>
          <Button onClick={() => setIsVisible(false)} variant="outline" size="sm">
            Más tarde
          </Button>
        </div>
      </div>
    </div>
  )
}
