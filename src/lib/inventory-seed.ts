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

// Pricing constants - Accesorios
const ACCESORIO_UNIVERSAL_BUY_PRICE = 200
const ACCESORIO_UNIVERSAL_SELL_PRICE = 500
const CABLE_BUY_PRICE = 50
const CABLE_SELL_PRICE = 150
const ADAPTADOR_BUY_PRICE = 100
const ADAPTADOR_SELL_PRICE = 300

// Location constant
const VIDRIOS_LOCATION = 'Recepción'
const PROTECTORES_LOCATION = 'Recepción'
const ACCESORIOS_LOCATION = 'Recepción'

// Stock constants
const MIN_STOCK = 2

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

const ACCESORIOS_UNIVERSALES_IPHONE = [
  { name: "AirPods (4th Gen) Wireless Case", description: "Audífonos inalámbricos de última generación. El estuche se carga mediante tecnología inalámbrica o con cable compatible con iPhone." },
  { name: "AirPods Pro (2nd Gen) MagSafe USB-C", description: "Audífonos intraauriculares con cancelación activa de ruido. Estuche compatible con carga MagSafe y puerto USB-C." },
  { name: "AirPods Max (USB-C Edition)", description: "Audífonos circumaurales de alta fidelidad. Incluyen cable USB-C para carga y conectividad con dispositivos actuales." },
  { name: "MagSafe Charger (25W Fast Charge)", description: "Cargador inalámbrico magnético de 25W. Se adhiere a la parte posterior del iPhone para carga sin cables." },
  { name: "MagSafe Wallet con Find My", description: "Cartera magnética compatible con MagSafe. Incluye tecnología Find My para localización en caso de extravío." },
  { name: "Apple AirTag (Single Pack)", description: "Dispositivo de rastreo Bluetooth. Permite localizar objetos personales mediante la aplicación Buscar de Apple." },
  { name: "Kit Carga Rápida 20W (USB-C + Lightning)", description: "Kit de carga completo: adaptador de 20W y cable USB-C a Lightning. Compatible con iPhone 14 y modelos anteriores." },
  { name: "Kit Carga Rápida 30W (USB-C + USB-C)", description: "Kit de carga de alta potencia: adaptador de 30W y cable USB-C. Compatible con iPhone 15, 16 y 17." },
  { name: "Kit Carga Estándar (USB-A + Lightning)", description: "Kit de carga básico: adaptador USB-A y cable Lightning. Velocidad de carga estándar para modelos compatibles." },
  { name: "Kit Carga Estándar (USB-A + USB-C)", description: "Kit de carga básico: adaptador USB-A y cable USB-C. Velocidad de carga estándar para iPhone 15 en adelante." }
]

const CABLES_CARGA_Y_DATOS = [
  { name: "Cable Apple USB-C a USB-C (1m) Trenzado", description: "Cable trenzado de 1 metro con conectores USB-C en ambos extremos. Compatible con iPhone 15 en adelante para carga y transferencia de datos." },
  { name: "Cable Apple USB-C a USB-C (2m) Trenzado", description: "Cable trenzado de 2 metros con conectores USB-C en ambos extremos. Versión extendida para mayor alcance y comodidad." },
  { name: "Cable Apple USB-C a Lightning (1m)", description: "Cable de 1 metro con conector USB-C y Lightning. Permite carga rápida en iPhone 14 y modelos anteriores compatibles." },
  { name: "Cable Apple USB-C a Lightning (2m)", description: "Cable de 2 metros con conector USB-C y Lightning. Versión extendida para carga rápida de dispositivos Lightning." },
  { name: "Cable Apple USB-A a Lightning (1m)", description: "Cable estándar de 1 metro con conectores USB-A y Lightning. Compatible con adaptadores tradicionales y dispositivos Lightning." },
  { name: "Cable Apple USB-A a USB-C (1m)", description: "Cable de 1 metro con conector USB-A y USB-C. Permite usar adaptadores convencionales con dispositivos iPhone modernos." },
  { name: "Cable Thunderbolt 4 Pro (USB-C) 1m", description: "Cable profesional de alto rendimiento de 1 metro. Compatible con Thunderbolt 4 para transferencia de datos de alta velocidad." }
]

const ADAPTADORES_DE_CORRIENTE = [
  { name: "Apple 20W USB-C Power Adapter", description: "Adaptador de corriente compacto de 20W con puerto USB-C. Proporciona carga rápida para iPhone y dispositivos compatibles." },
  { name: "Apple 30W USB-C Power Adapter", description: "Adaptador de corriente de 30W con puerto USB-C. Mayor potencia de carga, ideal para iPad y modelos iPhone Pro Max." },
  { name: "Apple 35W Dual USB-C Port Compact", description: "Adaptador de corriente compacto con dos puertos USB-C de 35W. Permite cargar simultáneamente dos dispositivos compatibles." },
  { name: "Apple 12W USB-A Power Adapter", description: "Adaptador de corriente de 12W con puerto USB-A. Proporciona velocidad de carga estándar para dispositivos compatibles." },
  { name: "Apple 5W USB-A Power Adapter (Legacy)", description: "Adaptador de corriente básico de 5W con puerto USB-A. Modelo clásico con velocidad de carga limitada, compatible con dispositivos tradicionales." }
]

