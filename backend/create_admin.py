"""
Script para crear el usuario administrador inicial
Ejecutar: python create_admin.py
"""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from models import User, UserRole, Base
from auth import get_password_hash
from config import settings
import uuid


async def create_admin():
    """Create initial admin user"""
    print("🔧 Conectando a la base de datos...")
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    # Create tables if they don't exist
    print("📋 Creando tablas si no existen...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print("\n👤 Creando usuario administrador...")
        admin = User(
            id=str(uuid.uuid4()),
            username="admin",
            email="admin@salvacell.com",
            password_hash=get_password_hash("password"),
            full_name="Administrador del Sistema",
            role=UserRole.ADMIN,
            is_active=1
        )
        session.add(admin)
        await session.commit()
        
        print("\n✅ Usuario administrador creado exitosamente!")
        print("\n📝 Credenciales:")
        print("   Usuario: admin")
        print("   Contraseña: password")
        print("\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login")
        print("\n🚀 Ahora puedes iniciar sesión en http://localhost:5173")
    
    await engine.dispose()


if __name__ == "__main__":
    try:
        asyncio.run(create_admin())
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n💡 Asegúrate de que:")
        print("   1. PostgreSQL esté corriendo")
        print("   2. Las credenciales en .env sean correctas")
        print("   3. La base de datos 'salvacell_db' exista")
