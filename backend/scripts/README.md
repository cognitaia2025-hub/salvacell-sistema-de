# Scripts de Utilidad - Backend

## init_alembic.py

Script para inicializar y verificar la configuración de Alembic para migraciones de base de datos.

### Uso

```bash
cd backend
python scripts/init_alembic.py
```

### Comandos Alembic más comunes

#### Ver historial de migraciones
```bash
alembic history
```

#### Ver versión actual de la base de datos
```bash
alembic current
```

#### Aplicar todas las migraciones pendientes
```bash
alembic upgrade head
```

#### Revertir la última migración
```bash
alembic downgrade -1
```

#### Crear una nueva migración (auto-generada)
```bash
alembic revision --autogenerate -m "descripción de cambios"
```

#### Crear una nueva migración (vacía)
```bash
alembic revision -m "descripción de cambios"
```

### Notas

- Siempre revisa las migraciones auto-generadas antes de aplicarlas
- Las migraciones deben ser versionadas y comprometidas en git
- Nunca modifiques migraciones que ya hayan sido aplicadas en producción
