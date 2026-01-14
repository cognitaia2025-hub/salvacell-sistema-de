from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, case
from typing import Optional
from datetime import datetime, timedelta
from database import get_db
from models import Order, OrderStatus, Client, Payment, PaymentMethod, InventoryItem, InventoryMovement
from pydantic import BaseModel
from decimal import Decimal

router = APIRouter(prefix="/reports", tags=["reports"])


# ============= Response Schemas =============
class OperationalStats(BaseModel):
    total_orders: int
    delivered: int
    in_progress: int
    cancelled: int
    urgent: int
    avg_repair_days: float


class FinancialStats(BaseModel):
    total_revenue: float
    total_pending: float
    avg_ticket: float
    by_method: dict


class InventoryStats(BaseModel):
    total_value: float
    sell_value: float
    low_stock: int
    out_of_stock: int
    total_items: int
    by_category: list


class ClientStats(BaseModel):
    total_clients: int
    recurring: int
    new_clients: int
    top_clients: list


class OrderTrend(BaseModel):
    date: str
    orders: int


class StatusDistribution(BaseModel):
    name: str
    value: int


class DashboardSummary(BaseModel):
    operational: OperationalStats
    financial: FinancialStats
    inventory: InventoryStats
    clients: ClientStats


# ============= Helper Functions =============
def get_date_filter(period: str) -> Optional[datetime]:
    """Get start date based on period"""
    now = datetime.utcnow()
    if period == "7d":
        return now - timedelta(days=7)
    elif period == "30d":
        return now - timedelta(days=30)
    elif period == "90d":
        return now - timedelta(days=90)
    elif period == "1y":
        return now - timedelta(days=365)
    return None  # 'all' returns None


