# Planning Guide

Sistema de gestión integral para taller de reparación de dispositivos móviles que digitaliza y optimiza el proceso completo desde la recepción hasta la entrega, con seguimiento en tiempo real vía QR y gestión de inventario.

**Experience Qualities**:
1. **Eficiente** - El sistema debe permitir registro rápido de órdenes y cambios de estado con mínimos clics, optimizado para el ritmo acelerado de un taller.
2. **Transparente** - Clientes y personal deben ver el estado actualizado en tiempo real, con historial completo y trazabilidad de cada acción.
3. **Confiable** - La información crítica (datos de cliente, equipos, pagos) debe persistir de forma segura con respaldo automático y sin pérdidas.

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
- El sistema requiere múltiples módulos interconectados: gestión de órdenes, clientes, inventario, reportes, roles de usuario, página pública de consulta QR, notificaciones automatizadas, y flujos complejos como pagos parciales y seguimiento de estado con fotografías.

## Essential Features

### Gestión de Órdenes de Reparación
- **Functionality**: Crear, editar y seguir el ciclo completo de una orden desde recepción hasta entrega, incluyendo datos del cliente, dispositivo, diagnóstico, costos, estado actual, fotografías de evidencia y generación automática de folio con QR.
- **Purpose**: Centralizar toda la información de reparaciones en un solo lugar eliminando papeles y permitiendo búsqueda instantánea.
- **Trigger**: Recepcionista/técnico hace clic en "Nueva Orden" desde el dashboard principal.
- **Progression**: Formulario multi-paso → Datos cliente (nuevo o existente) → Datos dispositivo (marca/modelo/IMEI/contraseña) → Descripción del problema → Diagnóstico y servicios → Costo estimado y fecha entrega → Generar orden con QR → Imprimir ticket.
- **Success criteria**: Orden creada en <60 segundos, QR generado automáticamente, ticket imprimible con datos legibles, orden consultable por múltiples criterios (folio, teléfono, IMEI, nombre).

### Seguimiento de Estados con Historial
- **Functionality**: Actualizar el estado de la orden (Recibido → En diagnóstico → Esperando repuestos → En reparación → Reparado → Entregado/Cancelado) con registro automático de usuario, fecha/hora y notas opcionales más fotografías adjuntas.
- **Purpose**: Trazabilidad completa del proceso y comunicación clara del progreso tanto al personal como al cliente vía QR público.
- **Trigger**: Técnico o recepcionista abre orden y selecciona "Cambiar Estado".
- **Progression**: Seleccionar orden → Modal de cambio de estado → Elegir nuevo estado → Agregar notas opcionales → Subir fotos (opcional) → Confirmar → Sistema registra cambio con timestamp y usuario → Notificación automática al cliente (si configurado).
- **Success criteria**: Historial completo visible con timeline visual, cada cambio muestra quién/cuándo/por qué, fotografías adjuntas accesibles, cliente ve actualización en página pública en tiempo real.

### Base de Datos de Clientes con Historial
- **Functionality**: Mantener registro unificado de clientes con todos sus datos de contacto (teléfono principal, alterno, email), historial completo de órdenes previas, equipos registrados, totales acumulados y badges de cliente (VIP >5 órdenes, Frecuente 3-5, Primera visita).
- **Purpose**: Reconocer clientes recurrentes, ofrecer servicio personalizado, evitar duplicados y tener contacto actualizado para seguimiento.
- **Trigger**: Al crear orden nueva, buscar cliente existente o registrar uno nuevo; también accesible desde módulo "Clientes".
- **Progression**: Buscar por nombre/teléfono → Si existe: mostrar historial completo con badge → Seleccionar y continuar orden / Si no existe: formulario nuevo cliente → Guardar → Asociar a orden actual.
- **Success criteria**: Cliente encontrado en <2 segundos por búsqueda parcial, historial muestra todas las órdenes previas ordenadas por fecha, badges visibles inmediatamente, posibilidad de actualizar número principal al momento de entrega.

