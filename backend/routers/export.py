from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from database import get_db
from models import Order, Client, Device
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
import io
import qrcode
from datetime import datetime

router = APIRouter(prefix="/export", tags=["export"])


def format_currency(amount: float) -> str:
    """Format amount as currency"""
    if amount is None:
        return "$0.00"
    return f"${amount:,.2f}"


def format_date(dt: datetime) -> str:
    """Format datetime for display"""
    if dt is None:
        return "N/A"
    return dt.strftime("%d/%m/%Y %H:%M")


def generate_qr_image(qr_code: str) -> io.BytesIO:
    """Generate QR code image"""
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(qr_code)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer


@router.get("/orders/{order_id}/pdf")
async def export_order_pdf(order_id: str, db: AsyncSession = Depends(get_db)):
    """Generar PDF con detalles de la orden"""
    # Get order with related data
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.client),
            selectinload(Order.device),
            selectinload(Order.technician),
        )
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    # Create PDF in memory
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Title
    p.setFont("Helvetica-Bold", 24)
    p.drawString(1 * inch, height - 1 * inch, "SalvaCell")

    p.setFont("Helvetica", 12)
    p.drawString(1 * inch, height - 1.3 * inch, "Taller de Reparación de Celulares")

    # Order info
    y_position = height - 2 * inch

    p.setFont("Helvetica-Bold", 16)
    p.drawString(1 * inch, y_position, f"Orden #{order.folio}")
    y_position -= 0.4 * inch

    # QR Code
    try:
        qr_buffer = generate_qr_image(order.qr_code)
        p.drawImage(
            qr_buffer,
            width - 2.5 * inch,
            height - 2.5 * inch,
            width=1.5 * inch,
            height=1.5 * inch,
        )
    except Exception as e:
        print(f"Error generating QR: {e}")

    # Client information
    p.setFont("Helvetica-Bold", 12)
    p.drawString(1 * inch, y_position, "Información del Cliente")
    y_position -= 0.25 * inch

    p.setFont("Helvetica", 10)
    if order.client:
        p.drawString(1.2 * inch, y_position, f"Nombre: {order.client.name}")
        y_position -= 0.2 * inch
        p.drawString(1.2 * inch, y_position, f"Teléfono: {order.client.phone}")
        y_position -= 0.2 * inch
        if order.client.email:
            p.drawString(1.2 * inch, y_position, f"Email: {order.client.email}")
            y_position -= 0.2 * inch

    y_position -= 0.2 * inch

    # Device information
    p.setFont("Helvetica-Bold", 12)
    p.drawString(1 * inch, y_position, "Información del Dispositivo")
    y_position -= 0.25 * inch

    p.setFont("Helvetica", 10)
    if order.device:
        p.drawString(
            1.2 * inch,
            y_position,
            f"Marca/Modelo: {order.device.brand} {order.device.model}",
        )
        y_position -= 0.2 * inch
        if order.device.imei:
            p.drawString(1.2 * inch, y_position, f"IMEI: {order.device.imei}")
            y_position -= 0.2 * inch
        if order.device.password:
            p.drawString(1.2 * inch, y_position, f"Contraseña: {order.device.password}")
            y_position -= 0.2 * inch
        if order.device.accessories:
            p.drawString(
                1.2 * inch, y_position, f"Accesorios: {order.device.accessories}"
            )
            y_position -= 0.2 * inch

    y_position -= 0.2 * inch

    # Order details
    p.setFont("Helvetica-Bold", 12)
    p.drawString(1 * inch, y_position, "Detalles de la Orden")
    y_position -= 0.25 * inch

    p.setFont("Helvetica", 10)
    p.drawString(
        1.2 * inch,
        y_position,
        f"Estado: {order.status.value.replace('_', ' ').title()}",
    )
    y_position -= 0.2 * inch
    p.drawString(1.2 * inch, y_position, f"Prioridad: {order.priority.value.title()}")
    y_position -= 0.2 * inch
    p.drawString(
        1.2 * inch, y_position, f"Fecha de Creación: {format_date(order.created_at)}"
    )
    y_position -= 0.2 * inch

    if order.estimated_delivery_date:
        p.drawString(
            1.2 * inch,
            y_position,
            f"Fecha Estimada de Entrega: {format_date(order.estimated_delivery_date)}",
        )
        y_position -= 0.2 * inch

    y_position -= 0.2 * inch

    # Problem description
    p.setFont("Helvetica-Bold", 12)
    p.drawString(1 * inch, y_position, "Problema Reportado")
    y_position -= 0.25 * inch

    p.setFont("Helvetica", 10)
    # Wrap text if too long
    problem_text = order.problem_description or "N/A"
    max_width = width - 2.5 * inch
    text_object = p.beginText(1.2 * inch, y_position)
    text_object.setFont("Helvetica", 10)

    words = problem_text.split()
    line = ""
    for word in words:
        test_line = line + word + " "
        if p.stringWidth(test_line, "Helvetica", 10) < max_width:
            line = test_line
        else:
            text_object.textLine(line)
            line = word + " "
    text_object.textLine(line)
    p.drawText(text_object)
    y_position -= 0.4 * inch

    # Diagnosis (if available)
    if order.diagnosis:
        p.setFont("Helvetica-Bold", 12)
        p.drawString(1 * inch, y_position, "Diagnóstico")
        y_position -= 0.25 * inch

        p.setFont("Helvetica", 10)
        text_object = p.beginText(1.2 * inch, y_position)
        text_object.setFont("Helvetica", 10)

        words = order.diagnosis.split()
        line = ""
        for word in words:
            test_line = line + word + " "
            if p.stringWidth(test_line, "Helvetica", 10) < max_width:
                line = test_line
            else:
                text_object.textLine(line)
                line = word + " "
        text_object.textLine(line)
        p.drawText(text_object)
        y_position -= 0.4 * inch

    # Costs
    p.setFont("Helvetica-Bold", 12)
    p.drawString(1 * inch, y_position, "Costos")
    y_position -= 0.25 * inch

    p.setFont("Helvetica", 10)
    if order.estimated_cost:
        p.drawString(
            1.2 * inch,
            y_position,
            f"Costo Estimado: {format_currency(float(order.estimated_cost))}",
        )
        y_position -= 0.2 * inch

    if order.final_cost:
        p.drawString(
            1.2 * inch,
            y_position,
            f"Costo Final: {format_currency(float(order.final_cost))}",
        )
        y_position -= 0.2 * inch

    # Footer
    p.setFont("Helvetica-Oblique", 8)
    p.drawString(
        1 * inch,
        0.75 * inch,
        f"Generado el {datetime.now().strftime('%d/%m/%Y %H:%M')}",
    )
    p.drawString(1 * inch, 0.5 * inch, "Gracias por confiar en SalvaCell")

    # Save PDF
    p.showPage()
    p.save()

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=orden_{order.folio}.pdf"
        },
    )
