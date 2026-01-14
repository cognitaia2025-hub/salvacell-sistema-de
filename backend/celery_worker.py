from celery import Celery
from config import settings

celery_app = Celery(
    "salvacell",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Mexico_City",
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


@celery_app.task(name="send_reminder_notifications")
def send_reminder_notifications():
    """Send appointment reminders for next day"""
    print("🔔 Sending appointment reminders...")
    # TODO: Query appointments for tomorrow and send reminders
    from datetime import datetime, timedelta
    from sqlalchemy import select
    from database import SessionLocal
    from models import Appointment, Client
    from services.email import send_email, create_appointment_reminder_email

    try:
        db = SessionLocal()
        tomorrow = datetime.now() + timedelta(days=1)
        tomorrow_start = tomorrow.replace(hour=0, minute=0, second=0)
        tomorrow_end = tomorrow.replace(hour=23, minute=59, second=59)

        # Query appointments for tomorrow
        result = db.execute(
            select(Appointment).where(
                Appointment.scheduled_date >= tomorrow_start,
                Appointment.scheduled_date <= tomorrow_end,
                Appointment.status == "scheduled",
            )
        )
        appointments = result.scalars().all()

        sent_count = 0
        for appointment in appointments:
            client = db.execute(
                select(Client).where(Client.id == appointment.client_id)
            ).scalar_one_or_none()

            if client and client.email:
                email_body = create_appointment_reminder_email(
                    client.name,
                    appointment.scheduled_date.strftime("%d/%m/%Y %H:%M"),
                    appointment.title,
                )

                if send_email(
                    client.email, "Recordatorio de Cita - SalvaCell", email_body
                ):
                    sent_count += 1

        db.close()
        return {"status": "completed", "sent": sent_count}

    except Exception as e:
        print(f"Error sending reminders: {e}")
        return {"status": "error", "message": str(e)}


@celery_app.task(name="generate_daily_report")
def generate_daily_report():
    """Generate daily operations report"""
    print("📊 Generating daily report...")
    # TODO: Generate report with daily statistics
    from datetime import datetime, timedelta
    from sqlalchemy import select, func
    from database import SessionLocal
    from models import Order, Payment

    try:
        db = SessionLocal()
        today = datetime.now().replace(hour=0, minute=0, second=0)
        tomorrow = today + timedelta(days=1)

        # Count orders created today
        orders_count = db.execute(
            select(func.count(Order.id)).where(
                Order.created_at >= today, Order.created_at < tomorrow
            )
        ).scalar()

        # Sum payments received today
        payments_sum = (
            db.execute(
                select(func.sum(Payment.amount)).where(
                    Payment.created_at >= today, Payment.created_at < tomorrow
                )
            ).scalar()
            or 0
        )

        db.close()

        report = {
            "date": today.strftime("%Y-%m-%d"),
            "orders_created": orders_count,
            "total_payments": float(payments_sum),
        }

        print(f"Daily Report: {report}")
        return {"status": "generated", "report": report}

    except Exception as e:
        print(f"Error generating report: {e}")
        return {"status": "error", "message": str(e)}


# Celery Beat schedule
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    "check-low-stock-daily": {
        "task": "check_low_stock_items",
        "schedule": 86400.0,  # Every 24 hours
    },
    "backup-database-daily": {
        "task": "backup_database",
        "schedule": crontab(hour=2, minute=0),  # 2 AM daily
    },
    "send-appointment-reminders": {
        "task": "send_reminder_notifications",
        "schedule": crontab(hour=9, minute=0),  # 9 AM daily
    },
    "generate-daily-report": {
        "task": "generate_daily_report",
        "schedule": crontab(hour=23, minute=0),  # 11 PM daily
    },
}