### Gestión de Inventario de Repuestos
- **Functionality**: Catálogo completo de repuestos con SKU, nombre, categoría, precios (compra/venta), stock actual, stock mínimo, ubicación en bodega; registro de movimientos (entradas/salidas/ajustes) con responsable y motivo; alertas automáticas cuando stock llega a mínimo.
- **Purpose**: Control preciso de piezas disponibles, evitar faltantes, optimizar compras y vincular uso de repuestos directamente a órdenes de reparación.
- **Trigger**: Bodeguero accede a módulo "Inventario" o técnico busca repuesto al trabajar en orden.
- **Progression**: Ver catálogo filtrado por categoría → Agregar/editar repuesto → Registrar movimiento (entrada desde compra o salida por uso en orden) → Sistema actualiza stock → Si stock < mínimo: generar alerta visible en panel de notificaciones.
- **Success criteria**: Toda salida vinculada a orden específica, alertas visibles en dashboard, reportes de rotación y necesidades de reabastecimiento generados automáticamente, búsqueda rápida por código o nombre.

### Consulta Pública vía QR (Página sin Login)
- **Functionality**: Página web ligera y responsive accesible escaneando el QR del ticket, que muestra barra de progreso visual del estado actual, reglamento del taller, información básica de la orden (folio, marca/modelo, fecha recepción) y fotografías reducidas de diagnóstico si el taller las publica.
- **Purpose**: Transparencia total para el cliente sin necesidad de llamar al taller, reducción de consultas telefónicas, mejora de satisfacción del cliente.
- **Trigger**: Cliente escanea QR desde ticket impreso con su smartphone.
- **Progression**: Escanear QR → Redirección a URL pública única → Carga página sin login → Visualizar barra de progreso, estado actual, reglamento, datos del equipo → Opción de contactar al taller.
- **Success criteria**: Página carga en <2 segundos en 3G, diseño mobile-first, estado actualizado en tiempo real, compartible por WhatsApp, accesible 24/7 sin autenticación.

### Facturación y Control de Pagos
- **Functionality**: Generar recibos de recepción, cotizaciones y tickets de venta/facturas con desglose de servicios y repuestos; soporte para múltiples métodos de pago (efectivo, tarjeta, transferencia) y pagos parciales (anticipos); registro de ingresos/egresos con arqueo de caja y cierre diario.
- **Purpose**: Formalizar transacciones, control financiero diario, trazabilidad de pagos y cumplimiento fiscal básico.
- **Trigger**: Al crear orden (recibo de recepción), al finalizar reparación (cotización/factura final), al recibir pago.
- **Progression**: Seleccionar orden → Generar documento → Elegir tipo (recibo/cotización/factura) → Desglose automático de servicios y repuestos usados → Agregar método de pago → Registrar monto → Generar PDF e imprimir → Actualizar estado de pago en orden.
- **Success criteria**: PDFs generados instantáneamente con datos del taller y cliente, anticipos reflejados correctamente en balance, arqueo de caja diario sin discrepancias, reportes financieros exactos.

### Reportes y Analítica
- **Functionality**: Dashboards y reportes exportables (PDF/Excel) de órdenes por período, servicios más solicitados, tiempo promedio de reparación, ventas por tipo de servicio, margen de utilidad, valor de inventario, productos más usados, clientes frecuentes vs nuevos.
- **Purpose**: Toma de decisiones basada en datos, identificar tendencias, optimizar inventario y servicios, medir desempeño del negocio.
- **Trigger**: Administrador accede a módulo "Reportes" y selecciona tipo de reporte y rango de fechas.
- **Progression**: Elegir tipo de reporte → Configurar filtros (fechas, técnico, categoría) → Generar → Visualizar con gráficas interactivas → Exportar si necesario.
- **Success criteria**: Reportes generados en <5 segundos para rangos de hasta 1 año, gráficas claras y legibles, datos precisos y conciliados con registros de órdenes/inventario/pagos.

### Control de Acceso por Roles
- **Functionality**: Sistema de autenticación con 4 roles definidos (Administrador: acceso completo, Técnico: gestión de órdenes y diagnósticos, Recepcionista: recepción y entrega, Bodeguero: gestión de inventario) con permisos específicos y registro de auditoría de acciones críticas.
- **Purpose**: Seguridad de información sensible, responsabilidad individual, evitar errores por acceso inadecuado.
- **Trigger**: Usuario inicia sesión con credenciales.
- **Progression**: Login con usuario/contraseña → Sistema valida y determina rol → Redirección a dashboard personalizado según permisos → Acciones registradas en log de auditoría.
- **Success criteria**: Usuarios solo ven módulos permitidos, acciones críticas (eliminar orden, ajuste de inventario, modificar precios) requieren confirmación y quedan auditadas con usuario/fecha/hora.

## Edge Case Handling

