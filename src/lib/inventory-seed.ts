import type { InventoryItem } from './types'

const VIDRIOS_SENCILLOS = [
  "Vidrio Temp. Sencillo Ip_11",
  "Vidrio Temp. Sencillo Ip_11_Pro",
  "Vidrio Temp. Sencillo Ip_11_Pro_Max",
  "Vidrio Temp. Sencillo Ip_12_mini",
  "Vidrio Temp. Sencillo Ip_12",
  "Vidrio Temp. Sencillo Ip_12_Pro",
  "Vidrio Temp. Sencillo Ip_12_Pro_Max",
  "Vidrio Temp. Sencillo Ip_13_mini",
  "Vidrio Temp. Sencillo Ip_13",
  "Vidrio Temp. Sencillo Ip_13_Pro",
  "Vidrio Temp. Sencillo Ip_13_Pro_Max",
  "Vidrio Temp. Sencillo Ip_14",
  "Vidrio Temp. Sencillo Ip_14_Plus",
  "Vidrio Temp. Sencillo Ip_14_Pro",
  "Vidrio Temp. Sencillo Ip_14_Pro_Max",
  "Vidrio Temp. Sencillo Ip_15",
  "Vidrio Temp. Sencillo Ip_15_Plus",
  "Vidrio Temp. Sencillo Ip_15_Pro",
  "Vidrio Temp. Sencillo Ip_15_Pro_Max",
  "Vidrio Temp. Sencillo Ip_16e",
  "Vidrio Temp. Sencillo Ip_16",
  "Vidrio Temp. Sencillo Ip_16_Plus",
  "Vidrio Temp. Sencillo Ip_16_Pro",
  "Vidrio Temp. Sencillo Ip_16_Pro_Max",
  "Vidrio Temp. Sencillo Ip_17",
  "Vidrio Temp. Sencillo Ip_17_Air",
  "Vidrio Temp. Sencillo Ip_17_Pro",
  "Vidrio Temp. Sencillo Ip_17_Pro_Max"
]

const VIDRIOS_PRIVACIDAD = [
  "Vidrio Temp. Privacidad Ip_11",
  "Vidrio Temp. Privacidad Ip_11_Pro",
  "Vidrio Temp. Privacidad Ip_11_Pro_Max",
  "Vidrio Temp. Privacidad Ip_12_mini",
  "Vidrio Temp. Privacidad Ip_12",
  "Vidrio Temp. Privacidad Ip_12_Pro",
  "Vidrio Temp. Privacidad Ip_12_Pro_Max",
  "Vidrio Temp. Privacidad Ip_13_mini",
  "Vidrio Temp. Privacidad Ip_13",
  "Vidrio Temp. Privacidad Ip_13_Pro",
  "Vidrio Temp. Privacidad Ip_13_Pro_Max",
  "Vidrio Temp. Privacidad Ip_14",
  "Vidrio Temp. Privacidad Ip_14_Plus",
  "Vidrio Temp. Privacidad Ip_14_Pro",
  "Vidrio Temp. Privacidad Ip_14_Pro_Max",
  "Vidrio Temp. Privacidad Ip_15",
  "Vidrio Temp. Privacidad Ip_15_Plus",
  "Vidrio Temp. Privacidad Ip_15_Pro",
  "Vidrio Temp. Privacidad Ip_15_Pro_Max",
  "Vidrio Temp. Privacidad Ip_16e",
  "Vidrio Temp. Privacidad Ip_16",
  "Vidrio Temp. Privacidad Ip_16_Plus",
  "Vidrio Temp. Privacidad Ip_16_Pro",
  "Vidrio Temp. Privacidad Ip_16_Pro_Max",
  "Vidrio Temp. Privacidad Ip_17",
  "Vidrio Temp. Privacidad Ip_17_Air",
  "Vidrio Temp. Privacidad Ip_17_Pro",
  "Vidrio Temp. Privacidad Ip_17_Pro_Max"
]

function generateSKU(name: string): string {
  const modelo = name.match(/Ip_[\w_]+/)?.[0] || ''
  const tipo = name.includes('Sencillo') ? 'SEN' : 'PRIV'
  return `VT-${tipo}-${modelo.replace('Ip_', 'IP')}`
}

export async function seedVidriosTemplados(): Promise<{
  added: number
  skipped: number
  errors: string[]
}> {
  const results = {
    added: 0,
    skipped: 0,
    errors: [] as string[]
  }

  const existingItems = await window.spark.kv.get<InventoryItem[]>('inventory') || []
  const existingSKUs = new Set(existingItems.map(item => item.sku))

  const allVidrios = [
    ...VIDRIOS_SENCILLOS.map(name => ({ name, type: 'sencillo' as const })),
    ...VIDRIOS_PRIVACIDAD.map(name => ({ name, type: 'privacidad' as const }))
  ]

  const newItems: InventoryItem[] = []

  for (const vidrio of allVidrios) {
    const sku = generateSKU(vidrio.name)
    
    if (existingSKUs.has(sku)) {
      results.skipped++
      continue
    }

    try {
      const buyPrice = vidrio.type === 'sencillo' ? 80 : 120
      const sellPrice = vidrio.type === 'sencillo' ? 150 : 220

      const newItem: InventoryItem = {
        id: `vt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sku,
        name: vidrio.name,
        category: vidrio.type === 'sencillo' ? 'Vidrios Templados Sencillos' : 'Vidrios Templados Privacidad',
        buyPrice,
        sellPrice,
        currentStock: 0,
        minStock: 3,
        location: vidrio.type === 'sencillo' ? 'Estante VT-A' : 'Estante VT-B'
      }

      newItems.push(newItem)
      results.added++
    } catch (error) {
      results.errors.push(`Error al agregar ${vidrio.name}: ${error}`)
    }
  }

  if (newItems.length > 0) {
    const updatedInventory = [...existingItems, ...newItems]
    await window.spark.kv.set('inventory', updatedInventory)
  }

  return results
}

export async function checkIfVidriosExist(): Promise<boolean> {
  const items = await window.spark.kv.get<InventoryItem[]>('inventory') || []
  return items.some(item => 
    item.category === 'Vidrios Templados Sencillos' || 
    item.category === 'Vidrios Templados Privacidad'
  )
}

export async function getVidriosStats(): Promise<{
  sencillos: number
  privacidad: number
  total: number
}> {
  const items = await window.spark.kv.get<InventoryItem[]>('inventory') || []
  
  const sencillos = items.filter(item => item.category === 'Vidrios Templados Sencillos').length
  const privacidad = items.filter(item => item.category === 'Vidrios Templados Privacidad').length
  
  return {
    sencillos,
    privacidad,
    total: sencillos + privacidad
  }
}
