# 📋 PLAN 05: Generación de PDFs con ReportLab

**Plan ID:** PLAN-05  
**Categoría:** Backend - Reportes  
**Prioridad:** 🟡 Media  
**Tiempo estimado:** 3-4 horas  
**Dependencias:** Ninguna

---

## 🎯 Objetivo

Implementar generación de documentos PDF (tickets de orden, facturas, reportes) usando ReportLab en el backend, con endpoints REST para descargar PDFs desde el frontend.

---

## 📦 Archivos a Crear (NUEVOS)

```
backend/
├── utils/
│   └── pdf_generator.py          # Generador principal de PDFs
├── templates/
│   └── pdf/
│       ├── order_ticket.py       # Template ticket de orden
│       ├── invoice.py            # Template factura
│       └── report.py             # Template reportes
├── routers/
│   └── reports.py                # Endpoints de reportes
└── static/
    └── logos/
        └── salvacell_logo.png    # Logo para PDFs
```

**Total archivos nuevos:** 5

---

## 🔧 Archivos a Modificar (EXISTENTES)

### 1. `backend/main.py`
**Zona de modificación:** Líneas 40-50 (sección de routers)

**Cambios:**
```python
# AGREGAR import al inicio:
from routers import reports

# AGREGAR en la sección de routers (línea ~45):
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
```

### 2. `backend/requirements.txt`
**Zona de modificación:** Al final del archivo

**Cambios:**
```txt
# AGREGAR al final:
reportlab==4.0.9
Pillow==10.2.0
```

### 3. `backend/config.py`
**Zona de modificación:** Líneas 55-65 (al final de la clase Settings)

**Cambios:**
```python
# AGREGAR dentro de la clase Settings:

# PDF Settings
PDF_LOGO_PATH: str = "./static/logos/salvacell_logo.png"
PDF_COMPANY_NAME: str = "SalvaCell"
PDF_COMPANY_ADDRESS: str = "Calle Principal #123, Ciudad"
PDF_COMPANY_PHONE: str = "+52 123 456 7890"
PDF_COMPANY_EMAIL: str = "contacto@salvacell.com"
```

---

## 📝 Contenido Detallado de Archivos Nuevos

