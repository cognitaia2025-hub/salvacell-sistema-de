import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, body: str, html: bool = True) -> bool:
    """
    Send email using SMTP

    Args:
        to: Recipient email address
        subject: Email subject
        body: Email body (HTML or plain text)
        html: Whether body is HTML (default: True)

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Skip if SMTP not configured
    if not settings.SMTP_USER:
        logger.warning("SMTP not configured, skipping email send")
        return False

    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to

        # Attach body
        mime_type = "html" if html else "plain"
        msg.attach(MIMEText(body, mime_type, "utf-8"))

        # Send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, to, msg.as_string())

        logger.info(f"Email sent successfully to {to}")
        return True

    except Exception as e:
        logger.error(f"Error sending email to {to}: {e}")
        return False


def create_order_status_email(
    client_name: str, folio: str, status: str, message: Optional[str] = None
) -> str:
    """
    Create HTML email for order status update

    Args:
        client_name: Client's name
        folio: Order folio
        status: New order status
        message: Optional custom message

    Returns:
        str: HTML email body
    """
    status_messages = {
        "received": "Tu dispositivo ha sido recibido y está en proceso de registro.",
        "diagnosing": "Estamos diagnosticando tu dispositivo.",
        "waiting_parts": "Estamos esperando las piezas necesarias para la reparación.",
        "in_repair": "Tu dispositivo está siendo reparado.",
        "repaired": "¡Tu dispositivo está listo! Ya puedes pasar a recogerlo.",
        "delivered": "Tu dispositivo ha sido entregado. ¡Gracias por tu preferencia!",
        "cancelled": "Tu orden ha sido cancelada.",
    }

    status_text = status_messages.get(status, "Estado actualizado")
    custom_message = f"<p>{message}</p>" if message else ""

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #4CAF50;
                color: white;
                padding: 20px;
                text-align: center;
            }}
            .content {{
                background-color: #f9f9f9;
                padding: 20px;
                border: 1px solid #ddd;
            }}
            .footer {{
                text-align: center;
                padding: 10px;
                font-size: 12px;
                color: #666;
            }}
            .status {{
                background-color: #e7f3ff;
                padding: 10px;
                border-left: 4px solid #2196F3;
                margin: 15px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SalvaCell</h1>
                <p>Actualización de tu Orden</p>
            </div>
            <div class="content">
                <p>Hola <strong>{client_name}</strong>,</p>
                <p>Te informamos sobre el estado de tu orden <strong>#{folio}</strong>:</p>
                <div class="status">
                    <strong>Estado:</strong> {status.replace('_', ' ').title()}<br>
                    <p>{status_text}</p>
                </div>
                {custom_message}
                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            </div>
            <div class="footer">
                <p>SalvaCell - Taller de Reparación de Celulares</p>
                <p>Este es un correo automático, por favor no responder.</p>
            </div>
        </div>
    </body>
    </html>
    """

    return html


def create_appointment_reminder_email(
    client_name: str, appointment_date: str, appointment_title: str
) -> str:
    """
    Create HTML email for appointment reminder

    Args:
        client_name: Client's name
        appointment_date: Appointment date/time
        appointment_title: Appointment title

    Returns:
        str: HTML email body
    """
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #FF9800;
                color: white;
                padding: 20px;
                text-align: center;
            }}
            .content {{
                background-color: #f9f9f9;
                padding: 20px;
                border: 1px solid #ddd;
            }}
            .footer {{
                text-align: center;
                padding: 10px;
                font-size: 12px;
                color: #666;
            }}
            .appointment {{
                background-color: #fff3cd;
                padding: 15px;
                border-left: 4px solid #FF9800;
                margin: 15px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SalvaCell</h1>
                <p>Recordatorio de Cita</p>
            </div>
            <div class="content">
                <p>Hola <strong>{client_name}</strong>,</p>
                <p>Te recordamos tu cita programada:</p>
                <div class="appointment">
                    <strong>{appointment_title}</strong><br>
                    <p>📅 {appointment_date}</p>
                </div>
                <p>Te esperamos. Si no puedes asistir, por favor avísanos con anticipación.</p>
            </div>
            <div class="footer">
                <p>SalvaCell - Taller de Reparación de Celulares</p>
                <p>Este es un correo automático, por favor no responder.</p>
            </div>
        </div>
    </body>
    </html>
    """

    return html
