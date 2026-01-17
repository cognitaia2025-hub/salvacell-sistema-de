# 📚 Documentación de Planes de Desarrollo - SalvaCell

Bienvenido a la documentación de planes modulares para el desarrollo de nuevas funcionalidades en SalvaCell.

---

## 🎯 Propósito de esta Carpeta

Esta carpeta contiene **planes de implementación independientes y modulares** diseñados para ser ejecutados por agentes de IA o desarrolladores sin necesidad de contexto previo de otros planes.

Cada plan:
- ✅ Es completamente autónomo
- ✅ Especifica exactamente qué archivos crea y modifica
- ✅ Define interfaces claras (APIs, funciones, exports)
- ✅ Evita conflictos de código entre planes
- ✅ Se integra perfectamente con el código existente

---

## 📋 Lista de Planes

| Plan ID | Título | Categoría | Prioridad | Estado | Estimación |
|---------|--------|-----------|-----------|--------|------------|
| [PLAN-01](./PLAN-01-alembic-migrations.md) | Implementación de Alembic para Migraciones | Backend | 🔴 Alta | ⏳ Pendiente | 3-4h |
| [PLAN-02](./PLAN-02-pytest-testing.md) | Tests Unitarios con Pytest | Backend | 🔴 Alta | ⏳ Pendiente | 4-5h |
| [PLAN-03](./PLAN-03-pwa-offline-mode.md) | PWA Modo Offline Completo | Frontend | 🟡 Media | ⏳ Pendiente | 6-8h |
| [PLAN-04](./PLAN-04-dashboard-metrics.md) | Dashboard de Métricas y Estadísticas | Frontend | 🟡 Media | ⏳ Pendiente | 5-6h |
| [PLAN-05](./PLAN-05-pdf-generation.md) | Generación de PDFs con ReportLab | Backend | 🟡 Media | ⏳ Pendiente | 3-4h |
| [PLAN-06](./PLAN-06-s3-image-upload.md) | Upload de Imágenes a S3 | Backend | 🟢 Baja | ⏳ Pendiente | 4-5h |
| [PLAN-07](./PLAN-07-websockets-realtime.md) | WebSockets para Actualizaciones en Tiempo Real | Backend + Frontend | 🟢 Baja | ⏳ Pendiente | 6-7h |

**Total estimado:** 31-39 horas

---

## 🚀 Orden de Implementación Recomendado

### Fase 1: Infraestructura (Prioridad Alta)
1. **PLAN-01**: Alembic Migrations *(requisito para Plan 02)*
2. **PLAN-02**: Pytest Testing *(valida el resto de planes)*

### Fase 2: Features Frontend (Prioridad Media)
3. **PLAN-03**: PWA Offline Mode *(mejora UX)*
4. **PLAN-04**: Dashboard Metrics *(valor de negocio)*

### Fase 3: Features Backend (Prioridad Media-Baja)
5. **PLAN-05**: PDF Generation *(independiente)*
6. **PLAN-06**: S3 Image Upload *(mejora infraestructura)*

### Fase 4: Features Avanzadas (Prioridad Baja)
7. **PLAN-07**: WebSockets Realtime *(opcional, mejora UX)*

---

## 📐 Estructura de Cada Plan

Cada plan contiene las siguientes secciones:

1. **🎯 Objetivo**: Qué se va a lograr
2. **📦 Archivos a Crear**: Lista completa de archivos nuevos con rutas exactas
3. **🔧 Archivos a Modificar**: Lista de archivos existentes con zonas específicas de modificación
4. **📝 Contenido Detallado**: Código completo de cada archivo nuevo
5. **✅ Pasos de Implementación**: Instrucciones paso a paso
6. **🧪 Validación**: Tests y criterios de éxito
7. **🔍 Interfaces Exportadas**: Funciones/APIs que otros planes pueden usar
8. **⚠️ Conflictos con Otros Planes**: Dependencias o incompatibilidades
9. **📚 Referencias**: Documentación relevante
10. **❓ Preguntas Frecuentes**: Casos edge y troubleshooting

---

## 🔄 Matriz de Dependencias

