# 📋 PLAN 01: Implementación de Alembic para Migraciones de Base de Datos

**Plan ID:** PLAN-01  
**Categoría:** Backend - Infraestructura  
**Prioridad:** 🔴 Alta  
**Tiempo estimado:** 3-4 horas  
**Dependencias:** Ninguna

---

## 🎯 Objetivo

Implementar Alembic para gestionar migraciones de la base de datos PostgreSQL de manera versionada y controlada, reemplazando la creación automática de tablas actual.

---

## 📦 Archivos a Crear (NUEVOS)

```
backend/
├── alembic/
│   ├── env.py                    # Configuración de entorno Alembic
│   ├── script.py.mako           # Template para nuevas migraciones
│   └── versions/
│       └── 001_initial_schema.py # Migración inicial con 8 tablas
├── alembic.ini                   # Configuración principal de Alembic
└── scripts/
    └── init_alembic.py          # Script para inicializar Alembic
```

**Total archivos nuevos:** 4

---

## 🔧 Archivos a Modificar (EXISTENTES)

### 1. `backend/database.py`
**Zona de modificación:** Líneas 15-25 (después de la definición de Base)

**Cambios:**
```python
# AGREGAR después de la línea ~20:
# Comentar o eliminar la creación automática de tablas
# async def init_db():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)

# NUEVA función para Alembic:
async def get_db_for_migrations():
    """Conexión síncrona para Alembic"""
    from sqlalchemy import create_engine
    sync_url = settings.DATABASE_URL.replace("+asyncpg", "")
    return create_engine(sync_url)
```

### 2. `backend/main.py`
**Zona de modificación:** Líneas 30-40 (evento startup)

**Cambios:**
```python
# MODIFICAR el evento startup existente:
@app.on_event("startup")
async def startup_event():
    # COMENTAR la línea de creación automática:
    # await init_db()
    
    # AGREGAR verificación de migraciones:
    from alembic.config import Config
    from alembic import command
    alembic_cfg = Config("alembic.ini")
    # Solo verificar, no auto-migrar en producción
    print("✅ Sistema iniciado. Ejecuta 'alembic upgrade head' si hay migraciones pendientes")
```

### 3. `backend/requirements.txt`
**Zona de modificación:** Al final del archivo

**Cambios:**
```txt
# AGREGAR al final:
alembic==1.13.1
```

---

## 📝 Contenido Detallado de Archivos Nuevos

### 1. `backend/alembic.ini`
```ini
[alembic]
script_location = alembic
prepend_sys_path = .
version_path_separator = os
sqlalchemy.url = 

[post_write_hooks]

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

### 2. `backend/alembic/env.py`
```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys

# Agregar el directorio padre al path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

from config import settings
from models import Base  # Importa todos los modelos

config = context.config

# Sobrescribir la URL desde settings
config.set_main_option('sqlalchemy.url', settings.DATABASE_URL.replace("+asyncpg", ""))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### 3. `backend/alembic/script.py.mako`
```python
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
```

### 4. `backend/alembic/versions/001_initial_schema.py`
```python
"""Initial schema with 8 tables

Revision ID: 001
Revises: 
Create Date: 2026-01-17 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users table
    op.create_table('users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email')
    )
    op.create_index('ix_users_username', 'users', ['username'])
    op.create_index('ix_users_email', 'users', ['email'])

    # Clients table
    op.create_table('clients',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=False),
        sa.Column('alternate_phone', sa.String(), nullable=True),
        sa.Column('alternate_contact', sa.String(), nullable=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_clients_phone', 'clients', ['phone'])
    op.create_index('ix_clients_name', 'clients', ['name'])

    # Devices table
    op.create_table('devices',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('client_id', sa.String(), nullable=False),
        sa.Column('brand', sa.String(), nullable=False),
        sa.Column('model', sa.String(), nullable=False),
        sa.Column('imei', sa.String(), nullable=False),
        sa.Column('password', sa.String(), nullable=True),
        sa.Column('accessories', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_devices_imei', 'devices', ['imei'])

    # Orders table
    op.create_table('orders',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('folio', sa.String(), nullable=False),
        sa.Column('client_id', sa.String(), nullable=False),
        sa.Column('device_id', sa.String(), nullable=False),
        sa.Column('problem', sa.Text(), nullable=False),
        sa.Column('diagnosis', sa.Text(), nullable=True),
        sa.Column('services', sa.Text(), nullable=False),
        sa.Column('estimated_cost', sa.Float(), nullable=False),
        sa.Column('estimated_delivery', sa.DateTime(), nullable=False),
        sa.Column('priority', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('payment_status', sa.String(), nullable=False),
        sa.Column('qr_code', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['device_id'], ['devices.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('folio'),
        sa.UniqueConstraint('qr_code')
    )
    op.create_index('ix_orders_folio', 'orders', ['folio'])
    op.create_index('ix_orders_qr_code', 'orders', ['qr_code'])
    op.create_index('ix_orders_status', 'orders', ['status'])

    # Order History table
    op.create_table('order_history',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('order_id', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Order Photos table
    op.create_table('order_photos',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('order_id', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(), nullable=False),
        sa.Column('uploaded_by', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['uploaded_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Payments table
    op.create_table('payments',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('order_id', sa.String(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('method', sa.String(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Inventory Items table
    op.create_table('inventory_items',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('sku', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('buy_price', sa.Float(), nullable=False),
        sa.Column('sell_price', sa.Float(), nullable=False),
        sa.Column('current_stock', sa.Integer(), nullable=False),
        sa.Column('min_stock', sa.Integer(), nullable=False),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('sku')
    )
    op.create_index('ix_inventory_items_sku', 'inventory_items', ['sku'])

    # Inventory Movements table
    op.create_table('inventory_movements',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('item_id', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('reason', sa.String(), nullable=False),
        sa.Column('order_id', sa.String(), nullable=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['item_id'], ['inventory_items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('inventory_movements')
    op.drop_table('inventory_items')
    op.drop_table('payments')
    op.drop_table('order_photos')
    op.drop_table('order_history')
    op.drop_table('orders')
    op.drop_table('devices')
    op.drop_table('clients')
    op.drop_table('users')
```