# ============= Endpoints =============
@router.get("/operational", response_model=OperationalStats)
async def get_operational_stats(
    period: str = Query("30d", regex="^(7d|30d|90d|1y|all)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get operational statistics"""
    start_date = get_date_filter(period)

    # Base query
    query = select(Order)
    if start_date:
        query = query.where(Order.created_at >= start_date)

    result = await db.execute(query)
    orders = result.scalars().all()

    total = len(orders)
    delivered = sum(1 for o in orders if o.status == OrderStatus.DELIVERED)
    cancelled = sum(1 for o in orders if o.status == OrderStatus.CANCELLED)
    in_progress = sum(1 for o in orders if o.status not in [OrderStatus.DELIVERED, OrderStatus.CANCELLED])
    urgent = sum(1 for o in orders if o.priority.value == "urgent")

    # Calculate average repair time
    avg_days = 0.0
    delivered_orders = [o for o in orders if o.status == OrderStatus.DELIVERED and o.actual_delivery_date]
    if delivered_orders:
        total_days = sum(
            (o.actual_delivery_date - o.created_at).total_seconds() / 86400
            for o in delivered_orders
        )
        avg_days = total_days / len(delivered_orders)

    return OperationalStats(
        total_orders=total,
        delivered=delivered,
        in_progress=in_progress,
        cancelled=cancelled,
        urgent=urgent,
        avg_repair_days=round(avg_days, 1)
    )


@router.get("/financial", response_model=FinancialStats)
async def get_financial_stats(
    period: str = Query("30d", regex="^(7d|30d|90d|1y|all)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get financial statistics"""
    start_date = get_date_filter(period)

    # Get orders with payments
    query = select(Order)
    if start_date:
        query = query.where(Order.created_at >= start_date)

    result = await db.execute(query)
    orders = result.scalars().all()

    # Get payments
    payment_query = select(Payment)
    if start_date:
        payment_query = payment_query.where(Payment.created_at >= start_date)

    payment_result = await db.execute(payment_query)
    payments = payment_result.scalars().all()

    # Calculate totals
    total_revenue = float(sum(p.amount for p in payments))

    # Pending = estimated cost - paid for non-delivered/cancelled orders
    total_pending = 0.0
    for order in orders:
        if order.status not in [OrderStatus.DELIVERED, OrderStatus.CANCELLED]:
            estimated = float(order.estimated_cost or 0)
            paid = float(sum(p.amount for p in payments if p.order_id == order.id))
            total_pending += max(0, estimated - paid)

    # By payment method
    by_method = {
        "cash": float(sum(p.amount for p in payments if p.method == PaymentMethod.CASH)),
        "card": float(sum(p.amount for p in payments if p.method == PaymentMethod.CARD)),
        "transfer": float(sum(p.amount for p in payments if p.method == PaymentMethod.TRANSFER))
    }

    # Average ticket
    delivered_count = sum(1 for o in orders if o.status == OrderStatus.DELIVERED)
    avg_ticket = total_revenue / delivered_count if delivered_count > 0 else 0.0

    return FinancialStats(
        total_revenue=round(total_revenue, 2),
        total_pending=round(total_pending, 2),
        avg_ticket=round(avg_ticket, 2),
        by_method=by_method
    )


@router.get("/inventory", response_model=InventoryStats)
async def get_inventory_stats(
    db: AsyncSession = Depends(get_db)
):
    """Get inventory statistics"""
    result = await db.execute(select(InventoryItem))
    items = result.scalars().all()

    total_value = sum(float(i.purchase_price or 0) * i.stock for i in items)
    sell_value = sum(float(i.sale_price or 0) * i.stock for i in items)
    low_stock = sum(1 for i in items if i.stock <= i.min_stock and i.stock > 0)
    out_of_stock = sum(1 for i in items if i.stock == 0)

    # By category
    category_map = {}
    for item in items:
        cat = item.category or "Sin categoría"
        if cat not in category_map:
            category_map[cat] = 0
        category_map[cat] += float(item.purchase_price or 0) * item.stock

    by_category = [
        {"name": k, "value": round(v, 2)}
        for k, v in sorted(category_map.items(), key=lambda x: x[1], reverse=True)[:5]
    ]

    return InventoryStats(
        total_value=round(total_value, 2),
        sell_value=round(sell_value, 2),
        low_stock=low_stock,
        out_of_stock=out_of_stock,
        total_items=len(items),
        by_category=by_category
    )


@router.get("/clients", response_model=ClientStats)
async def get_client_stats(
    period: str = Query("30d", regex="^(7d|30d|90d|1y|all)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get client statistics"""
    start_date = get_date_filter(period)

    # Get orders with clients
    query = select(Order)
    if start_date:
        query = query.where(Order.created_at >= start_date)

    result = await db.execute(query)
    orders = result.scalars().all()

    # Get payments
    payment_query = select(Payment)
    if start_date:
        payment_query = payment_query.where(Payment.created_at >= start_date)
    payment_result = await db.execute(payment_query)
    payments = payment_result.scalars().all()

    # Build client stats
    client_map = {}
    for order in orders:
        cid = order.client_id
        if cid not in client_map:
            client_map[cid] = {"orders": 0, "spent": 0.0}
        client_map[cid]["orders"] += 1
        client_map[cid]["spent"] += float(sum(
            p.amount for p in payments if p.order_id == order.id
        ))

    # Get client names
    client_ids = list(client_map.keys())
    if client_ids:
        clients_result = await db.execute(
            select(Client).where(Client.id.in_(client_ids))
        )
        clients = {c.id: c.name for c in clients_result.scalars().all()}
    else:
        clients = {}

    total_clients = len(client_map)
    recurring = sum(1 for c in client_map.values() if c["orders"] > 1)
    new_clients = sum(1 for c in client_map.values() if c["orders"] == 1)

    # Top clients
    top_clients = [
        {
            "name": clients.get(cid, "Desconocido"),
            "orders": data["orders"],
            "spent": round(data["spent"], 2)
        }
        for cid, data in sorted(client_map.items(), key=lambda x: x[1]["spent"], reverse=True)[:5]
    ]

    return ClientStats(
        total_clients=total_clients,
        recurring=recurring,
        new_clients=new_clients,
        top_clients=top_clients
    )


@router.get("/orders-trend")
async def get_orders_trend(
    period: str = Query("30d", regex="^(7d|30d|90d|1y|all)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get orders trend by date"""
    start_date = get_date_filter(period)

    query = select(Order)
    if start_date:
        query = query.where(Order.created_at >= start_date)

    result = await db.execute(query)
    orders = result.scalars().all()

    # Group by date
    date_map = {}
    for order in orders:
        date_str = order.created_at.strftime("%Y-%m-%d")
        date_map[date_str] = date_map.get(date_str, 0) + 1

    # Sort and return last 14 entries
    trend = [
        {"date": k, "orders": v}
        for k, v in sorted(date_map.items())
    ][-14:]

    return trend


@router.get("/orders-by-status")
async def get_orders_by_status(
    period: str = Query("30d", regex="^(7d|30d|90d|1y|all)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get orders distribution by status"""
    start_date = get_date_filter(period)

    query = select(Order)
    if start_date:
        query = query.where(Order.created_at >= start_date)

    result = await db.execute(query)
    orders = result.scalars().all()

    status_labels = {
        "received": "Recibido",
        "diagnosing": "Diagnóstico",
        "waiting_parts": "Esp. Repuestos",
        "in_repair": "En Reparación",
        "repaired": "Reparado",
        "delivered": "Entregado",
        "cancelled": "Cancelado"
    }

    status_count = {}
    for order in orders:
        label = status_labels.get(order.status.value, order.status.value)
        status_count[label] = status_count.get(label, 0) + 1

    return [{"name": k, "value": v} for k, v in status_count.items()]


@router.get("/dashboard", response_model=DashboardSummary)
async def get_dashboard_summary(
    period: str = Query("30d", regex="^(7d|30d|90d|1y|all)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get complete dashboard summary"""
    operational = await get_operational_stats(period, db)
    financial = await get_financial_stats(period, db)
    inventory = await get_inventory_stats(db)
    clients = await get_client_stats(period, db)

    return DashboardSummary(
        operational=operational,
        financial=financial,
        inventory=inventory,
        clients=clients
    )