```
PLAN-01 (Alembic)
    └─→ PLAN-02 (Tests) ← depende de Plan 01
    
PLAN-03 (PWA Offline) ← independiente

PLAN-04 (Dashboard) ← independiente

PLAN-05 (PDF) ← independiente

PLAN-06 (S3 Upload) ← independiente

PLAN-07 (WebSockets) ← independiente
    └─→ PLAN-04 (opcional: integración con dashboard)
```

**Nota:** Solo Plan 02 depende de Plan 01. El resto son completamente independientes.

---

## 🎨 Convenciones de Código

### Nombres de Archivos Nuevos

**Backend:**
```
backend/
├── alembic/              # PLAN-01
├── tests/                # PLAN-02
│   └── test_{feature}.py
├── utils/
│   ├── pdf_generator.py  # PLAN-05
│   └── s3_uploader.py    # PLAN-06
└── websockets/           # PLAN-07
    └── manager.py
```

**Frontend:**
```
src/
├── components/
│   ├── Dashboard/        # PLAN-04
│   │   ├── MetricsView.tsx
│   │   ├── ChartsSection.tsx
│   │   └── StatsCards.tsx
│   └── PWA/              # PLAN-03
│       ├── OfflineIndicator.tsx
│       └── SyncManager.tsx
├── hooks/
│   ├── use-pwa.ts        # PLAN-03
│   └── use-websocket.ts  # PLAN-07
└── workers/
    └── service-worker.ts # PLAN-03
```

### Prefijos de Funciones

| Plan | Prefijo | Ejemplo |
|------|---------|---------|
| PLAN-01 | `alembic_*` | `alembic_upgrade()` |
| PLAN-02 | `test_*` | `test_create_order()` |
| PLAN-03 | `pwa_*` | `pwa_sync_data()` |
| PLAN-04 | `dashboard_*` | `dashboard_fetch_metrics()` |
| PLAN-05 | `pdf_*` | `pdf_generate_order()` |
| PLAN-06 | `s3_*` | `s3_upload_image()` |
| PLAN-07 | `ws_*` | `ws_broadcast_update()` |

---

## 🧪 Testing de Integración

Después de implementar cada plan:

```bash
# 1. Verificar que el backend inicia
cd backend
uvicorn main:app --reload

# 2. Verificar que el frontend compila
cd ..
npm run build

# 3. Ejecutar tests (después de Plan 02)
cd backend
pytest tests/ -v

# 4. Validar integración
# - Abrir http://localhost:5173
# - Verificar consola sin errores
# - Probar funcionalidad específica del plan
```

---

## 📊 Estado de Progreso

Actualizar esta tabla al completar cada plan:

| Plan | Fecha Inicio | Fecha Fin | Desarrollador | Commit | Estado |
|------|--------------|-----------|---------------|--------|--------|
| PLAN-01 | - | - | - | - | ⏳ Pendiente |
| PLAN-02 | - | - | - | - | ⏳ Pendiente |
| PLAN-03 | - | - | - | - | ⏳ Pendiente |
| PLAN-04 | - | - | - | - | ⏳ Pendiente |
| PLAN-05 | - | - | - | - | ⏳ Pendiente |
| PLAN-06 | - | - | - | - | ⏳ Pendiente |
| PLAN-07 | - | - | - | - | ⏳ Pendiente |

**Estados:**
- ⏳ Pendiente
- 🚧 En Progreso
- ✅ Completado
- ❌ Bloqueado
- ⚠️ Necesita Revisión

---

## 🤝 Contribuir

Al implementar un plan:

1. Leer el plan completo antes de empezar
2. Seguir exactamente las rutas y nombres especificados
3. Ejecutar los tests de validación
4. Actualizar la tabla de progreso
5. Crear un commit con el mensaje: `feat: implement PLAN-XX - [título]`
6. Abrir PR con referencia al plan: `Implements PLAN-XX`

---

## 📄 Licencia

Estos planes son parte del proyecto SalvaCell y siguen la misma licencia del proyecto principal.

---

**Última actualización:** 2026-01-17 02:40:00  
**Versión:** 1.0.0  
**Mantenedor:** @cognitaia2025-hub