### 5. `backend/scripts/init_alembic.py`
```python
#!/usr/bin/env python3
"""
Script para inicializar Alembic en el proyecto
Uso: python scripts/init_alembic.py
"""
import os
import sys

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from alembic.config import Config
from alembic import command


def init_alembic():
    """Inicializa Alembic y crea la primera migración"""
    print("🚀 Inicializando Alembic...")
    
    # Configuración de Alembic
    alembic_cfg = Config("alembic.ini")
    
    print("✅ Alembic configurado correctamente")
    print("\n📝 Para aplicar migraciones:")
    print("   alembic upgrade head")
    print("\n📝 Para crear nueva migración:")
    print("   alembic revision --autogenerate -m 'descripción'")
    print("\n📝 Para revertir última migración:")
    print("   alembic downgrade -1")


if __name__ == "__main__":
    init_alembic()
```

---

## ✅ Pasos de Implementación

### 1. Instalar Alembic
```bash
cd backend
pip install alembic==1.13.1
```

### 2. Crear estructura de carpetas
```bash
mkdir -p alembic/versions
mkdir -p scripts
```

### 3. Crear archivos de configuración
- Copiar contenido de `alembic.ini`
- Copiar contenido de `alembic/env.py`
- Copiar contenido de `alembic/script.py.mako`

### 4. Crear migración inicial
- Copiar contenido de `alembic/versions/001_initial_schema.py`

### 5. Modificar archivos existentes
- Modificar `database.py` según especificación
- Modificar `main.py` según especificación
- Actualizar `requirements.txt`

### 6. Ejecutar migración
```bash
alembic upgrade head
```

---

## 🧪 Validación

### Tests a ejecutar:
```bash
# 1. Verificar que Alembic está instalado
alembic --version

# 2. Verificar que detecta las migraciones
alembic current
alembic history

# 3. Aplicar migraciones
alembic upgrade head

# 4. Verificar tablas en PostgreSQL
psql -U salvacell -d salvacell_db -c "\dt"

# 5. Probar rollback
alembic downgrade -1
alembic upgrade head
```

**Criterios de éxito:**
- ✅ 8 tablas creadas en PostgreSQL
- ✅ Tabla `alembic_version` existe
- ✅ Backend inicia sin errores
- ✅ Se pueden crear nuevas migraciones con `alembic revision --autogenerate`

---

## 🔍 Interfaces Exportadas

### Funciones públicas:
```python
# En database.py
async def get_db_for_migrations() -> Engine
```

### Comandos CLI:
```bash
alembic upgrade head          # Aplicar migraciones
alembic downgrade -1          # Revertir última migración
alembic revision --autogenerate -m "mensaje"  # Nueva migración
alembic current              # Ver versión actual
alembic history              # Ver historial
```

---

## ⚠️ Conflictos con Otros Planes

### Plan 02 (Pytest Testing):
- ✅ **Sin conflictos**: Plan 02 usa fixtures que llaman a estas migraciones
- Plan 02 debe ejecutarse DESPUÉS de Plan 01

### Plan 05, 06, 07:
- ✅ **Sin conflictos**: Solo agregan endpoints, no tocan migraciones

---

## 📚 Referencias

- [Documentación Alembic](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Migrations](https://docs.sqlalchemy.org/en/20/core/schema.html)
- [FastAPI + Alembic Tutorial](https://fastapi.tiangolo.com/tutorial/sql-databases/)

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa con los datos existentes?**  
R: Si ya hay datos, ejecutar `alembic stamp head` para marcar la BD como migrada.

**P: ¿Cómo agrego una nueva columna?**  
R: `alembic revision --autogenerate -m "add column"` y revisar el archivo generado.

**P: ¿Se pueden auto-generar migraciones?**  
R: Sí, pero siempre revisar el código generado antes de aplicar.

---

**Última actualización:** 2026-01-17 02:40:08  
**Autor:** Plan ID PLAN-01