- **Teléfono del cliente inoperable**: Al crear orden, si el dispositivo a reparar es el teléfono de contacto del cliente, el sistema solicita obligatoriamente un "contacto alterno" para notificaciones; al momento de entrega, flujo para actualizar el número principal del cliente.
- **Orden sin repuestos disponibles**: Si técnico intenta marcar orden como "En reparación" pero faltan repuestos, sistema muestra alerta y permite crear solicitud de compra a proveedor directamente desde la orden con notificación al bodeguero.
- **Cliente duplicado**: Al registrar cliente nuevo, búsqueda inteligente por similitud de nombre/teléfono para detectar posibles duplicados y ofrecer fusionar registros manteniendo historial completo.
- **Escaneo de QR de orden finalizada por personal**: Si un empleado autenticado escanea el QR de una orden en estado "Reparado - Pendiente de entrega", el sistema redirige automáticamente a la interfaz de confirmación de entrega en lugar de la vista pública.
- **Pérdida de conexión durante registro**: Aplicación PWA guarda orden en IndexedDB local y sincroniza automáticamente cuando se restablece conexión, notificando al usuario del estado de sincronización.
- **Fotografías grandes**: Al subir fotos de diagnóstico/evidencia, sistema comprime automáticamente para web conservando calidad suficiente y almacena versión reducida para vista pública QR.
- **Múltiples equipos del mismo cliente simultáneamente**: Permitir crear múltiples órdenes activas para el mismo cliente, cada una con su equipo y proceso independiente, pero vinculadas en el historial del cliente.
- **Cambio de estado hacia atrás**: Permitir regresar a estado anterior (ej: de "En reparación" a "Esperando repuestos") con justificación obligatoria en nota del historial.

## Design Direction

El diseño debe evocar **confianza profesional, eficiencia operativa y tecnología accesible**. La interfaz debe sentirse moderna y capaz, transmitiendo organización y control, pero sin intimidar a usuarios no técnicos. Los colores deben inspirar estabilidad y claridad, con acentos energéticos que reflejen la rapidez del servicio. La tipografía debe ser legible bajo presión (ambiente de taller con luz variable), y las interacciones deben ser directas y sin fricción. El sistema completo debe proyectar la sensación de "todo bajo control".

## Color Selection

El esquema de color combina tonos tecnológicos fríos con acentos cálidos de urgencia/acción:

- **Primary Color**: Azul tecnológico profundo `oklch(0.45 0.15 250)` - Transmite confiabilidad, profesionalismo técnico y estabilidad. Color principal para encabezados, botones de acción primaria y navegación.
- **Secondary Colors**: 
  - Gris carbón `oklch(0.30 0.01 260)` para texto y elementos estructurales - Modernidad y seriedad sin ser opresivo.
  - Gris claro `oklch(0.96 0.005 260)` para fondos y áreas de descanso visual - Limpieza y amplitud.
- **Accent Color**: Naranja energético `oklch(0.68 0.18 40)` - Para CTAs críticos (crear orden, cambiar estado, alertas de inventario), badges de cliente VIP y notificaciones de acción requerida. Comunica urgencia positiva y energía.
- **Foreground/Background Pairings**:
  - Primary (Azul `oklch(0.45 0.15 250)`): Texto blanco `oklch(1 0 0)` - Ratio 9.2:1 ✓
  - Accent (Naranja `oklch(0.68 0.18 40)`): Texto gris oscuro `oklch(0.25 0.01 260)` - Ratio 7.8:1 ✓
  - Background (Gris claro `oklch(0.96 0.005 260)`): Texto gris carbón `oklch(0.30 0.01 260)` - Ratio 12.1:1 ✓
  - Card (Blanco `oklch(1 0 0)`): Texto gris carbón `oklch(0.30 0.01 260)` - Ratio 14.5:1 ✓

Estados adicionales:
- **Success**: Verde técnico `oklch(0.60 0.15 145)` para orden completada, pago recibido.
- **Warning**: Amarillo ámbar `oklch(0.75 0.14 85)` para stock bajo, orden retrasada.
- **Destructive**: Rojo controlado `oklch(0.55 0.22 25)` para cancelaciones, eliminaciones.

## Font Selection

La tipografía debe ser ultra-legible en pantallas variadas (escritorio, tablet, móvil) y bajo condiciones de taller (luz variable, lectura rápida). Se busca modernidad técnica con humanidad accesible.

- **Primary Font**: **Inter** para interfaz general - Familia sans-serif diseñada para legibilidad en pantalla, con métricas optimizadas y soporte completo de pesos. Transmite modernidad sin frialdad.
- **Display/Headers Font**: **Space Grotesk** para títulos principales y números de folio - Geométrica y distintiva, aporta personalidad técnica sin sacrificar claridad.

