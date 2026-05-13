from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta, datetime


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_statistics(request):
    """Get dashboard statistics - simplified version"""
    today = timezone.now().date()
    
    # Mock data for now - will be populated once models are created
    mock_stats = {
        'today': {
            'revenue': 15450.00,
            'transactions': 45,
            'items_sold': 87,
            'avg_transaction': 343.33,
            'returns': 2,
        },
        'this_month': {
            'revenue': 287500.00,
            'transactions': 892,
            'returns': 28,
            'return_amount': 3450.00,
        },
        'growth': {
            'revenue_percentage': 12.5,
            'vs_last_month': 255000.00,
        },
        'metrics': {
            'total_customers': 456,
            'total_products': 234,
            'low_stock_products': 12,
        },
        'top_products': [
            {'product__id': 1, 'product__name': 'Coca Cola 1.5L', 'total_qty': 156, 'total_revenue': 2340.00},
            {'product__id': 2, 'product__name': 'Sprite 500ml', 'total_qty': 134, 'total_revenue': 1206.00},
            {'product__id': 3, 'product__name': 'Fanta Orange', 'total_qty': 112, 'total_revenue': 896.00},
            {'product__id': 4, 'product__name': 'Water 500ml', 'total_qty': 98, 'total_revenue': 490.00},
            {'product__id': 5, 'product__name': 'Juice Box', 'total_qty': 87, 'total_revenue': 1305.00},
        ],
        'payment_methods': [
            {'payment_method': 'cash', 'count': 28, 'amount': 9450.00},
            {'payment_method': 'card', 'count': 12, 'amount': 4200.00},
            {'payment_method': 'mobile', 'count': 5, 'amount': 1800.00},
        ],
        'recent_sales': [
            {'id': 1001, 'total_amount': 450.00, 'created_at': datetime.now().isoformat(), 'payment_method': 'cash'},
            {'id': 1002, 'total_amount': 320.00, 'created_at': datetime.now().isoformat(), 'payment_method': 'card'},
            {'id': 1003, 'total_amount': 650.00, 'created_at': datetime.now().isoformat(), 'payment_method': 'cash'},
            {'id': 1004, 'total_amount': 280.00, 'created_at': datetime.now().isoformat(), 'payment_method': 'mobile'},
            {'id': 1005, 'total_amount': 520.00, 'created_at': datetime.now().isoformat(), 'payment_method': 'card'},
            {'id': 1006, 'total_amount': 890.00, 'created_at': datetime.now().isoformat(), 'payment_method': 'cash'},
            {'id': 1007, 'total_amount': 445.00, 'created_at': datetime.now().isoformat(), 'payment_method': 'card'},
            {'id': 1008, 'total_amount': 370.00, 'created_at': datetime.now().isoformat(), 'payment_method': 'cash'},
            {'id': 1009, 'total_amount': 215.00, 'created_at': datetime.now().isoformat(), 'payment_method': 'mobile'},
            {'id': 1010, 'total_amount': 780.00, 'created_at': datetime.now().isoformat(), 'payment_method': 'cash'},
        ],
    }
    
    return Response(mock_stats)
