from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


# Singleton engine for Alembic migrations
_migration_engine = None


def get_db_for_migrations():
    """Conexión síncrona para Alembic (singleton)"""
    global _migration_engine
    if _migration_engine is None:
        from sqlalchemy import create_engine
        sync_url = settings.DATABASE_URL.replace("+asyncpg", "")
        _migration_engine = create_engine(sync_url)
    return _migration_engine


# Dependency for FastAPI
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
