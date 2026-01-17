from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from config import settings
from database import engine, Base
from middleware import PerformanceMiddleware
from routers import (
    clients,
    orders,
    inventory,
    auth,
    citas,
    reports,
    payments,
    photos,
    export,
    metrics,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events"""
    # Startup
    print("🚀 Starting SalvaCell API...")

    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Create tables (in production, use Alembic migrations)
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.create_all)

    yield

    # Shutdown
    print("👋 Shutting down SalvaCell API...")
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API para sistema de gestión de taller de reparación de celulares",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Performance tracking middleware
performance_middleware = PerformanceMiddleware(app)
app.add_middleware(PerformanceMiddleware)

# Mount static files for uploads
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(orders.router)
app.include_router(inventory.router)
app.include_router(citas.router)
app.include_router(reports.router)
app.include_router(payments.router)
app.include_router(photos.router)
app.include_router(export.router)
app.include_router(metrics.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SalvaCell API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
