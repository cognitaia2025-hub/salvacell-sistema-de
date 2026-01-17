# 📋 PLAN 03: PWA Modo Offline Completo

**Plan ID:** PLAN-03  
**Categoría:** Frontend - PWA  
**Prioridad:** 🟡 Media  
**Tiempo estimado:** 6-8 horas  
**Dependencias:** Ninguna

---

## 🎯 Objetivo

Implementar modo offline completo para la PWA, permitiendo que el sistema funcione sin conexión a internet mediante Service Workers, IndexedDB para almacenamiento local, y sincronización automática cuando se recupere la conexión.

---

## 📦 Archivos a Crear (NUEVOS)

```
src/
├── workers/
│   └── service-worker.ts          # Service Worker principal
├── lib/
│   ├── db/
│   │   ├── indexed-db.ts         # Wrapper de IndexedDB
│   │   └── sync-manager.ts       # Gestor de sincronización
│   └── pwa/
│       ├── offline-detector.ts   # Detector de conexión
│       └── cache-strategy.ts     # Estrategias de caché
├── hooks/
│   ├── use-pwa.ts                # Hook para PWA
│   └── use-offline-sync.ts       # Hook para sincronización
├── components/
│   └── PWA/
│       ├── OfflineIndicator.tsx  # Indicador de estado offline
│       ├── SyncStatus.tsx        # Estado de sincronización
│       └── InstallPrompt.tsx     # Prompt de instalación PWA
└── utils/
    └── pwa-utils.ts              # Utilidades PWA
```

**Total archivos nuevos:** 11

---

## 🔧 Archivos a Modificar (EXISTENTES)

### 1. `vite.config.ts`
**Zona de modificación:** Líneas 5-20 (sección de plugins)

**Cambios:**
```typescript
// AGREGAR import al inicio:
import { VitePWA } from 'vite-plugin-pwa'

// MODIFICAR plugins array (línea ~10):
plugins: [
  react(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
    manifest: {
      name: 'SalvaCell - Sistema de Gestión',
      short_name: 'SalvaCell',
      description: 'Sistema de gestión para taller de reparaciones',
      theme_color: '#1e40af',
      background_color: '#ffffff',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\./i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 // 24 horas
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    }
  })
],
```

### 2. `src/main.tsx`
**Zona de modificación:** Al inicio del archivo (después de imports)

**Cambios:**
```typescript
// AGREGAR al inicio después de imports:
import { registerSW } from 'virtual:pwa-register'

// AGREGAR antes de ReactDOM.createRoot (línea ~10):
// Register Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nueva versión disponible. ¿Actualizar ahora?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('✅ App lista para trabajar offline')
  },
})
```

### 3. `src/App.tsx`
**Zona de modificación:** Línea ~25 (dentro del componente AppContent)

**Cambios:**
```tsx
// AGREGAR imports al inicio:
import { OfflineIndicator } from '@/components/PWA/OfflineIndicator'
import { InstallPrompt } from '@/components/PWA/InstallPrompt'
import { usePWA } from '@/hooks/use-pwa'

// AGREGAR dentro de AppContent (antes del return):
const { isOnline, isInstallable, installPWA } = usePWA()

// MODIFICAR el return para incluir componentes PWA:
return (
  <> 
    <OfflineIndicator isOnline={isOnline} /> 
    {isInstallable && <InstallPrompt onInstall={installPWA} />} 
    {/* ...resto del código existente... */} 
  </>
)
```

### 4. `package.json`
**Zona de modificación:** Sección dependencies

**Cambios:**
```json
// AGREGAR a devDependencies:
"vite-plugin-pwa": "^0.17.4",
"workbox-window": "^7.0.0"

// AGREGAR a dependencies:
"idb": "^7.1.1"
```

---

## 📝 Contenido Detallado de Archivos Nuevos

