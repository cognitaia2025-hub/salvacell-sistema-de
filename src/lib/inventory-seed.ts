import type { InventoryItem } from './types'

// Pricing constants - Vidrios Templados
const SENCILLO_BUY_PRICE = 10
const SENCILLO_SELL_PRICE = 50
const PRIVACIDAD_BUY_PRICE = 30
const PRIVACIDAD_SELL_PRICE = 150

// Pricing constants - Protectores
const PROTECTOR_SENCILLO_BUY_PRICE = 5
const PROTECTOR_SENCILLO_SELL_PRICE = 30
const PROTECTOR_USO_RUDO_BUY_PRICE = 15
const PROTECTOR_USO_RUDO_SELL_PRICE = 80

// Location constant
const VIDRIOS_LOCATION = 'Recepción'
const PROTECTORES_LOCATION = 'Recepción'

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

const PROTECTORES_SENCILLOS = [
  "Protector Sencillo Ip_11",
  "Protector Sencillo Ip_11_Pro",
  "Protector Sencillo Ip_11_Pro_Max",
  "Protector Sencillo Ip_12_mini",
  "Protector Sencillo Ip_12",
  "Protector Sencillo Ip_12_Pro",
  "Protector Sencillo Ip_12_Pro_Max",
  "Protector Sencillo Ip_13_mini",
  "Protector Sencillo Ip_13",
  "Protector Sencillo Ip_13_Pro",
  "Protector Sencillo Ip_13_Pro_Max",
  "Protector Sencillo Ip_14",
  "Protector Sencillo Ip_14_Plus",
  "Protector Sencillo Ip_14_Pro",
  "Protector Sencillo Ip_14_Pro_Max",
  "Protector Sencillo Ip_15",
  "Protector Sencillo Ip_15_Plus",
  "Protector Sencillo Ip_15_Pro",
  "Protector Sencillo Ip_15_Pro_Max",
  "Protector Sencillo Ip_16e",
  "Protector Sencillo Ip_16",
  "Protector Sencillo Ip_16_Plus",
  "Protector Sencillo Ip_16_Pro",
  "Protector Sencillo Ip_16_Pro_Max",
  "Protector Sencillo Ip_17",
  "Protector Sencillo Ip_17_Air",
  "Protector Sencillo Ip_17_Pro",
  "Protector Sencillo Ip_17_Pro_Max"
]

const PROTECTORES_USO_RUDO = [
  "Protector Uso Rudo Ip_11",
  "Protector Uso Rudo Ip_11_Pro",
  "Protector Uso Rudo Ip_11_Pro_Max",
  "Protector Uso Rudo Ip_12_mini",
  "Protector Uso Rudo Ip_12",
  "Protector Uso Rudo Ip_12_Pro",
  "Protector Uso Rudo Ip_12_Pro_Max",
  "Protector Uso Rudo Ip_13_mini",
  "Protector Uso Rudo Ip_13",
  "Protector Uso Rudo Ip_13_Pro",
  "Protector Uso Rudo Ip_13_Pro_Max",
  "Protector Uso Rudo Ip_14",
  "Protector Uso Rudo Ip_14_Plus",
  "Protector Uso Rudo Ip_14_Pro",
  "Protector Uso Rudo Ip_14_Pro_Max",
  "Protector Uso Rudo Ip_15",
  "Protector Uso Rudo Ip_15_Plus",
  "Protector Uso Rudo Ip_15_Pro",
  "Protector Uso Rudo Ip_15_Pro_Max",
  "Protector Uso Rudo Ip_16e",
  "Protector Uso Rudo Ip_16",
  "Protector Uso Rudo Ip_16_Plus",
  "Protector Uso Rudo Ip_16_Pro",
  "Protector Uso Rudo Ip_16_Pro_Max",
  "Protector Uso Rudo Ip_17",
  "Protector Uso Rudo Ip_17_Air",
  "Protector Uso Rudo Ip_17_Pro",
  "Protector Uso Rudo Ip_17_Pro_Max"
]