function generateSKU(name: string): string {
  const modelo = name.match(/Ip_[\w_]+/)?.[0] || ''
  
  let prefix = 'VT'
  let tipo = ''
  
  if (name.includes('Vidrio Temp.')) {
    prefix = 'VT'
    tipo = name.includes('Sencillo') ? 'SEN' : 'PRIV'
    return `${prefix}-${tipo}-${modelo.replace('Ip_', 'IP')}`
  } else if (name.includes('Protector')) {
    prefix = 'PROT'
    if (name.includes('Uso Rudo')) {
      tipo = 'UR'
    } else if (name.includes('Sencillo')) {
      tipo = 'SEN'
    }
    return `${prefix}-${tipo}-${modelo.replace('Ip_', 'IP')}`
  } else if (name.includes('AirPods') || name.includes('MagSafe') || name.includes('AirTag') || name.includes('Kit ')) {
    // Accesorios Universales
    prefix = 'ACC'
    const shortName = name.substring(0, 15).replace(/[^A-Z0-9]/gi, '').toUpperCase()
    return `${prefix}-${shortName}`
  } else if (name.includes('Cable')) {
    // Cables
    prefix = 'CABLE'
    if (name.includes('USB-C a USB-C')) tipo = 'CC'
    else if (name.includes('USB-C a Lightning')) tipo = 'CL'
    else if (name.includes('USB-A a Lightning')) tipo = 'AL'
    else if (name.includes('USB-A a USB-C')) tipo = 'AC'
    else if (name.includes('Thunderbolt')) tipo = 'TB4'
    const length = name.includes('2m') ? '2M' : '1M'
    return `${prefix}-${tipo}-${length}`
  } else if (name.includes('Power Adapter') || name.includes('Adapter')) {
    // Adaptadores
    prefix = 'ADAPT'
    const watts = name.match(/(\d+)W/)?.[1] || 'STD'
    return `${prefix}-${watts}W`
  }
  
  // Fallback
  return `PROD-${name.substring(0, 10).replace(/[^A-Z0-9]/gi, '').toUpperCase()}`
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
    })),
    ...ACCESORIOS_UNIVERSALES_IPHONE.map(item => ({ 
      name: item.name, 
      type: 'accesorio_universal' as const,
      category: 'Accesorios Universales iPhone',
      buyPrice: ACCESORIO_UNIVERSAL_BUY_PRICE,
      sellPrice: ACCESORIO_UNIVERSAL_SELL_PRICE,
      location: ACCESORIOS_LOCATION,
      idPrefix: 'acc',
      description: item.description
    })),
    ...CABLES_CARGA_Y_DATOS.map(item => ({ 
      name: item.name, 
      type: 'cable' as const,
      category: 'Cables de Carga y Datos',
      buyPrice: CABLE_BUY_PRICE,
      sellPrice: CABLE_SELL_PRICE,
      location: ACCESORIOS_LOCATION,
      idPrefix: 'cable',
      description: item.description
    })),
    ...ADAPTADORES_DE_CORRIENTE.map(item => ({ 
      name: item.name, 
      type: 'adaptador' as const,
      category: 'Adaptadores de Corriente',
      buyPrice: ADAPTADOR_BUY_PRICE,
      sellPrice: ADAPTADOR_SELL_PRICE,
      location: ACCESORIOS_LOCATION,
      idPrefix: 'adapt',
      description: item.description
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
        minStock: MIN_STOCK,
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
    item.category === 'Protectores Uso Rudo' ||
    item.category === 'Accesorios Universales iPhone' ||
    item.category === 'Cables de Carga y Datos' ||
    item.category === 'Adaptadores de Corriente'
  )
}

export async function getVidriosStats(): Promise<{
  sencillos: number
  privacidad: number
  protectoresSencillos: number
  protectoresUsoRudo: number
  accesorios: number
  cables: number
  adaptadores: number
  total: number
}> {
  const items = await window.spark.kv.get<InventoryItem[]>('inventory') || []
  
  const sencillos = items.filter(item => item.category === 'Vidrios Templados Sencillos').length
  const privacidad = items.filter(item => item.category === 'Vidrios Templados Privacidad').length
  const protectoresSencillos = items.filter(item => item.category === 'Protectores Sencillos').length
  const protectoresUsoRudo = items.filter(item => item.category === 'Protectores Uso Rudo').length
  const accesorios = items.filter(item => item.category === 'Accesorios Universales iPhone').length
  const cables = items.filter(item => item.category === 'Cables de Carga y Datos').length
  const adaptadores = items.filter(item => item.category === 'Adaptadores de Corriente').length
  
  return {
    sencillos,
    privacidad,
    protectoresSencillos,
    protectoresUsoRudo,
    accesorios,
    cables,
    adaptadores,
    total: sencillos + privacidad + protectoresSencillos + protectoresUsoRudo + accesorios + cables + adaptadores
  }
}