**Typographic Hierarchy**:
- **H1 (Página/Título principal)**: Space Grotesk Bold / 32px / tracking tight / color primary
- **H2 (Sección)**: Space Grotesk Semibold / 24px / tracking normal / color foreground
- **H3 (Card title/Subsección)**: Inter Semibold / 18px / tracking slight / color foreground
- **Body (Texto general)**: Inter Regular / 15px / line-height 1.6 / color foreground
- **Label (Formularios)**: Inter Medium / 13px / uppercase / tracking wide / color muted-foreground
- **Caption (Metadatos, timestamps)**: Inter Regular / 12px / line-height 1.4 / color muted-foreground
- **Button Text**: Inter Semibold / 14px / tracking slight / color según botón
- **Folio/QR Numbers**: Space Grotesk Bold / 20px / monospace feel / color accent para destacar

## Animations

Las animaciones deben servir exclusivamente para **guiar la atención, confirmar acciones y suavizar transiciones**, nunca para decorar. El sistema debe sentirse instantáneamente responsivo.

- **Cambios de estado de orden**: Transición suave de color del badge de estado (200ms ease-out) + subtle scale pulse (1.0 → 1.05 → 1.0 en 300ms) al actualizar para confirmar visualmente el cambio.
- **Creación de orden exitosa**: Checkmark animado (stroke draw animation 400ms) + confetti muy sutil (3-4 partículas, 600ms fade out) para reforzar éxito sin interrumpir flujo.
- **Alertas de inventario**: Slide in desde derecha (300ms ease-out) para notificaciones de stock bajo, con bounce muy leve al final para captar atención.
- **Carga de página/módulo**: Skeleton screens con shimmer sutil (1.5s loop) en lugar de spinners para mantener estructura visual durante carga.
- **Escaneo QR exitoso**: Ripple effect desde punto de escaneo (500ms) + haptic feedback (si disponible) para confirmar lectura.
- **Modal/Dialog**: Backdrop fade in (200ms) + modal scale from 0.95 to 1.0 (250ms ease-out) para entrada suave sin sobresalto.
- **Hover en botones primarios**: Lift effect (translateY -2px + shadow increase en 150ms) para affordance de interactividad.
- **Timeline de historial**: Stagger animation de items (cada uno 100ms después del anterior) al cargar para crear sensación de construcción de línea de tiempo.

Todas las animaciones respetan `prefers-reduced-motion` y se desactivan completamente si el usuario lo solicita.

## Component Selection

### **Components** (Shadcn + Tailwind):
- **Dialog**: Para modales de creación/edición de orden, cambio de estado, confirmación de acciones críticas. Configuración: size="lg" para formularios complejos, backdrop blur para énfasis.
- **Card**: Contenedor base para órdenes en dashboard, detalles de cliente, items de inventario. Variante: con hover effect (lift + shadow) para cards clickeables.
- **Badge**: Estados de orden (colores dinámicos según estado), badges de cliente (VIP/Frecuente), alertas de stock. Variante: con dot indicator para estados activos.
- **Table**: Listados de órdenes, inventario, reportes. Configuración: sortable headers, sticky header en scroll, row selection para acciones masivas.
- **Form** + **Input/Textarea/Select**: Formularios de orden y cliente con validación en tiempo real usando react-hook-form + zod. Labels siempre visibles, placeholders como ayuda adicional.
- **Tabs**: Navegación entre módulos principales (Órdenes/Clientes/Inventario/Reportes) y dentro de detalle de orden (Información/Historial/Pagos/Fotos).
- **Progress**: Barra de progreso visual del estado de orden en página pública QR, con steps claramente marcados.
- **Popover**: Tooltips informativos en campos complejos (ej: explicación de IMEI), menús de acciones contextuales en filas de tabla.
- **Avatar**: Representación visual de clientes en historial (con iniciales o foto si disponible).
- **Button**: Variantes primary (crear orden, guardar), secondary (cancelar, volver), destructive (eliminar), ghost (acciones terciarias). Siempre con icon + text excepto acciones obvias.
- **Separator**: Divisores visuales en formularios largos y secciones de dashboard.
- **Alert**: Mensajes de confirmación, advertencias de stock bajo, errores de validación. Variantes: success/warning/error con iconos apropiados.
- **Sonner (Toast)**: Notificaciones no-invasivas de acciones completadas (orden creada, estado actualizado, pago registrado) con auto-dismiss en 3-4s.
- **Accordion**: FAQ/reglamento en página pública, secciones colapsables de formularios extensos.
- **Calendar** + **DatePicker**: Selección de fecha estimada de entrega, filtros por rango de fechas en reportes.
- **Command**: Búsqueda rápida global (cmd+k) para encontrar órdenes, clientes, repuestos por cualquier criterio.

