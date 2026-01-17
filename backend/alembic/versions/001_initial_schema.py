"""Initial schema with database tables

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
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=200), nullable=False),
        sa.Column('password_hash', sa.String(length=200), nullable=False),
        sa.Column('full_name', sa.String(length=200), nullable=True),
        sa.Column('role', sa.Enum('admin', 'technician', 'receptionist', 'warehouse', name='userrole'), nullable=False),
        sa.Column('is_active', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email')
    )
    op.create_index('ix_users_username', 'users', ['username'])
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_role', 'users', ['role'])

    # Clients table
    op.create_table('clients',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=False),
        sa.Column('alternate_phone', sa.String(length=20), nullable=True),
        sa.Column('alternate_contact', sa.String(length=200), nullable=True),
        sa.Column('email', sa.String(length=200), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_clients_phone', 'clients', ['phone'])
    op.create_index('ix_clients_name', 'clients', ['name'])
    op.create_index('ix_clients_email', 'clients', ['email'])

    # Devices table
    op.create_table('devices',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('client_id', sa.String(length=50), nullable=False),
        sa.Column('brand', sa.String(length=100), nullable=False),
        sa.Column('model', sa.String(length=200), nullable=False),
        sa.Column('imei', sa.String(length=50), nullable=True),
        sa.Column('serial', sa.String(length=100), nullable=True),
        sa.Column('password', sa.String(length=100), nullable=True),
        sa.Column('accessories', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_devices_imei', 'devices', ['imei'])
    op.create_index('ix_devices_client_id', 'devices', ['client_id'])

    # Orders table
    op.create_table('orders',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('folio', sa.String(length=20), nullable=False),
        sa.Column('qr_code', sa.String(length=100), nullable=False),
        sa.Column('client_id', sa.String(length=50), nullable=False),
        sa.Column('device_id', sa.String(length=50), nullable=True),
        sa.Column('technician_id', sa.String(length=50), nullable=True),
        sa.Column('status', sa.Enum('received', 'diagnosing', 'waiting_parts', 'in_repair', 'repaired', 'delivered', 'cancelled', name='orderstatus'), nullable=False, server_default='received'),
        sa.Column('priority', sa.Enum('normal', 'urgent', name='orderpriority'), nullable=False, server_default='normal'),
        sa.Column('problem_description', sa.Text(), nullable=False),
        sa.Column('diagnosis', sa.Text(), nullable=True),
        sa.Column('solution', sa.Text(), nullable=True),
        sa.Column('estimated_cost', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('final_cost', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('estimated_delivery_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('actual_delivery_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['device_id'], ['devices.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['technician_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('folio'),
        sa.UniqueConstraint('qr_code')
    )
    op.create_index('ix_orders_folio', 'orders', ['folio'])
    op.create_index('ix_orders_qr_code', 'orders', ['qr_code'])
    op.create_index('ix_orders_status', 'orders', ['status'])
    op.create_index('ix_orders_client_id', 'orders', ['client_id'])
    op.create_index('ix_orders_device_id', 'orders', ['device_id'])
    op.create_index('ix_orders_technician_id', 'orders', ['technician_id'])
    op.create_index('ix_orders_created_at', 'orders', ['created_at'])

    # Order History table
    op.create_table('order_history',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('order_id', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.String(length=50), nullable=True),
        sa.Column('status', sa.Enum('received', 'diagnosing', 'waiting_parts', 'in_repair', 'repaired', 'delivered', 'cancelled', name='orderstatus'), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_order_history_order_id', 'order_history', ['order_id'])
    op.create_index('ix_order_history_user_id', 'order_history', ['user_id'])
    op.create_index('ix_order_history_created_at', 'order_history', ['created_at'])

    # Order Photos table
    op.create_table('order_photos',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('order_id', sa.String(length=50), nullable=False),
        sa.Column('uploaded_by', sa.String(length=50), nullable=True),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('file_url', sa.String(length=500), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('mime_type', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['uploaded_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_order_photos_order_id', 'order_photos', ['order_id'])

    # Payments table
    op.create_table('payments',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('order_id', sa.String(length=50), nullable=False),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('method', sa.Enum('cash', 'card', 'transfer', name='paymentmethod'), nullable=False),
        sa.Column('status', sa.Enum('pending', 'partial', 'paid', name='paymentstatus'), nullable=False, server_default='pending'),
        sa.Column('reference', sa.String(length=200), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_by', sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_payments_order_id', 'payments', ['order_id'])
    op.create_index('ix_payments_created_at', 'payments', ['created_at'])

    # Inventory Items table
    op.create_table('inventory_items',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('sku', sa.String(length=100), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('purchase_price', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('sale_price', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('stock', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('min_stock', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('location', sa.String(length=200), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('sku')
    )
    op.create_index('ix_inventory_items_sku', 'inventory_items', ['sku'])
    op.create_index('ix_inventory_items_name', 'inventory_items', ['name'])
    op.create_index('ix_inventory_items_category', 'inventory_items', ['category'])

    # Inventory Movements table
    op.create_table('inventory_movements',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('item_id', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.String(length=50), nullable=True),
        sa.Column('order_id', sa.String(length=50), nullable=True),
        sa.Column('type', sa.Enum('entry', 'exit', 'adjustment', 'return', name='movementtype'), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('reference', sa.String(length=200), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['item_id'], ['inventory_items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_inventory_movements_item_id', 'inventory_movements', ['item_id'])
    op.create_index('ix_inventory_movements_user_id', 'inventory_movements', ['user_id'])
    op.create_index('ix_inventory_movements_order_id', 'inventory_movements', ['order_id'])
    op.create_index('ix_inventory_movements_type', 'inventory_movements', ['type'])
    op.create_index('ix_inventory_movements_created_at', 'inventory_movements', ['created_at'])

    # Appointments table
    op.create_table('appointments',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('client_id', sa.String(length=50), nullable=False),
        sa.Column('order_id', sa.String(length=50), nullable=True),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('scheduled_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=True, server_default='60'),
        sa.Column('status', sa.Enum('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', name='appointmentstatus'), nullable=False, server_default='scheduled'),
        sa.Column('reminder_sent', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_appointments_client_id', 'appointments', ['client_id'])
    op.create_index('ix_appointments_order_id', 'appointments', ['order_id'])
    op.create_index('ix_appointments_scheduled_date', 'appointments', ['scheduled_date'])
    op.create_index('ix_appointments_status', 'appointments', ['status'])


def downgrade() -> None:
    op.drop_table('appointments')
    op.drop_table('inventory_movements')
    op.drop_table('inventory_items')
    op.drop_table('payments')
    op.drop_table('order_photos')
    op.drop_table('order_history')
    op.drop_table('orders')
    op.drop_table('devices')
    op.drop_table('clients')
    op.drop_table('users')
    
    # Drop enum types
    op.execute('DROP TYPE IF EXISTS appointmentstatus')
    op.execute('DROP TYPE IF EXISTS movementtype')
    op.execute('DROP TYPE IF EXISTS paymentstatus')
    op.execute('DROP TYPE IF EXISTS paymentmethod')
    op.execute('DROP TYPE IF EXISTS orderpriority')
    op.execute('DROP TYPE IF EXISTS orderstatus')
    op.execute('DROP TYPE IF EXISTS userrole')
