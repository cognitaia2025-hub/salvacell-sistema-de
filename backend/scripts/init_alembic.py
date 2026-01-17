#!/usr/bin/env python3
"""
Script para inicializar Alembic en el proyecto
Uso: python scripts/init_alembic.py
"""
import os
import sys

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from alembic.config import Config
from alembic import command


def init_alembic():
    """Inicializa y verifica la configuración de Alembic"""
    try:
        print("🚀 Inicializando Alembic...")
        
        # Verificar que el archivo de configuración existe
        if not os.path.exists("alembic.ini"):
            print("❌ Error: No se encuentra el archivo alembic.ini")
            return 1
        
        # Configuración de Alembic
        alembic_cfg = Config("alembic.ini")
        
        # Verificar que existe el directorio de migraciones
        script_location = alembic_cfg.get_main_option("script_location")
        if not os.path.exists(script_location):
            print(f"❌ Error: No se encuentra el directorio de migraciones: {script_location}")
            return 1
        
        print("✅ Alembic configurado correctamente")
        print("\n📝 Para aplicar migraciones:")
        print("   alembic upgrade head")
        print("\n📝 Para crear nueva migración:")
        print("   alembic revision --autogenerate -m 'descripción'")
        print("\n📝 Para revertir última migración:")
        print("   alembic downgrade -1")
        
        return 0
        
    except Exception as e:
        print(f"❌ Error al inicializar Alembic: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(init_alembic())
