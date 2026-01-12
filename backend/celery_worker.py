from celery import Celery
from config import settings

celery_app = Celery(
    "salvacell",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Mexico_City',
    enable_utc=True,
)


# Example tasks
@celery_app.task(name="send_whatsapp_notification")
def send_whatsapp_notification(phone: str, message: str):
    """Send WhatsApp notification (implement with Twilio)"""
    print(f"📱 Sending WhatsApp to {phone}: {message}")
    # TODO: Implement Twilio integration
    return {"status": "sent", "phone": phone}


@celery_app.task(name="send_email_notification")
def send_email_notification(email: str, subject: str, body: str):
    """Send email notification"""
    print(f"📧 Sending email to {email}: {subject}")
    # TODO: Implement SMTP email sending
    return {"status": "sent", "email": email}


@celery_app.task(name="generate_order_pdf")
def generate_order_pdf(order_id: str):
    """Generate PDF for order"""
    print(f"📄 Generating PDF for order {order_id}")
    # TODO: Implement PDF generation with ReportLab
    return {"status": "generated", "order_id": order_id}


@celery_app.task(name="check_low_stock_items")
def check_low_stock_items():
    """Check for low stock items and send notifications"""
    print("📦 Checking inventory for low stock items...")
    # TODO: Query database and send alerts
    return {"status": "checked"}


@celery_app.task(name="backup_database")
def backup_database():
    """Create database backup"""
    print("💾 Creating database backup...")
    # TODO: Implement pg_dump backup
    return {"status": "backed_up"}


# Celery Beat schedule
celery_app.conf.beat_schedule = {
    'check-low-stock-daily': {
        'task': 'check_low_stock_items',
        'schedule': 86400.0,  # Every 24 hours
    },
    'backup-database-daily': {
        'task': 'backup_database',
        'schedule': 86400.0,  # Every 24 hours at midnight
    },
}
