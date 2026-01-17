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
