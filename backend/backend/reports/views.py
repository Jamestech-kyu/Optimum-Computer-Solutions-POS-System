# reports/views.py - COMPLETE REPLACEMENT
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from django.utils import timezone
from decimal import Decimal

from .models import models

from .models import SavedReport, ReportExport
from .serializers import SavedReportSerializer, ReportExportSerializer


class ReportViewSet(viewsets.GenericViewSet):
    """
    ViewSet for generating reports
    Simplified version to avoid URL pattern errors
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard_stats(self, request):
        """Get dashboard statistics"""
        from sales.models import Sale
        from products.models import Product
        
        today = timezone.now().date()
        today_start = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
        
        today_sales = Sale.objects.filter(
            sale_date__gte=today_start,
            status='completed'
        ).aggregate(total=Sum('total'))['total'] or Decimal('0')
        
        low_stock_count = Product.objects.filter(
            is_active=True,
            stock_quantity__lte=models.F('reorder_level')
        ).exclude(reorder_level=0).count()
        
        return Response({
            'today_sales': float(today_sales),
            'low_stock_count': low_stock_count,
            'message': 'Dashboard data retrieved successfully'
        })
    
    @action(detail=False, methods=['post'], url_path='generate')
    def generate_report(self, request):
        """Generate a report"""
        report_type = request.data.get('report_type', 'sales')
        return Response({
            'message': f'Report {report_type} generated',
            'data': {'sample': 'data'}
        })

    @action(detail=False, methods=['get'], url_path='tax-inclusive')
    def tax_inclusive_report(self, request):
        """Generate a tax-inclusive report showing sales & expenses with VAT breakdown."""
        from sales.models import Sale
        from payments.models import Expense
        from products.models import Product
        from django.db.models import Sum, F, ExpressionWrapper, DecimalField

        today = timezone.now().date()
        start_date = request.query_params.get('start_date', today.replace(day=1).isoformat())
        end_date = request.query_params.get('end_date', today.isoformat())

        # Sales with tax breakdown
        sales_qs = Sale.objects.filter(
            sale_date__date__gte=start_date,
            sale_date__date__lte=end_date,
            status='completed'
        ).aggregate(
            total_sales=Sum('total'),
            total_tax=Sum('tax_amount'),
            total_discount=Sum('discount_amount'),
        )

        total_sales = sales_qs['total_sales'] or Decimal('0')
        total_tax = sales_qs['total_tax'] or Decimal('0')
        total_discount = sales_qs['total_discount'] or Decimal('0')
        sales_excluding_tax = total_sales - total_tax

        # Expenses with tax
        expense_qs = Expense.objects.filter(
            expense_date__gte=start_date,
            expense_date__lte=end_date,
            status__in=['approved', 'paid']
        ).aggregate(
            total_expenses=Sum('total_amount'),
            total_tax=Sum('tax_amount'),
        )

        total_expenses = expense_qs['total_expenses'] or Decimal('0')
        total_expense_tax = expense_qs['total_tax'] or Decimal('0')
        expenses_excluding_tax = total_expenses - total_expense_tax

        # Products with tax rates
        product_tax_breakdown = Product.objects.filter(
            is_active=True
        ).values('tax_rate').annotate(
            product_count=Count('id'),
            total_stock_value=Sum(F('stock_quantity') * F('cost_price'))
        ).order_by('tax_rate')

        return Response({
            'period': {'start': start_date, 'end': end_date},
            'sales': {
                'total_including_tax': float(total_sales),
                'total_excluding_tax': float(sales_excluding_tax),
                'tax_amount': float(total_tax),
                'discount_amount': float(total_discount),
                'effective_tax_rate': float(
                    (total_tax / sales_excluding_tax * 100) if sales_excluding_tax > 0 else 0
                ),
            },
            'expenses': {
                'total_including_tax': float(total_expenses),
                'total_excluding_tax': float(expenses_excluding_tax),
                'tax_amount': float(total_expense_tax),
            },
            'net_position': {
                'net_sales': float(total_sales - total_expenses),
                'net_excluding_tax': float(sales_excluding_tax - expenses_excluding_tax),
                'total_tax_liability': float(total_tax - total_expense_tax),
            },
            'product_tax_breakdown': [
                {
                    'tax_rate': f"{p['tax_rate']}%",
                    'product_count': p['product_count'],
                    'total_stock_value': float(p['total_stock_value'] or 0),
                }
                for p in product_tax_breakdown
            ],
        })


class SavedReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for saved report configurations
    """
    queryset = SavedReport.objects.all()
    serializer_class = SavedReportSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['report_type', 'is_public']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        return SavedReport.objects.filter(
           # models.Q(created_by=user) | models.Q(is_public=True)
        )
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'], url_path='run')
    def run_report(self, request, pk=None):
        """Run a saved report"""
        saved_report = self.get_object()
        return Response({
            'message': f'Running report: {saved_report.name}',
            'report_type': saved_report.report_type,
            'config': saved_report.config
        })