function generateSKU(name: string): string {
  const modelo = name.match(/Ip_[\w_]+/)?.[0] || ''
  
  let prefix = 'VT'
  let tipo = ''
  
  if (name.includes('Vidrio Temp.')) {
    prefix = 'VT'
    tipo = name.includes('Sencillo') ? 'SEN' : 'PRIV'
  } else if (name.includes('Protector')) {
    prefix = 'PROT'
    if (name.includes('Uso Rudo')) {
      tipo = 'UR'
    } else if (name.includes('Sencillo')) {
      tipo = 'SEN'
    }
  }
  
  return `${prefix}-${tipo}-${modelo.replace('Ip_', 'IP')}`
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

  const allProducts = [
    ...VIDRIOS_SENCILLOS.map(name => ({ 
      name, 
      type: 'vidrio_sencillo' as const,
      category: 'Vidrios Templados Sencillos',
      buyPrice: SENCILLO_BUY_PRICE,
      sellPrice: SENCILLO_SELL_PRICE,
      location: VIDRIOS_LOCATION,
      idPrefix: 'vt'
    })),
    ...VIDRIOS_PRIVACIDAD.map(name => ({ 
      name, 
      type: 'vidrio_privacidad' as const,
      category: 'Vidrios Templados Privacidad',
      buyPrice: PRIVACIDAD_BUY_PRICE,
      sellPrice: PRIVACIDAD_SELL_PRICE,
      location: VIDRIOS_LOCATION,
      idPrefix: 'vt'
    })),
    ...PROTECTORES_SENCILLOS.map(name => ({ 
      name, 
      type: 'protector_sencillo' as const,
      category: 'Protectores Sencillos',
      buyPrice: PROTECTOR_SENCILLO_BUY_PRICE,
      sellPrice: PROTECTOR_SENCILLO_SELL_PRICE,
      location: PROTECTORES_LOCATION,
      idPrefix: 'prot'
    })),
    ...PROTECTORES_USO_RUDO.map(name => ({ 
      name, 
      type: 'protector_uso_rudo' as const,
      category: 'Protectores Uso Rudo',
      buyPrice: PROTECTOR_USO_RUDO_BUY_PRICE,
      sellPrice: PROTECTOR_USO_RUDO_SELL_PRICE,
      location: PROTECTORES_LOCATION,
      idPrefix: 'prot'
    }))
  ]

  const newItems: InventoryItem[] = []

  for (const product of allProducts) {
    const sku = generateSKU(product.name)
    
    if (existingSKUs.has(sku)) {
      results.skipped++
      continue
    }

    try {
      const newItem: InventoryItem = {
        id: `${product.idPrefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sku,
        name: product.name,
        category: product.category,
        buyPrice: product.buyPrice,
        sellPrice: product.sellPrice,
        currentStock: 0,
        minStock: 3,
        location: product.location
      }

      newItems.push(newItem)
      results.added++
    } catch (error) {
      results.errors.push(`Error al agregar ${product.name}: ${error}`)
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
    item.category === 'Vidrios Templados Privacidad' ||
    item.category === 'Protectores Sencillos' ||
    item.category === 'Protectores Uso Rudo'
  )
}

export async function getVidriosStats(): Promise<{
  sencillos: number
  privacidad: number
  protectoresSencillos: number
  protectoresUsoRudo: number
  total: number
}> {
  const items = await window.spark.kv.get<InventoryItem[]>('inventory') || []
  
  const sencillos = items.filter(item => item.category === 'Vidrios Templados Sencillos').length
  const privacidad = items.filter(item => item.category === 'Vidrios Templados Privacidad').length
  const protectoresSencillos = items.filter(item => item.category === 'Protectores Sencillos').length
  const protectoresUsoRudo = items.filter(item => item.category === 'Protectores Uso Rudo').length
  
  return {
    sencillos,
    privacidad,
    protectoresSencillos,
    protectoresUsoRudo,
    total: sencillos + privacidad + protectoresSencillos + protectoresUsoRudo
  }
}
