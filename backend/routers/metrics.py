from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, distinct
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from database import get_db
from models import Order, User, Client, Payment, InventoryItem
from pydantic import BaseModel
from decimal import Decimal
import time

router = APIRouter(prefix="/metrics", tags=["metrics"])


# ============= Response Schemas =============
class UserEngagementMetrics(BaseModel):
    daily_active_users: int
    monthly_active_users: int
    user_retention_rate: float
    total_registered_users: int
    active_users_today: int
    new_users_this_month: int


class SystemPerformanceMetrics(BaseModel):
    avg_response_time_ms: float
    system_uptime_percent: float
    total_requests: int
    error_rate_percent: float
    active_sessions: int


class OperationalMetrics(BaseModel):
    total_orders_today: int
    orders_in_progress: int
    orders_completed_today: int
    pending_orders: int
    revenue_today: float
    customer_satisfaction_score: float


class DashboardMetrics(BaseModel):
    user_engagement: UserEngagementMetrics
    system_performance: SystemPerformanceMetrics
    operational: OperationalMetrics


# ============= In-Memory Storage for Performance Tracking =============
# In production, this should be stored in Redis or similar
performance_metrics = {
    "request_count": 0,
    "total_response_time": 0.0,
    "error_count": 0,
    "start_time": datetime.utcnow(),
}


# ============= Helper Functions =============
def calculate_uptime() -> float:
    """Calculate system uptime percentage"""
    start_time = performance_metrics.get("start_time", datetime.utcnow())
    uptime_seconds = (datetime.utcnow() - start_time).total_seconds()
    # Assuming 24/7 operation, uptime is always 100% while running
    # In production, this should track actual downtime
    return 99.9  # Placeholder for production implementation


def get_active_sessions() -> int:
    """Get count of active user sessions"""
    # Placeholder - should integrate with actual session management
    return 0


async def get_daily_active_users(db: AsyncSession) -> int:
    """Get count of users who logged in today"""
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(func.count(distinct(User.id)))
        .where(User.last_login >= today)
        .where(User.is_active == 1)
    )
    return result.scalar() or 0


async def get_monthly_active_users(db: AsyncSession) -> int:
    """Get count of users who logged in this month"""
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(func.count(distinct(User.id)))
        .where(User.last_login >= month_start)
        .where(User.is_active == 1)
    )
    return result.scalar() or 0


async def calculate_user_retention_rate(db: AsyncSession) -> float:
    """Calculate user retention rate (users who returned after first month)"""
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    prev_month = month_start - timedelta(days=30)
    
    # Users active in previous month
    prev_month_result = await db.execute(
        select(func.count(distinct(User.id)))
        .where(User.last_login >= prev_month)
        .where(User.last_login < month_start)
        .where(User.is_active == 1)
    )
    prev_month_users = prev_month_result.scalar() or 0
    
    if prev_month_users == 0:
        return 0.0
    
    # Users from previous month who are still active this month
    retained_result = await db.execute(
        select(func.count(distinct(User.id)))
        .where(User.last_login >= month_start)
        .where(User.created_at < month_start)
        .where(User.is_active == 1)
    )
    retained_users = retained_result.scalar() or 0
    
    return round((retained_users / prev_month_users) * 100, 2)


# ============= Endpoints =============
@router.get("/user-engagement", response_model=UserEngagementMetrics)
async def get_user_engagement_metrics(db: AsyncSession = Depends(get_db)):
    """Get user engagement metrics (DAU, MAU, retention rate)"""
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Total registered users
    total_users_result = await db.execute(
        select(func.count(User.id))
        .where(User.is_active == 1)
    )
    total_users = total_users_result.scalar() or 0
    
    # New users this month
    new_users_result = await db.execute(
        select(func.count(User.id))
        .where(User.created_at >= month_start)
    )
    new_users = new_users_result.scalar() or 0
    
    # Get DAU and MAU
    dau = await get_daily_active_users(db)
    mau = await get_monthly_active_users(db)
    
    # Calculate retention rate
    retention_rate = await calculate_user_retention_rate(db)
    
    return UserEngagementMetrics(
        daily_active_users=dau,
        monthly_active_users=mau,
        user_retention_rate=retention_rate,
        total_registered_users=total_users,
        active_users_today=dau,
        new_users_this_month=new_users
    )