### 1. `backend/utils/pdf_generator.py`
```python
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, 
    Spacer, Image, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
from io import BytesIO
import os
from config import settings


class PDFGenerator:
    """Clase base para generar PDFs"""
    
    def __init__(self, pagesize=letter):
        self.pagesize = pagesize
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()
        
    def _create_custom_styles(self):
        """Crear estilos personalizados"""
        self.styles.add(ParagraphStyle(
            name='Title',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='Subtitle',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#6b7280'),
            spaceAfter=6,
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='RightAlign',
            parent=self.styles['Normal'],
            alignment=TA_RIGHT
        ))
        
    def create_header(self, buffer):
        """Crear encabezado con logo y datos de la empresa"""
        elements = []
        
        # Logo si existe
        if os.path.exists(settings.PDF_LOGO_PATH):
            logo = Image(settings.PDF_LOGO_PATH, width=2*inch, height=0.8*inch)
            logo.hAlign = 'CENTER'
            elements.append(logo)
            elements.append(Spacer(1, 0.2*inch))
        
        # Nombre de la empresa
        company_name = Paragraph(
            f"<b>{settings.PDF_COMPANY_NAME}</b>",
            self.styles['Title']
        )
        elements.append(company_name)
        
        # Datos de contacto
        contact_info = Paragraph(
            f"{settings.PDF_COMPANY_ADDRESS}<br/>"
            f"Tel: {settings.PDF_COMPANY_PHONE}<br/>"
            f"Email: {settings.PDF_COMPANY_EMAIL}",
            self.styles['Subtitle']
        )
        elements.append(contact_info)
        elements.append(Spacer(1, 0.3*inch))
        
        return elements
    
    def create_footer(self, canvas, doc):
        """Crear pie de página"""
        canvas.saveState()
        footer_text = f"Generado el {datetime.now().strftime('%d/%m/%Y %H:%M')} - Página {doc.page}"
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.grey)
        canvas.drawCentredString(
            self.pagesize[0] / 2,
            0.5 * inch,
            footer_text
        )
        canvas.restoreState()


def pdf_generate_order_ticket(order_data: dict) -> BytesIO:
    """Generar ticket de orden de reparación"""
    
    Args:
        order_data: Diccionario con datos de la orden
        
    Returns:
        BytesIO con el PDF generado
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    generator = PDFGenerator()
    elements = []
    
    # Header
    elements.extend(generator.create_header(buffer))
    
    # Título del documento
    title = Paragraph("<b>TICKET DE ORDEN DE REPARACIÓN</b>", generator.styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 0.2*inch))
    
    # Información de la orden
    order_info = [
        ['Folio:', order_data.get('folio', 'N/A')],
        ['Fecha:', order_data.get('created_at', datetime.now().strftime('%d/%m/%Y'))],
        ['Estado:', order_data.get('status', 'N/A')],
        ['Prioridad:', order_data.get('priority', 'Normal')],
    ]
    
    order_table = Table(order_info, colWidths=[2*inch, 4*inch])
    order_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e5e7eb')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    elements.append(order_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Datos del cliente
    client_title = Paragraph("<b>DATOS DEL CLIENTE</b>", generator.styles['Heading2'])
    elements.append(client_title)
    elements.append(Spacer(1, 0.1*inch))
    
    client_data = order_data.get('client', {})
    client_info = [
        ['Nombre:', client_data.get('name', 'N/A')],
        ['Teléfono:', client_data.get('phone', 'N/A')],
        ['Email:', client_data.get('email', 'N/A')],
    ]
    
    client_table = Table(client_info, colWidths=[2*inch, 4*inch])
    client_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e5e7eb')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    elements.append(client_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Datos del dispositivo
    device_title = Paragraph("<b>DATOS DEL DISPOSITIVO</b>", generator.styles['Heading2'])
    elements.append(device_title)
    elements.append(Spacer(1, 0.1*inch))
    
    device_data = order_data.get('device', {})
    device_info = [
        ['Marca:', device_data.get('brand', 'N/A')],
        ['Modelo:', device_data.get('model', 'N/A')],
        ['IMEI:', device_data.get('imei', 'N/A')],
        ['Accesorios:', device_data.get('accessories', 'N/A')],
    ]
    
    device_table = Table(device_info, colWidths=[2*inch, 4*inch])
    device_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e5e7eb')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    elements.append(device_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Descripción del problema y servicios
    problem_title = Paragraph("<b>PROBLEMA REPORTADO</b>", generator.styles['Heading2'])
    elements.append(problem_title)
    elements.append(Spacer(1, 0.1*inch))
    
    problem = Paragraph(order_data.get('problem', 'N/A'), generator.styles['Normal'])
    elements.append(problem)
    elements.append(Spacer(1, 0.2*inch))
    
    services_title = Paragraph("<b>SERVICIOS A REALIZAR</b>", generator.styles['Heading2'])
    elements.append(services_title)
    elements.append(Spacer(1, 0.1*inch))
    
    services = Paragraph(order_data.get('services', 'N/A'), generator.styles['Normal'])
    elements.append(services)
    elements.append(Spacer(1, 0.3*inch))
    
    # Costos
    cost_data = [
        ['Costo Estimado:', f"${order_data.get('estimated_cost', 0):.2f}"],
        ['Fecha Estimada de Entrega:', order_data.get('estimated_delivery', 'N/A')],
    ]
    
    cost_table = Table(cost_data, colWidths=[3*inch, 3*inch])
    cost_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#dbeafe')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1e40af')), 
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#1e40af')),  
    ]))
    elements.append(cost_table)
    elements.append(Spacer(1, 0.5*inch))
    
    # Notas
    notes = Paragraph(
        "<i>* Este documento no es una factura fiscal<br/>"
        "* El presupuesto puede variar según el diagnóstico técnico<br/>"
        "* Conserve este ticket para recoger su equipo</i>",
        generator.styles['Normal']
    )
    elements.append(notes)
    
    # Generar PDF
    doc.build(elements, onFirstPage=generator.create_footer, onLaterPages=generator.create_footer)
    buffer.seek(0)
    
    return buffer


def pdf_generate_invoice(order_data: dict, payments: list) -> BytesIO:
    """Generar factura/comprobante de pago"""
    
    Args:
        order_data: Diccionario con datos de la orden
        payments: Lista de pagos realizados
        
    Returns:
        BytesIO con el PDF generado
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    generator = PDFGenerator()
    elements = []
    
    # Header
    elements.extend(generator.create_header(buffer))
    
    # Título
    title = Paragraph("<b>COMPROBANTE DE PAGO</b>", generator.styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 0.2*inch))
    
    # Info básica
    invoice_info = [
        ['Folio:', order_data.get('folio', 'N/A')],
        ['Fecha:', datetime.now().strftime('%d/%m/%Y %H:%M')],
        ['Cliente:', order_data.get('client', {}).get('name', 'N/A')],
    ]
    
    info_table = Table(invoice_info, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e5e7eb')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Tabla de pagos
    payments_title = Paragraph("<b>DETALLE DE PAGOS</b>", generator.styles['Heading2'])
    elements.append(payments_title)
    elements.append(Spacer(1, 0.1*inch))
    
    payment_data = [['Fecha', 'Método', 'Monto']]
    total = 0
    
    for payment in payments:
        payment_data.append([
            payment.get('timestamp', ''),
            payment.get('method', ''),
            f"${payment.get('amount', 0):.2f}"
        ])
        total += payment.get('amount', 0)
    
    payment_data.append(['', 'TOTAL:', f"${total:.2f}"])
    
    payment_table = Table(payment_data, colWidths=[2*inch, 2*inch, 2*inch])
    payment_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#dbeafe')),
        ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
        ('FONTSIZE', (0, -1), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(payment_table)
    elements.append(Spacer(1, 0.5*inch))
    
    # Firma
    signature = Paragraph(
        "<br/><br/>_____________________________<br/>"
        "Firma del Cliente",
        generator.styles['RightAlign']
    )
    elements.append(signature)
    
    # Generar PDF
    doc.build(elements, onFirstPage=generator.create_footer, onLaterPages=generator.create_footer)
    buffer.seek(0)
    
    return buffer


def pdf_generate_report(report_data: dict, report_type: str) -> BytesIO:
    """Generar reporte general (órdenes, ventas, inventario)"""
    
    Args:
        report_data: Datos del reporte
        report_type: Tipo de reporte ('orders', 'sales', 'inventory')
        
    Returns:
        BytesIO con el PDF generado
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    generator = PDFGenerator(pagesize=A4)
    elements = []
    
    # Header
    elements.extend(generator.create_header(buffer))
    
    # Título según tipo
    titles = {
        'orders': 'REPORTE DE ÓRDENES',
        'sales': 'REPORTE DE VENTAS',
        'inventory': 'REPORTE DE INVENTARIO'
    }
    
    title = Paragraph(f"<b>{titles.get(report_type, 'REPORTE')}</b>", generator.styles['Title'])
    elements.append(title)
    
    period = Paragraph(
        f"Período: {report_data.get('start_date', '')} - {report_data.get('end_date', '')}",
        generator.styles['Subtitle']
    )
    elements.append(period)
    elements.append(Spacer(1, 0.3*inch))
    
    # Tabla de datos
    table_data = report_data.get('data', [])
    if table_data:
        report_table = Table(table_data)
        report_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(report_table)
    
    # Generar PDF
    doc.build(elements, onFirstPage=generator.create_footer, onLaterPages=generator.create_footer)
    buffer.seek(0)
    
    return buffer
```

