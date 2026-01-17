import { useOfflineSync } from '@/hooks/use-offline-sync'
import { Button } from '@/components/ui/button'

export function SyncStatus() {
  const { isSyncing, lastSyncTime, syncErrors, manualSync } = useOfflineSync()

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {isSyncing && (
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Sincronizando...
        </span>
      )}
      
      {!isSyncing && lastSyncTime && (
        <span>
          Última sincronización: {lastSyncTime.toLocaleTimeString()}
        </span>
      )}

      {syncErrors.length > 0 && (
        <span className="text-red-600">
          {syncErrors.length} errores de sincronización
        </span>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={manualSync}
        disabled={isSyncing}
      >
        Sincronizar ahora
      </Button>
    </div>
  )
}
