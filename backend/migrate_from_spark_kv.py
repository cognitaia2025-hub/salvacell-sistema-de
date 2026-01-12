"""
Script para migrar datos desde Spark KV (frontend) a PostgreSQL (backend)

Uso:
    python migrate_from_spark_kv.py <spark_kv_export.json>

El archivo JSON debe tener la estructura exportada de Spark KV:
{
    "clients": [...],
    "devices": [...],
    "orders": [...],
    "orderHistory": [...],
    "orderPhotos": [...],
    "payments": [...],
    "inventoryItems": [...],
    "inventoryMovements": [...]
}
"""

import asyncio
import json
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from models import (
    Client, Device, Order, OrderHistory, OrderPhoto,
    Payment, InventoryItem, InventoryMovement, Base
)
from config import settings


async def migrate_data(json_file: str):
    """Migrate data from Spark KV JSON export to PostgreSQL"""
    
    # Load JSON data
    print(f"📂 Loading data from {json_file}...")
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Create engine and session
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    # Create tables
    print("🗃️  Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with async_session() as session:
        try:
            # Migrate clients
            print(f"\n👥 Migrating {len(data.get('clients', []))} clients...")
            for client_data in data.get('clients', []):
                client = Client(**client_data)
                session.add(client)
            await session.flush()
            
            # Migrate devices
            print(f"\n📱 Migrating {len(data.get('devices', []))} devices...")
            for device_data in data.get('devices', []):
                device = Device(**device_data)
                session.add(device)
            await session.flush()
            
            # Migrate orders
            print(f"\n📋 Migrating {len(data.get('orders', []))} orders...")
            for order_data in data.get('orders', []):
                order = Order(**order_data)
                session.add(order)
            await session.flush()
            
            # Migrate order history
            print(f"\n📜 Migrating {len(data.get('orderHistory', []))} history entries...")
            for history_data in data.get('orderHistory', []):
                history = OrderHistory(**history_data)
                session.add(history)
            await session.flush()
            
            # Migrate order photos
            print(f"\n📸 Migrating {len(data.get('orderPhotos', []))} photos...")
            for photo_data in data.get('orderPhotos', []):
                photo = OrderPhoto(**photo_data)
                session.add(photo)
            await session.flush()
            
            # Migrate payments
            print(f"\n💰 Migrating {len(data.get('payments', []))} payments...")
            for payment_data in data.get('payments', []):
                payment = Payment(**payment_data)
                session.add(payment)
            await session.flush()
            
            # Migrate inventory items
            print(f"\n📦 Migrating {len(data.get('inventoryItems', []))} inventory items...")
            for item_data in data.get('inventoryItems', []):
                item = InventoryItem(**item_data)
                session.add(item)
            await session.flush()
            
            # Migrate inventory movements
            print(f"\n🔄 Migrating {len(data.get('inventoryMovements', []))} inventory movements...")
            for movement_data in data.get('inventoryMovements', []):
                movement = InventoryMovement(**movement_data)
                session.add(movement)
            await session.flush()
            
            # Commit all changes
            await session.commit()
            print("\n✅ Migration completed successfully!")
            
        except Exception as e:
            await session.rollback()
            print(f"\n❌ Migration failed: {e}")
            raise
        finally:
            await engine.dispose()


def export_spark_kv_instructions():
    """Print instructions for exporting Spark KV data"""
    print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                 INSTRUCCIONES PARA EXPORTAR DATOS DE SPARK KV               ║
╚════════════════════════════════════════════════════════════════════════════╝

Para exportar los datos desde el frontend actual:

1. Abre la aplicación en tu navegador
2. Abre las DevTools (F12)
3. Ve a la consola y ejecuta:

   // Obtener todos los datos
   const data = await window.spark.kv.get('relational_db');
   
   // Descargar como JSON
   const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = 'spark_kv_export.json';
   a.click();

4. Guarda el archivo y ejecútalo con este script:
   python migrate_from_spark_kv.py spark_kv_export.json

════════════════════════════════════════════════════════════════════════════════
    """)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ Error: No JSON file provided")
        export_spark_kv_instructions()
        sys.exit(1)
    
    json_file = sys.argv[1]
    
    try:
        asyncio.run(migrate_data(json_file))
    except FileNotFoundError:
        print(f"❌ Error: File '{json_file}' not found")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"❌ Error: Invalid JSON file")
        sys.exit(1)