### 1. `src/workers/service-worker.ts`
```typescript
/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare const self: ServiceWorkerGlobalScope

// Take control immediately
clientsClaim()

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST)

// API calls - Network First
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24, // 24 horas
      }),
    ],
  })
)

// Images - Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
      }),
    ],
  })
)

// CSS/JS - Stale While Revalidate
registerRoute(
  ({ request }) => 
    request.destination === 'style' || 
    request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
)

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders())
  }
})

async function syncOrders() {
  // Implementar lógica de sincronización
  console.log('🔄 Sincronizando órdenes...')
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/badge-72x72.png',
    })
  )
})
```

### 2. `src/lib/db/indexed-db.ts`
```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface SalvaCellDB extends DBSchema {
  orders: {
    key: string
    value: {
      id: string
      folio: string
      clientId: string
      data: any
      status: string
      syncStatus: 'pending' | 'synced' | 'error'
      createdAt: string
      updatedAt: string
    }
    indexes: {
      'by-sync-status': string
      'by-folio': string
    }
  }
  clients: {
    key: string
    value: {
      id: string
      name: string
      phone: string
      data: any
      syncStatus: 'pending' | 'synced' | 'error'
      createdAt: string
      updatedAt: string
    }
    indexes: {
      'by-sync-status': string
      'by-phone': string
    }
  }
  inventory: {
    key: string
    value: {
      id: string
      sku: string
      data: any
      syncStatus: 'pending' | 'synced' | 'error'
      updatedAt: string
    }
    indexes: {
      'by-sync-status': string
      'by-sku': string
    }
  }
  pendingActions: {
    key: number
    value: {
      id?: number
      type: 'create' | 'update' | 'delete'
      entity: 'order' | 'client' | 'inventory'
      data: any
      timestamp: string
    }
  }
}

let db: IDBPDatabase<SalvaCellDB> | null = null

export async function initDB(): Promise<IDBPDatabase<SalvaCellDB>> {
  if (db) return db

  db = await openDB<SalvaCellDB>('salvacell-db', 1, {
    upgrade(db) {
      // Orders store
      const ordersStore = db.createObjectStore('orders', { keyPath: 'id' })
      ordersStore.createIndex('by-sync-status', 'syncStatus')
      ordersStore.createIndex('by-folio', 'folio')

      // Clients store
      const clientsStore = db.createObjectStore('clients', { keyPath: 'id' })
      clientsStore.createIndex('by-sync-status', 'syncStatus')
      clientsStore.createIndex('by-phone', 'phone')

      // Inventory store
      const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id' })
      inventoryStore.createIndex('by-sync-status', 'syncStatus')
      inventoryStore.createIndex('by-sku', 'sku')

      // Pending actions store
      db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true })
    },
  })

  return db
}

export async function getDB(): Promise<IDBPDatabase<SalvaCellDB>> {
  if (!db) {
    return initDB()
  }
  return db
}

// Orders operations
export async function saveOrder(order: any) {
  const database = await getDB()
  await database.put('orders', {
    id: order.id,
    folio: order.folio,
    clientId: order.clientId,
    data: order,
    status: order.status,
    syncStatus: 'pending',
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

export async function getOrder(id: string) {
  const database = await getDB()
  return database.get('orders', id)
}

export async function getAllOrders() {
  const database = await getDB()
  return database.getAll('orders')
}

export async function getPendingOrders() {
  const database = await getDB()
  return database.getAllFromIndex('orders', 'by-sync-status', 'pending')
}

// Clients operations
export async function saveClient(client: any) {
  const database = await getDB()
  await database.put('clients', {
    id: client.id,
    name: client.name,
    phone: client.phone,
    data: client,
    syncStatus: 'pending',
    createdAt: client.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

export async function getClient(id: string) {
  const database = await getDB()
  return database.get('clients', id)
}

export async function getAllClients() {
  const database = await getDB()
  return database.getAll('clients')
}

// Pending actions
export async function addPendingAction(
  type: 'create' | 'update' | 'delete',
  entity: 'order' | 'client' | 'inventory',
  data: any
) {
  const database = await getDB()
  await database.add('pendingActions', {
    type,
    entity,
    data,
    timestamp: new Date().toISOString(),
  })
}

export async function getPendingActions() {
  const database = await getDB()
  return database.getAll('pendingActions')
}

export async function clearPendingAction(id: number) {
  const database = await getDB()
  await database.delete('pendingActions', id)
}

export async function markAsSynced(
  store: 'orders' | 'clients' | 'inventory',
  id: string
) {
  const database = await getDB()
  const item = await database.get(store, id)
  if (item) {
    item.syncStatus = 'synced'
    await database.put(store, item)
  }
}
```

