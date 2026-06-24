# inventory/views.py - Add at the very top
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, F, Avg, Count, Case, When, IntegerField
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from decimal import Decimal
import pandas as pd

import io
from datetime import datetime, timedelta
from django.http import HttpResponse
from django.core.mail import EmailMessage
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image

from .models import (
    StockMovement, Batch, PurchaseOrder, PurchaseOrderItem,
    StockCount, StockCountItem, StoreTransfer, StoreTransferItem,
    StoreStock, InventoryAlert, GoodsReceivedNote, GoodsReceivedNoteItem,
)
from .serializers import (
    StockMovementSerializer, BatchSerializer, PurchaseOrderSerializer,
    PurchaseOrderReceiveSerializer, StockCountSerializer,
    StoreTransferSerializer, StoreStockSerializer, InventoryAlertSerializer,
    BulkStockUpdateSerializer, BulkPriceUpdateSerializer,
    StockMovementFilterSerializer, ImportJobSerializer,
    GoodsReceivedNoteListSerializer, GoodsReceivedNoteDetailSerializer,
    GoodsReceivedNoteCreateSerializer, GoodsReceivedNoteItemSerializer,
)

from products.models import Product, Category
from .models import Supplier, ImportJob
from users.models import User



class BatchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product Batches
    """
    
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['product', 'status', 'supplier', 'location']
    search_fields = ['batch_number', 'product__name', 'product__sku']
    ordering_fields = ['expiry_date', 'created_at', 'remaining_quantity']
    ordering = ['expiry_date']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter expiring soon
        expiring_days = self.request.query_params.get('expiring_days')
        if expiring_days:
            days = int(expiring_days)
            expiry_threshold = timezone.now().date() + timedelta(days=days)
            queryset = queryset.filter(
                expiry_date__lte=expiry_threshold,
                expiry_date__gte=timezone.now().date(),
                remaining_quantity__gt=0
            )
        
        # Filter expired
        expired = self.request.query_params.get('expired')
        if expired and expired.lower() == 'true':
            queryset = queryset.filter(expiry_date__lt=timezone.now().date())
        
        return queryset
    
    @action(detail=True, methods=['post'], url_path='consume')
    def consume_batch(self, request, pk=None):
        """
        POST /api/batches/{id}/consume/
        
        Consume stock from this batch
        Body: {"quantity": 10, "sale_id": 123, "reason": "Sold to customer"}
        """
        batch = self.get_object()
        quantity = Decimal(str(request.data.get('quantity', 0)))
        
        if quantity <= 0:
            return Response(
                {"error": "Quantity must be greater than zero"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if quantity > batch.remaining_quantity:
            return Response(
                {"error": f"Insufficient stock. Available: {batch.remaining_quantity}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Consume from batch
        old_quantity = batch.remaining_quantity
        batch.remaining_quantity -= quantity
        batch.save()
        
        # Record stock movement
        StockMovement.objects.create(
            product=batch.product,
            batch=batch,
            movement_type='sale',
            quantity=quantity,
            stock_before=old_quantity,
            stock_after=batch.remaining_quantity,
            unit_cost=batch.purchase_price,
            reference_id=request.data.get('sale_id'),
            reference_type='Sale',
            recorded_by=request.user,
            notes=request.data.get('reason', ''),
            location=batch.location
        )
        
        return Response({
            'message': f'Consumed {quantity} units from batch {batch.batch_number}',
            'remaining_quantity': batch.remaining_quantity
        })


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing stock movements (audit trail)
    """
    
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['product', 'movement_type', 'reference_type', 'location']
    search_fields = ['movement_id', 'reference_id', 'product__name', 'product__sku']
    ordering_fields = ['movement_date', 'quantity']
    ordering = ['-movement_date']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Date range filter
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(movement_date__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(movement_date__date__lte=end_date)
        
        return queryset
    
    @action(detail=False, methods=['get'], url_path='summary')
    def movement_summary(self, request):
        """
        GET /api/stock-movements/summary/?start_date=2024-01-01&end_date=2024-12-31
        
        Get summary of stock movements
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = self.get_queryset()
        
        if start_date:
            queryset = queryset.filter(movement_date__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(movement_date__date__lte=end_date)
        
        summary = {
            'total_movements': queryset.count(),
            'total_inbound': queryset.filter(
                movement_type__in=['purchase', 'return', 'transfer']
            ).aggregate(total=Sum('quantity'))['total'] or Decimal('0'),
            'total_outbound': queryset.filter(
                movement_type__in=['sale', 'damage', 'expired', 'supplier_return']
            ).aggregate(total=Sum('quantity'))['total'] or Decimal('0'),
            'by_type': queryset.values('movement_type').annotate(
                total_quantity=Sum('quantity'),
                count=Count('id')
            )
        }
        
        return Response(summary)


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Purchase Orders
    """
    
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['supplier', 'status', 'payment_status']
    search_fields = ['po_number', 'supplier__name', 'tracking_number']
    ordering_fields = ['order_date', 'total', 'expected_delivery_date']
    ordering = ['-order_date']
    
    def get_queryset(self):
        user = self.request.user
        
        # Admins see all, others see only their own
        if user.role in ['super_admin', 'admin', 'manager']:
            return PurchaseOrder.objects.all()
        return PurchaseOrder.objects.filter(created_by=user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'], url_path='submit')
    def submit_order(self, request, pk=None):
        """Submit purchase order to supplier"""
        po = self.get_object()
        
        if po.status != 'draft':
            return Response(
                {"error": f"Cannot submit order with status: {po.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        po.submit()
        
        return Response({
            'message': 'Purchase order submitted successfully',
            'status': po.status
        })
    
    @action(detail=True, methods=['post'], url_path='approve')
    def approve_order(self, request, pk=None):
        """Approve purchase order (manager approval)"""
        po = self.get_object()
        
        # Check permission
        if request.user.role not in ['super_admin', 'admin', 'manager']:
            return Response(
                {"error": "Only managers can approve purchase orders"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if po.status != 'submitted':
            return Response(
                {"error": f"Cannot approve order with status: {po.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        po.approve(request.user)
        
        return Response({
            'message': 'Purchase order approved',
            'status': po.status,
            'approved_by': po.approved_by.get_full_name(),
            'approved_at': po.approved_at
        })
    
    @action(detail=True, methods=['post'], url_path='receive')
    def receive_order(self, request, pk=None):
        """Receive items from purchase order"""
        po = self.get_object()
        
        if po.status not in ['confirmed', 'shipped', 'received']:
            return Response(
                {"error": f"Cannot receive order with status: {po.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PurchaseOrderReceiveSerializer(data=request.data, many=True)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            po.receive_items(request.user, serializer.validated_data)
        except ValidationError as error:
            return Response({'error': str(error)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'message': 'Items received successfully',
            'status': po.status,
            'purchase_order': self.get_serializer(po).data
        })
    
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_order(self, request, pk=None):
        """Cancel purchase order"""
        po = self.get_object()
        
        if po.status in ['completed', 'cancelled']:
            return Response(
                {"error": f"Cannot cancel order with status: {po.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        po.status = 'cancelled'
        po.save()
        
        return Response({
            'message': 'Purchase order cancelled',
            'status': po.status
        })

    @action(detail=True, methods=['get'], url_path='download-pdf')
    def download_pdf(self, request, pk=None):
        """Download purchase order as PDF"""
        po = self.get_object()
        items = po.items.select_related('product').all()

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4,
                                rightMargin=20*mm, leftMargin=20*mm,
                                topMargin=20*mm, bottomMargin=20*mm)
        styles = getSampleStyleSheet()
        story = []

        title_style = ParagraphStyle(
            'CustomTitle', parent=styles['Heading1'],
            fontSize=18, alignment=1, spaceAfter=6
        )
        story.append(Paragraph(f"<b>PURCHASE ORDER</b>", title_style))
        story.append(Paragraph(f"<b>{po.po_number}</b>", ParagraphStyle(
            'SubTitle', parent=styles['Normal'], fontSize=12, alignment=1, spaceAfter=15
        )))

        info_style = ParagraphStyle('Info', parent=styles['Normal'], fontSize=10, spaceAfter=3)
        bold_info = ParagraphStyle('BoldInfo', parent=info_style, fontWeight='bold')

        info_data = [
            [Paragraph(f"<b>Supplier:</b> {po.supplier.name}", info_style),
             Paragraph(f"<b>Date:</b> {po.order_date.strftime('%d-%m-%Y')}", info_style)],
            [Paragraph(f"<b>Contact:</b> {po.supplier.contact_person}", info_style),
             Paragraph(f"<b>Phone:</b> {po.supplier.phone}", info_style)],
            [Paragraph(f"<b>Email:</b> {po.supplier.email}", info_style),
             Paragraph(f"<b>Expected Delivery:</b> {po.expected_delivery_date or 'N/A'}", info_style)],
        ]

        info_table = Table(info_data, colWidths=[250, 250])
        info_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 15))

        table_data = [
            ['#', 'Product', 'SKU', 'Qty', 'Unit Cost', 'Total']
        ]
        for i, item in enumerate(items, 1):
            table_data.append([
                str(i),
                item.product.name,
                item.product.sku,
                str(int(item.quantity)),
                f"KES {float(item.unit_cost):,.2f}",
                f"KES {float(item.subtotal):,.2f}",
            ])

        col_widths = [25, 195, 70, 45, 80, 80]
        po_table = Table(table_data, colWidths=col_widths, repeatRows=1)
        po_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        story.append(po_table)
        story.append(Spacer(1, 15))

        totals_data = [
            [Paragraph(f"<b>Subtotal:</b>", styles['Normal']),
             Paragraph(f"<b>KES {float(po.subtotal):,.2f}</b>", styles['Normal'])],
            [Paragraph(f"<b>Tax ({float(po.tax_rate):.0f}%):</b>", styles['Normal']),
             Paragraph(f"<b>KES {float(po.tax_amount):,.2f}</b>", styles['Normal'])],
        ]
        if po.shipping_cost > 0:
            totals_data.append([
                Paragraph(f"<b>Shipping:</b>", styles['Normal']),
                Paragraph(f"<b>KES {float(po.shipping_cost):,.2f}</b>", styles['Normal']),
            ])
        totals_data.append([
            Paragraph(f"<b>TOTAL:</b>", ParagraphStyle('TotalLabel', parent=styles['Normal'], fontSize=12, fontWeight='bold')),
            Paragraph(f"<b>KES {float(po.total):,.2f}</b>", ParagraphStyle('TotalValue', parent=styles['Normal'], fontSize=12, fontWeight='bold')),
        ])

        totals_table = Table(totals_data, colWidths=[400, 100])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.HexColor('#1e40af')),
        ]))
        story.append(totals_table)

        if po.internal_notes:
            story.append(Spacer(1, 15))
            story.append(Paragraph(f"<b>Notes:</b> {po.internal_notes}", styles['Normal']))

        doc.build(story)
        buffer.seek(0)

        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="PO-{po.po_number}.pdf"'
        return response

    @action(detail=True, methods=['post'], url_path='send-email')
    def send_email(self, request, pk=None):
        """Send the PO PDF via email to the supplier"""
        po = self.get_object()

        if not po.supplier.email:
            return Response({"error": "Supplier has no email address configured"},
                            status=status.HTTP_400_BAD_REQUEST)

        pdf_response = self.download_pdf(request, pk=pk)
        pdf_content = pdf_response.content

        email = EmailMessage(
            subject=f"Purchase Order: {po.po_number}",
            body=f"Dear {po.supplier.contact_person or po.supplier.name},\n\n"
                 f"Please find attached Purchase Order {po.po_number} dated "
                 f"{po.order_date.strftime('%d-%m-%Y')}.\n\n"
                 f"Total: KES {float(po.total):,.2f}\n"
                 f"Expected Delivery: {po.expected_delivery_date or 'To be confirmed'}\n\n"
                 f"Kindly confirm receipt and advise on delivery schedule.\n\n"
                 f"Regards,\n{request.user.get_full_name() or request.user.username}",
            to=[po.supplier.email],
        )
        email.attach(f"PO-{po.po_number}.pdf", pdf_content, 'application/pdf')
        email.send(fail_silently=False)

        return Response({
            'message': f'PO {po.po_number} sent to {po.supplier.email}',
            'email': po.supplier.email,
        })


class StockCountViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Stock Counts (Physical Inventory)
    """
    
    queryset = StockCount.objects.all()
    serializer_class = StockCountSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'location']
    search_fields = ['count_number']
    ordering_fields = ['count_date', 'created_at']
    ordering = ['-count_date']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'], url_path='start')
    def start_count(self, request, pk=None):
        """Start the stock count process"""
        stock_count = self.get_object()
        
        if stock_count.status != 'draft':
            return Response(
                {"error": f"Cannot start count with status: {stock_count.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        stock_count.start_count()
        
        return Response({
            'message': 'Stock count started',
            'total_products': stock_count.total_products,
            'status': stock_count.status
        })
    
    @action(detail=True, methods=['post'], url_path='update-item')
    def update_count_item(self, request, pk=None):
        """
        POST /api/stock-counts/{id}/update-item/
        
        Update counted quantity for a product
        Body: {"product_id": 1, "counted_quantity": 100, "notes": "Found in back room"}
        """
        stock_count = self.get_object()
        
        if stock_count.status != 'in_progress':
            return Response(
                {"error": f"Cannot update count with status: {stock_count.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product_id = request.data.get('product_id')
        counted_quantity = Decimal(str(request.data.get('counted_quantity', 0)))
        
        try:
            item = StockCountItem.objects.get(stock_count=stock_count, product_id=product_id)
            item.counted_quantity = counted_quantity
            item.notes = request.data.get('notes', '')
            item.save()
            
            return Response({
                'message': 'Item updated',
                'product': item.product.name,
                'expected': item.expected_quantity,
                'counted': item.counted_quantity,
                'difference': item.difference
            })
        except StockCountItem.DoesNotExist:
            return Response(
                {"error": "Product not found in this stock count"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], url_path='complete')
    def complete_count(self, request, pk=None):
        """Complete stock count and apply adjustments"""
        stock_count = self.get_object()
        
        if stock_count.status != 'in_progress':
            return Response(
                {"error": f"Cannot complete count with status: {stock_count.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        stock_count.complete_count(request.user)
        
        return Response({
            'message': 'Stock count completed',
            'total_discrepancies': stock_count.total_discrepancies,
            'total_adjustment_value': stock_count.total_adjustment_value
        })


class StoreTransferViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Store Transfers (Multi-store inventory)
    """
    
    queryset = StoreTransfer.objects.all()
    serializer_class = StoreTransferSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['from_store', 'to_store', 'status']
    search_fields = ['transfer_number']
    ordering_fields = ['transfer_date']
    ordering = ['-transfer_date']
    
    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)
    
    @action(detail=True, methods=['post'], url_path='approve')
    def approve_transfer(self, request, pk=None):
        """Approve store transfer"""
        transfer = self.get_object()
        
        if request.user.role not in ['super_admin', 'admin', 'manager']:
            return Response(
                {"error": "Only managers can approve transfers"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if transfer.status != 'pending':
            return Response(
                {"error": f"Cannot approve transfer with status: {transfer.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transfer.approve_transfer(request.user)
        
        return Response({
            'message': 'Transfer approved',
            'status': transfer.status
        })
    
    @action(detail=True, methods=['post'], url_path='send')
    def send_transfer(self, request, pk=None):
        """Mark transfer as in transit"""
        transfer = self.get_object()
        
        if transfer.status != 'approved':
            return Response(
                {"error": f"Cannot send transfer with status: {transfer.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transfer.send_transfer()
        
        # Update tracking info
        if request.data.get('tracking_number'):
            transfer.tracking_number = request.data['tracking_number']
            transfer.courier = request.data.get('courier', '')
            transfer.save()
        
        return Response({
            'message': 'Transfer is now in transit',
            'status': transfer.status,
            'tracking_number': transfer.tracking_number
        })
    
    @action(detail=True, methods=['post'], url_path='receive')
    def receive_transfer(self, request, pk=None):
        """Receive transfer at destination store"""
        transfer = self.get_object()
        
        if transfer.status != 'in_transit':
            return Response(
                {"error": f"Cannot receive transfer with status: {transfer.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transfer.receive_transfer(request.user)
        
        return Response({
            'message': 'Transfer received successfully',
            'status': transfer.status,
            'received_date': transfer.received_date
        })


class StoreStockViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing store stock levels
    """
    
    queryset = StoreStock.objects.all()
    serializer_class = StoreStockSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['store', 'product__category']
    search_fields = ['product__name', 'product__sku', 'store']
    ordering_fields = ['quantity', 'product__name']
    ordering = ['store', 'product__name']
    
    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        """
        GET /api/store-stock/low-stock/?store=Main Store
        
        Get low stock items across all or specific store
        """
        store = request.query_params.get('store')
        
        queryset = self.get_queryset()
        if store:
            queryset = queryset.filter(store=store)
        
        low_stock = queryset.filter(
            quantity__lte=F('reorder_level'),
            reorder_level__gt=0
        )
        
        # Add product details
        results = []
        for item in low_stock:
            data = self.get_serializer(item).data
            data['reorder_quantity'] = float(item.product.reorder_quantity) if item.product.reorder_quantity else 0
            results.append(data)
        
        return Response({
            'count': low_stock.count(),
            'store': store if store else 'All Stores',
            'results': results
        })
    
    @action(detail=False, methods=['get'], url_path='summary')
    def store_summary(self, request):
        """
        GET /api/store-stock/summary/
        
        Get stock summary by store
        """
        summary = StoreStock.objects.values('store').annotate(
            total_quantity=Sum('quantity'),
            total_value=Sum(F('quantity') * F('product__cost_price')),
            total_retail_value=Sum(F('quantity') * F('product__retail_price')),
            product_count=Count('product', distinct=True),
            low_stock_count=Sum(
                Case(
                    When(quantity__lte=F('reorder_level'), then=1),
                    default=0,
                    output_field=IntegerField()
                )
            )
        )
        
        return Response(summary)


class InventoryAlertViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for inventory alerts
    """
    
    queryset = InventoryAlert.objects.all()
    serializer_class = InventoryAlertSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['alert_type', 'priority', 'is_resolved', 'store']
    search_fields = ['message', 'product__name']
    ordering_fields = ['created_at', 'priority']
    ordering = ['-priority', '-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Only show unresolved by default
        show_resolved = self.request.query_params.get('show_resolved')
        if not show_resolved or show_resolved.lower() != 'true':
            queryset = queryset.filter(is_resolved=False)
        
        return queryset
    
    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve_alert(self, request, pk=None):
        """
        POST /api/inventory-alerts/{id}/resolve/
        
        Mark alert as resolved
        Body: {"notes": "Reordered stock"}
        """
        alert = self.get_object()
        
        if alert.is_resolved:
            return Response(
                {"error": "Alert already resolved"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        alert.resolve(request.user, request.data.get('notes', ''))
        
        return Response({
            'message': 'Alert resolved',
            'resolved_by': alert.resolved_by.get_full_name(),
            'resolved_at': alert.resolved_at
        })
    
    @action(detail=False, methods=['post'], url_path='generate-alerts')
    def generate_alerts(self, request):
        """
        POST /api/inventory-alerts/generate-alerts/
        
        Manually trigger alert generation
        """
        from .alert_service import AlertService
        
        alerts_created = AlertService.check_all_alerts()
        
        return Response({
            'message': f'Generated {alerts_created} alerts',
            'alerts_created': alerts_created
        })


class ImportJobViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing import job history
    """
    
    queryset = ImportJob.objects.all()
    serializer_class = ImportJobSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['job_type', 'status']
    search_fields = ['job_id', 'original_filename']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        # Admins see all, others see their own
        if user.role in ['super_admin', 'admin', 'manager']:
            return ImportJob.objects.all()
        return ImportJob.objects.filter(created_by=user)


class BulkInventoryViewSet(viewsets.GenericViewSet):
    """
    ViewSet for bulk inventory operations (Excel import/export)
    """
    
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'], url_path='update-stock')
    def bulk_update_stock(self, request):
        """
        POST /api/inventory/bulk/update-stock/
        
        Update stock for multiple products via JSON
        Body: {
            "updates": [
                {"sku": "ELEC-000001", "quantity": 100, "operation": "set"},
                {"barcode": "123456789", "quantity": 50, "operation": "add"}
            ]
        }
        """
        serializer = BulkStockUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        updates = serializer.validated_data['updates']
        results = {'successful': [], 'failed': [], 'total': len(updates)}
        
        for update in updates:
            operation = update.get('operation', 'set')
            quantity = Decimal(str(update.get('quantity', 0)))
            
            if quantity <= 0:
                results['failed'].append({
                    'identifier': update,
                    'error': 'Quantity must be greater than zero'
                })
                continue
            
            # Find product
            product = None
            identifier = None
            
            if 'id' in update:
                product = Product.objects.filter(id=update['id'], is_active=True).first()
                identifier = f"ID:{update['id']}"
            elif 'sku' in update:
                product = Product.objects.filter(sku=update['sku'], is_active=True).first()
                identifier = f"SKU:{update['sku']}"
            elif 'barcode' in update:
                product = Product.objects.filter(barcode=update['barcode'], is_active=True).first()
                identifier = f"Barcode:{update['barcode']}"
            
            if not product:
                results['failed'].append({
                    'identifier': identifier or update,
                    'error': 'Product not found'
                })
                continue
            
            old_stock = product.stock_quantity
            
            if operation == 'set':
                new_stock = quantity
            elif operation == 'add':
                new_stock = old_stock + quantity
            elif operation == 'subtract':
                if old_stock < quantity:
                    results['failed'].append({
                        'identifier': identifier,
                        'error': f'Insufficient stock. Available: {old_stock}'
                    })
                    continue
                new_stock = old_stock - quantity
            else:
                results['failed'].append({
                    'identifier': identifier,
                    'error': f'Invalid operation: {operation}'
                })
                continue
            
            # Update stock
            product.stock_quantity = new_stock
            product.save()
            
            # Record movement
            StockMovement.objects.create(
                product=product,
                movement_type='adjustment',
                quantity=abs(quantity),
                stock_before=old_stock,
                stock_after=new_stock,
                unit_cost=product.cost_price,
                reference_id='bulk_update',
                recorded_by=request.user,
                notes=f"Bulk update: {operation} {quantity} units",
                reason=request.data.get('reason', '')
            )
            
            results['successful'].append({
                'sku': product.sku,
                'name': product.name,
                'operation': operation,
                'old_stock': float(old_stock),
                'new_stock': float(new_stock)
            })
        
        return Response({
            'message': f"Updated {len(results['successful'])} of {results['total']} products",
            'successful_count': len(results['successful']),
            'failed_count': len(results['failed']),
            'successful': results['successful'],
            'failed': results['failed']
        })
    
    @action(detail=False, methods=['post'], url_path='update-prices')
    def bulk_update_prices(self, request):
        """
        POST /api/inventory/bulk/update-prices/
        
        Bulk update product prices
        Body: {
            "update_type": "percentage",
            "adjustment": 10,
            "price_field": "retail_price",
            "category_id": 1
        }
        """
        serializer = BulkPriceUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        update_type = data['update_type']
        adjustment = data['adjustment']
        price_field = data['price_field']
        
        # Get products to update
        queryset = Product.objects.filter(is_active=True)
        
        if data.get('category_id'):
            queryset = queryset.filter(category_id=data['category_id'])
        elif data.get('supplier_id'):
            queryset = queryset.filter(supplier_id=data['supplier_id'])
        elif data.get('product_ids'):
            queryset = queryset.filter(id__in=data['product_ids'])
        
        original_count = queryset.count()
        updated_count = 0
        updated_products = []
        
        for product in queryset:
            current_price = getattr(product, price_field)
            
            if current_price is None:
                continue
            
            if update_type == 'percentage':
                new_price = current_price * (1 + Decimal(str(adjustment)) / 100)
            else:
                new_price = current_price + Decimal(str(adjustment))
            
            new_price = max(Decimal('0'), new_price)
            
            setattr(product, price_field, new_price)
            product.save(update_fields=[price_field, 'updated_at'])
            updated_count += 1
            
            updated_products.append({
                'id': product.id,
                'name': product.name,
                'sku': product.sku,
                'old_price': float(current_price),
                'new_price': float(new_price)
            })
        
        return Response({
            'message': f'Updated {updated_count} of {original_count} products',
            'updated_count': updated_count,
            'price_field': price_field,
            'update_type': update_type,
            'adjustment': adjustment,
            'updated_products': updated_products[:50]
        })
    
    @action(detail=False, methods=['get'], url_path='export-stock')
    def export_stock(self, request):
        """
        GET /api/inventory/bulk/export-stock/
        
        Export current stock levels to Excel
        """
        products = Product.objects.filter(is_active=True)
        
        data = []
        for product in products:
            data.append({
                'SKU': product.sku,
                'Product Name': product.name,
                'Category': product.category.name if product.category else '',
                'Supplier': product.supplier.name if product.supplier else '',
                'Current Stock': float(product.stock_quantity),
                'Reorder Level': float(product.reorder_level),
                'Reorder Quantity': float(product.reorder_quantity),
                'Unit': product.unit,
                'Cost Price': float(product.cost_price),
                'Retail Price': float(product.retail_price),
                'Stock Value': float(product.stock_value),
                'Status': 'Active' if product.is_active else 'Inactive',
                'Last Updated': product.updated_at.strftime('%Y-%m-%d %H:%M:%S') if product.updated_at else ''
            })
        
        df = pd.DataFrame(data)
        
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Current Stock', index=False)
            
            # Add summary sheet
            summary = {
                'Metric': ['Total Products', 'Total Stock Value', 'Low Stock Items', 'Out of Stock'],
                'Value': [
                    len(data),
                    f"KES {sum(p['Stock Value'] for p in data):,.2f}",
                    sum(1 for p in data if p['Current Stock'] <= p['Reorder Level'] and p['Reorder Level'] > 0),
                    sum(1 for p in data if p['Current Stock'] == 0)
                ]
            }
            summary_df = pd.DataFrame(summary)
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
        
        output.seek(0)
        
        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="stock_export.xlsx"'
        
        return response


class GoodsReceivedNoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Goods Received Notes (GRN).
    Supports full GRN lifecycle: create from PO, verify items, cancel.
    Location is set from PO or GRN default and is read-only after creation.
    """

    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'supplier', 'purchase_order', 'location']
    search_fields = ['grn_number', 'delivery_note_number', 'supplier__name']
    ordering_fields = ['received_date', 'created_at']
    ordering = ['-received_date']

    def get_serializer_class(self):
        if self.action == 'create':
            return GoodsReceivedNoteCreateSerializer
        elif self.action in ['retrieve', 'verify_all', 'verify_item']:
            return GoodsReceivedNoteDetailSerializer
        return GoodsReceivedNoteListSerializer

    def get_queryset(self):
        return GoodsReceivedNote.objects.select_related(
            'supplier', 'purchase_order', 'created_by', 'verified_by'
        ).prefetch_related(
            'items', 'items__product', 'items__purchase_order_item'
        )

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'], url_path='verify-item')
    def verify_item(self, request, pk=None):
        """Verify a single GRN item by its ID."""
        grn = self.get_object()

        item_id = request.data.get('item_id')
        if not item_id:
            return Response({"error": "item_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            item = grn.items.get(id=item_id)
        except GoodsReceivedNoteItem.DoesNotExist:
            return Response({"error": "Item not found in this GRN"}, status=status.HTTP_404_NOT_FOUND)

        if item.is_verified:
            return Response({"error": f"Item {item.product.name} is already verified."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            item.verify(request.user)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(grn)
        return Response({
            'message': f'Item {item.product.name} verified successfully.',
            'grn': serializer.data,
        })

    @action(detail=True, methods=['post'], url_path='verify-all')
    def verify_all(self, request, pk=None):
        """Verify all unverified items in the GRN at once."""
        grn = self.get_object()

        if grn.status == 'verified':
            return Response({"error": "All items are already verified."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            grn.verify_all_items(request.user)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(grn)
        return Response({
            'message': 'All items verified successfully. Stock has been updated.',
            'grn': serializer.data,
        })

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_grn(self, request, pk=None):
        """Cancel the GRN."""
        grn = self.get_object()

        try:
            grn.cancel(request.user)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': f'GRN {grn.grn_number} cancelled.',
            'status': grn.status,
        })

    @action(detail=False, methods=['get'], url_path='pending-po-items')
    def pending_po_items(self, request):
        """Get all PO items that are still pending receipt for a given PO."""
        po_id = request.query_params.get('purchase_order')
        if not po_id:
            return Response({"error": "purchase_order query parameter is required"},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            po = PurchaseOrder.objects.get(id=po_id)
        except PurchaseOrder.DoesNotExist:
            return Response({"error": "Purchase order not found"}, status=status.HTTP_404_NOT_FOUND)

        items = po.items.filter(quantity__gt=F('quantity_received'))
        serializer = PurchaseOrderItemSerializer(items, many=True)
        return Response({
            'purchase_order': po.po_number,
            'supplier': po.supplier.name,
            'supplier_id': po.supplier.id,
            'items': serializer.data,
        })