### 2. `backend/routers/reports.py`
```python
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from datetime import datetime

from database import get_db
from models import Order, Client, Payment, User
from auth import get_current_user, require_role
from utils.pdf_generator import (
    pdf_generate_order_ticket,
    pdf_generate_invoice,
    pdf_generate_report
)

router = APIRouter()


@router.get("/orders/{order_id}/ticket")
async def download_order_ticket(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Descargar ticket PDF de una orden"""
    # Obtener orden con relaciones
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    # Obtener cliente
    client_result = await db.execute(
        select(Client).where(Client.id == order.client_id)
    )
    client = client_result.scalar_one_or_none()
    
    # Preparar datos para PDF
    order_data = {
        'folio': order.folio,
        'created_at': order.created_at.strftime('%d/%m/%Y'),
        'status': order.status,
        'priority': order.priority,
        'client': {
            'name': client.name if client else 'N/A',
            'phone': client.phone if client else 'N/A',
            'email': client.email if client else 'N/A'
        },
        'device': {
            'brand': order.device_brand if hasattr(order, 'device_brand') else 'N/A',
            'model': order.device_model if hasattr(order, 'device_model') else 'N/A',
            'imei': order.device_imei if hasattr(order, 'device_imei') else 'N/A',
            'accessories': order.device_accessories if hasattr(order, 'device_accessories') else 'N/A'
        },
        'problem': order.problem,
        'services': order.services,
        'estimated_cost': order.estimated_cost,
        'estimated_delivery': order.estimated_delivery.strftime('%d/%m/%Y')
    }
    
    # Generar PDF
    pdf_buffer = pdf_generate_order_ticket(order_data)
    
    # Retornar como stream
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=ticket_{order.folio}.pdf"
        }
    )


@router.get("/orders/{order_id}/invoice")
async def download_order_invoice(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Descargar comprobante de pago PDF"""
    # Obtener orden
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    # Obtener cliente
    client_result = await db.execute(
        select(Client).where(Client.id == order.client_id)
    )
    client = client_result.scalar_one_or_none()
    
    # Obtener pagos
    payments_result = await db.execute(
        select(Payment).where(Payment.order_id == order_id)
    )
    payments = payments_result.scalars().all()
    
    # Preparar datos
    order_data = {
        'folio': order.folio,
        'client': {
            'name': client.name if client else 'N/A'
        }
    }
    
    payments_data = [
        {
            'timestamp': p.timestamp.strftime('%d/%m/%Y %H:%M'),
            'method': p.method,
            'amount': p.amount
        }
        for p in payments
    ]
    
    # Generar PDF
    pdf_buffer = pdf_generate_invoice(order_data, payments_data)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=comprobante_{order.folio}.pdf"
        }
    )


@router.get("/generate/{report_type}")
async def generate_report(
    report_type: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "receptionist"))
):
    """Generar reporte PDF (orders, sales, inventory)"""
    if report_type not in ['orders', 'sales', 'inventory']:
        raise HTTPException(status_code=400, detail="Tipo de reporte inválido")
    
    # TODO: Implementar lógica de consulta según report_type
    report_data = {
        'start_date': start_date or datetime.now().strftime('%d/%m/%Y'),
        'end_date': end_date or datetime.now().strftime('%d/%m/%Y'),
        'data': [
            ['Columna 1', 'Columna 2', 'Columna 3'],
            ['Dato 1', 'Dato 2', 'Dato 3']
        ]
    }
    
    # Generar PDF
    pdf_buffer = pdf_generate_report(report_data, report_type)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=reporte_{report_type}_{datetime.now().strftime('%Y%m%d')}.pdf"
        }
    )
```