### 3. `src/lib/db/sync-manager.ts`
```typescript
import {
  getPendingActions,
  clearPendingAction,
  markAsSynced,
  getPendingOrders,
  getAllClients,
  getAllOrders,
} from './indexed-db'
import { apiClient } from '@/lib/api/client'

export class SyncManager {
  private isSyncing = false
  private syncInterval: number | null = null

  constructor() {
    // Listen for online events
    window.addEventListener('online', () => {
      console.log('📡 Conexión restaurada, sincronizando...')
      this.syncAll()
    })
  }

  startAutoSync(intervalMs = 30000) {
    if (this.syncInterval) return

    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine) {
        this.syncAll()
      }
    }, intervalMs)
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  async syncAll(): Promise<{ success: boolean; errors: any[] }> {
    if (this.isSyncing) {
      console.log('⏳ Sincronización en progreso...')
      return { success: false, errors: [] }
    }

    this.isSyncing = true
    const errors: any[] = []

    try {
      // 1. Sync pending actions
      const pendingActions = await getPendingActions()
      console.log(`📤 Sincronizando ${pendingActions.length} acciones pendientes`)

      for (const action of pendingActions) {
        try {
          await this.syncAction(action)
          await clearPendingAction(action.id!)
        } catch (error) {
          console.error('❌ Error sincronizando acción:', action, error)
          errors.push({ action, error })
        }
      }

      // 2. Sync pending orders
      const pendingOrders = await getPendingOrders()
      console.log(`📤 Sincronizando ${pendingOrders.length} órdenes pendientes`)

      for (const order of pendingOrders) {
        try {
          await apiClient.post('/orders', order.data)
          await markAsSynced('orders', order.id)
        } catch (error) {
          console.error('❌ Error sincronizando orden:', order, error)
          errors.push({ type: 'order', order, error })
        }
      }

      // 3. Pull latest data from server
      await this.pullLatestData()

      console.log('✅ Sincronización completada')
      return { success: errors.length === 0, errors }
    } catch (error) {
      console.error('❌ Error en sincronización:', error)
      return { success: false, errors: [error] }
    } finally {
      this.isSyncing = false
    }
  }

  private async syncAction(action: any) {
    const { type, entity, data } = action

    switch (entity) {
      case 'order':
        if (type === 'create') {
          await apiClient.post('/orders', data)
        } else if (type === 'update') {
          await apiClient.put(`/orders/${data.id}`, data)
        } else if (type === 'delete') {
          await apiClient.delete(`/orders/${data.id}`)
        }
        break

      case 'client':
        if (type === 'create') {
          await apiClient.post('/clients', data)
        } else if (type === 'update') {
          await apiClient.put(`/clients/${data.id}`, data)
        }
        break

      case 'inventory':
        if (type === 'create') {
          await apiClient.post('/inventory/items', data)
        } else if (type === 'update') {
          await apiClient.put(`/inventory/items/${data.id}`, data)
        }
        break
    }
  }

  private async pullLatestData() {
    try {
      // Pull latest orders, clients, etc. from server
      // and update IndexedDB
      console.log('📥 Descargando datos actualizados del servidor...')
      
      // TODO: Implementar lógica de pull
      // const orders = await apiClient.get('/orders')
      // const clients = await apiClient.get('/clients')
      // ...
    } catch (error) {
      console.error('❌ Error descargando datos:', error)
    }
  }

  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      autoSyncEnabled: this.syncInterval !== null,
    }
  }
}

export const syncManager = new SyncManager()
```

