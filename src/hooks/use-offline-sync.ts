import { useState, useEffect } from 'react'
import { syncManager } from '@/lib/db/sync-manager'

export function useOfflineSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncErrors, setSyncErrors] = useState<any[]>([])

  useEffect(() => {
    // Start auto-sync
    syncManager.startAutoSync(30000) // every 30 seconds

    return () => {
      syncManager.stopAutoSync()
    }
  }, [])

  const manualSync = async () => {
    setIsSyncing(true)
    try {
      const result = await syncManager.syncAll()
      setLastSyncTime(new Date())
      setSyncErrors(result.errors)
    } catch (error) {
      console.error('Error en sincronización:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  return {
    isSyncing,
    lastSyncTime,
    syncErrors,
    manualSync,
  }
}