@router.get("/system-performance", response_model=SystemPerformanceMetrics)
async def get_system_performance_metrics():
    """Get system performance metrics (response time, uptime, error rates)"""
    total_requests = performance_metrics.get("request_count", 0)
    total_response_time = performance_metrics.get("total_response_time", 0.0)
    error_count = performance_metrics.get("error_count", 0)
    
    # Calculate averages
    avg_response_time = (
        (total_response_time / total_requests) if total_requests > 0 else 0.0
    )
    error_rate = (
        (error_count / total_requests * 100) if total_requests > 0 else 0.0
    )
    
    return SystemPerformanceMetrics(
        avg_response_time_ms=round(avg_response_time, 2),
        system_uptime_percent=calculate_uptime(),
        total_requests=total_requests,
        error_rate_percent=round(error_rate, 2),
        active_sessions=get_active_sessions()
    )


@router.get("/operational", response_model=OperationalMetrics)
async def get_operational_metrics(db: AsyncSession = Depends(get_db)):
    """Get operational metrics for today"""
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Orders today
    orders_today_result = await db.execute(
        select(func.count(Order.id))
        .where(Order.created_at >= today)
    )
    orders_today = orders_today_result.scalar() or 0
    
    # Orders in progress
    in_progress_result = await db.execute(
        select(func.count(Order.id))
        .where(Order.status.in_(['received', 'diagnosing', 'waiting_parts', 'in_repair', 'repaired']))
    )
    in_progress = in_progress_result.scalar() or 0
    
    # Orders completed today
    completed_today_result = await db.execute(
        select(func.count(Order.id))
        .where(Order.actual_delivery_date >= today)
    )
    completed_today = completed_today_result.scalar() or 0
    
    # Pending orders (not delivered or cancelled)
    pending_result = await db.execute(
        select(func.count(Order.id))
        .where(Order.status.notin_(['delivered', 'cancelled']))
    )
    pending = pending_result.scalar() or 0
    
    # Revenue today
    revenue_result = await db.execute(
        select(func.sum(Payment.amount))
        .where(Payment.created_at >= today)
    )
    revenue_today = float(revenue_result.scalar() or 0)
    
    # Customer satisfaction score (placeholder - should be based on actual survey data)
    # For now, calculate based on delivery rate
    if orders_today > 0:
        csat = round((completed_today / orders_today) * 5.0, 2)
        csat = min(csat, 5.0)  # Cap at 5.0
    else:
        csat = 4.5  # Default placeholder
    
    return OperationalMetrics(
        total_orders_today=orders_today,
        orders_in_progress=in_progress,
        orders_completed_today=completed_today,
        pending_orders=pending,
        revenue_today=round(revenue_today, 2),
        customer_satisfaction_score=csat
    )


@router.get("/dashboard", response_model=DashboardMetrics)
async def get_dashboard_metrics(db: AsyncSession = Depends(get_db)):
    """Get all dashboard metrics in one call"""
    user_engagement = await get_user_engagement_metrics(db)
    system_performance = await get_system_performance_metrics()
    operational = await get_operational_metrics(db)
    
    return DashboardMetrics(
        user_engagement=user_engagement,
        system_performance=system_performance,
        operational=operational
    )


@router.post("/track-request")
async def track_request(response_time_ms: float):
    """Track a request for performance metrics (internal use)"""
    performance_metrics["request_count"] += 1
    performance_metrics["total_response_time"] += response_time_ms
    return {"status": "tracked"}


@router.post("/track-error")
async def track_error():
    """Track an error for performance metrics (internal use)"""
    performance_metrics["error_count"] += 1
    return {"status": "tracked"}


@router.post("/reset-metrics")
async def reset_metrics():
    """Reset performance metrics (admin use)"""
    performance_metrics["request_count"] = 0
    performance_metrics["total_response_time"] = 0.0
    performance_metrics["error_count"] = 0
    performance_metrics["start_time"] = datetime.utcnow()
    return {"status": "reset"}