### 4. `src/lib/pwa/offline-detector.ts`
```typescript
export class OfflineDetector {
  private listeners: Set<(isOnline: boolean) => void> = new Set()
  private _isOnline: boolean = navigator.onLine

  constructor() {
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
  }

  private handleOnline() {
    this._isOnline = true
    this.notifyListeners()
  }

  private handleOffline() {
    this._isOnline = false
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this._isOnline))
  }

  subscribe(listener: (isOnline: boolean) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  get isOnline() {
    return this._isOnline
  }
}

export const offlineDetector = new OfflineDetector()
```

### 5. `src/hooks/use-pwa.ts`
```typescript
import { useState, useEffect } from 'react'
import { offlineDetector } from '@/lib/pwa/offline-detector'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Subscribe to online/offline changes
    const unsubscribe = offlineDetector.subscribe(setIsOnline)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false)
    }

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
    }

    setDeferredPrompt(null)
  }

  return {
    isOnline,
    isInstallable,
    installPWA,
    isInstalled: window.matchMedia('(display-mode: standalone)').matches,
  }
}
```

### 6. `src/hooks/use-offline-sync.ts`
```typescript
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
```

### 7. `src/components/PWA/OfflineIndicator.tsx`
```tsx
interface OfflineIndicatorProps {
  isOnline: boolean
}

export function OfflineIndicator({ isOnline }: OfflineIndicatorProps) {
  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium z-50">
      🔌 Sin conexión - Trabajando en modo offline
    </div>
  )
}
```

### 8. `src/components/PWA/SyncStatus.tsx`
```tsx
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
```

### 9. `src/components/PWA/InstallPrompt.tsx`
```tsx
import { X } from 'phosphor-react'
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
```

---

## ✅ Pasos de Implementación

### 1. Instalar dependencias
```bash
npm install vite-plugin-pwa workbox-window idb
```

### 2. Crear estructura de carpetas
```bash
mkdir -p src/workers src/lib/db src/lib/pwa src/components/PWA
```

### 3. Crear archivos según especificación
- Copiar todos los archivos nuevos
- Modificar archivos existentes

### 4. Generar iconos PWA
```bash
# Crear iconos en public/
public/pwa-192x192.png
public/pwa-512x512.png
public/apple-touch-icon.png
public/badge-72x72.png
```

### 5. Probar PWA
```bash
# Build de producción
npm run build

# Servir con preview
npm run preview

# Verificar en Chrome DevTools:
# Application > Service Workers
# Application > Storage > IndexedDB
```

---

## 🧪 Validación

### Tests a realizar:
1. ✅ Service Worker se registra correctamente
2. ✅ IndexedDB se inicializa
3. ✅ Indicador offline aparece sin conexión
4. ✅ Datos se guardan localmente
5. ✅ Sincronización funciona al reconectar
6. ✅ Prompt de instalación aparece
7. ✅ App funciona sin conexión

**Herramientas:**
- Chrome DevTools > Application
- Chrome DevTools > Network (throttling)
- Lighthouse PWA audit

---

## 🔍 Interfaces Exportadas

### Hooks:
```typescript
usePWA()              // Estado de PWA e instalación
useOfflineSync()      // Estado de sincronización
```

### Managers:
```typescript
syncManager.syncAll()          // Sincronizar todo
syncManager.startAutoSync()    // Iniciar sync automático
offlineDetector.isOnline       // Estado de conexión
```

### DB Operations:
```typescript
saveOrder(order)               // Guardar orden offline
getPendingOrders()             // Obtener órdenes pendientes
addPendingAction(...)          // Agregar acción pendiente
```

---

## ⚠️ Conflictos con Otros Planes

### Todos los planes:
- ✅ **Sin conflictos**: Este plan es independiente
- Los otros planes pueden usar `saveOrder()`, `saveClient()` para soporte offline

---

## 📚 Referencias

- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox](https://developer.chrome.com/docs/workbox/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Última actualización:** 2026-01-17 03:10:00  
**Autor:** Plan ID PLAN-03