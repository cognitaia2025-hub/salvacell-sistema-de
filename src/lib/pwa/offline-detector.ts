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