---

## ✅ Pasos de Implementación

### 1. Instalar dependencias
```bash
cd backend
pip install reportlab==4.0.9 Pillow==10.2.0
```

### 2. Crear estructura de carpetas
```bash
mkdir -p utils templates/pdf static/logos
```

### 3. Agregar logo
- Colocar archivo `salvacell_logo.png` en `backend/static/logos/`

### 4. Crear archivos según especificación
- Copiar `pdf_generator.py`
- Copiar `reports.py`
- Modificar `main.py`, `config.py`, `requirements.txt`

### 5. Probar generación de PDFs
```bash
# Iniciar backend
uvicorn main:app --reload

# Probar endpoint
curl http://localhost:8000/api/reports/orders/{order_id}/ticket
```

---

## 🧪 Validación

### Tests a ejecutar:
```bash
# 1. Verificar que ReportLab está instalado
python -c "import reportlab; print(reportlab.Version)"

# 2. Probar generación de ticket
# GET http://localhost:8000/api/reports/orders/{id}/ticket

# 3. Probar generación de factura
# GET http://localhost:8000/api/reports/orders/{id}/invoice

# 4. Verificar PDF se descarga correctamente
# 5. Abrir PDF y verificar formato
```

**Criterios de éxito:**
- ✅ PDFs se generan sin errores
- ✅ Logo aparece correctamente
- ✅ Datos se muestran completos
- ✅ Formato es legible y profesional
- ✅ Descarga funciona desde frontend

---

## 🔍 Interfaces Exportadas

### Funciones públicas:
```python
# En utils/pdf_generator.py
pdf_generate_order_ticket(order_data: dict) -> BytesIO
pdf_generate_invoice(order_data: dict, payments: list) -> BytesIO
pdf_generate_report(report_data: dict, report_type: str) -> BytesIO
```

### Endpoints REST:
```
GET /api/reports/orders/{order_id}/ticket   # Ticket PDF
GET /api/reports/orders/{order_id}/invoice  # Comprobante PDF
GET /api/reports/generate/{report_type}     # Reportes generales
```

---

## ⚠️ Conflictos con Otros Planes

### Todos los planes:
- ✅ **Sin conflictos**: Este plan es completamente independiente
- Otros planes pueden llamar a `pdf_generate_*()` para generar PDFs

---

## 📚 Referencias

- [ReportLab Documentation](https://www.reportlab.com/docs/reportlab-userguide.pdf)
- [ReportLab Platypus](https://docs.reportlab.com/reportlab/userguide/ch5_platypus/)
- [Python Pillow](https://pillow.readthedocs.io/)

---

**Última actualización:** 2026-01-17 06:30:00  
**Autor:** Plan ID PLAN-05