### **Customizations** (Componentes propios):
- **StatusBadge**: Badge personalizado con iconos específicos por estado + animación de cambio, colores mapeados exactamente a estados del sistema.
- **OrderTimeline**: Timeline vertical con conectores, mostrando historial de estados con fotos adjuntas en vista expandible.
- **QRGenerator**: Componente para generar QR único por orden con opción de descargar PNG o incluir en PDF del ticket.
- **ClientBadge**: Badge especial con iconos y colores para VIP/Frecuente/Primera Visita basado en conteo automático de órdenes.
- **InventoryAlert**: Card flotante de notificación persistente en dashboard cuando hay items bajo stock mínimo con link directo a módulo de inventario.
- **QuickActionButton**: Botón circular flotante (FAB) en mobile para acción principal de cada vista (Nueva Orden en dashboard, Agregar Repuesto en inventario).
- **PhotoGallery**: Grid de fotografías de diagnóstico con lightbox, compresión automática y opción de publicar en vista pública o mantener privadas.

### **States** (Interacciones):
- **Buttons**: Default (solid con shadow), hover (lift + brightness), active (scale 0.97), focus (ring accent), disabled (opacity 50% + cursor not-allowed).
- **Inputs**: Default (border muted), focus (border accent + ring), error (border destructive + red text), success (border green + checkmark), disabled (bg muted).
- **Cards**: Default (border subtle), hover (shadow-lg + border accent si clickeable), selected (border accent + bg accent/10).
- **Table rows**: Default (border-b), hover (bg muted), selected (bg accent/10 + border-l-4 accent).

### **Icon Selection** (@phosphor-icons/react):
- **Órdenes**: Wrench, ClipboardText, Package, CheckCircle, XCircle, Clock, Warning
- **Clientes**: User, Users, Phone, EnvelopeSimple, Star (VIP), Fire (Frecuente)
- **Inventario**: Archive, TrendUp, TrendDown, WarningCircle, MagnifyingGlass
- **Acciones**: Plus, PencilSimple, Trash, ArrowRight, QrCode, Printer, Download
- **Estados**: CircleDashed (diagnóstico), Hourglass (esperando), Gear (reparación), CheckCircle (completo), XCircle (cancelado)
- **Navegación**: House, ListBullets, ChartBar, GearSix

### **Spacing** (Sistema Tailwind consistente):
- **Section gaps**: gap-8 (2rem) entre secciones principales
- **Card padding**: p-6 (1.5rem) para cards de contenido, p-4 (1rem) para cards compactas
- **Form spacing**: space-y-4 (1rem) entre campos, space-y-6 (1.5rem) entre grupos de campos
- **Button spacing**: px-4 py-2 para buttons regulares, px-6 py-3 para primary/large
- **Grid gaps**: gap-4 (1rem) para grids de cards, gap-2 (0.5rem) para badges/chips
- **Container max-width**: max-w-7xl con mx-auto para contenido principal
- **Consistent margins**: mb-8 para títulos de página, mb-4 para subtítulos, mb-2 para labels

### **Mobile** (Responsive strategy):
- **Breakpoints**: Mobile-first, major shifts en md (768px) y lg (1024px)
- **Navigation**: Bottom tab bar en mobile (Casa/Órdenes/Inventario/Más), sidebar colapsable en desktop
- **Tables**: En mobile se convierten en cards apiladas con datos clave visibles, botón "Ver más" para detalles completos
- **Forms**: Campos full-width en mobile, 2-column en tablet+, labels siempre arriba en mobile (nunca inline)
- **Modals**: Full-screen en mobile con header sticky, centered con max-width en desktop
- **Dashboard**: Single column stack en mobile, 2-column en tablet, 3-column en desktop
- **FAB (Floating Action Button)**: Visible solo en mobile para acción principal, reemplazado por botón en header en desktop
- **Typography**: Escala ligeramente menor en mobile (H1 28px → 32px desktop)
- **Touch targets**: Mínimo 44px de altura para todos los botones/links en mobile
- **Escaneo QR**: Botón grande y accesible en mobile, uso de cámara nativa cuando disponible
