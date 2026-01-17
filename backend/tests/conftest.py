import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool
import asyncio

from main import app
from database import Base, get_db
from config import settings
# Import all models to ensure they're registered with Base.metadata
from models import (
    Client, Device, Order, OrderHistory, OrderPhoto,
    Payment, InventoryItem, InventoryMovement, Appointment, User
)


# Create test database engine
# Use in-memory SQLite for testing with StaticPool to maintain single connection
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,  # Use StaticPool to maintain a single connection for :memory:
)

TestAsyncSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(scope="function", autouse=True)
def setup_test_db():
    """Initialize and cleanup test database for each test"""
    # Initialize database tables before each test
    async def init_db():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    asyncio.run(init_db())
    
    yield
    
    # Cleanup after each test
    async def cleanup_db():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    
    asyncio.run(cleanup_db())


@pytest.fixture(scope="function")
def client(setup_test_db):
    """Create FastAPI test client"""
    async def override_get_db():
        async with TestAsyncSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()
