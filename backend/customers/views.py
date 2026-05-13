from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Customer
from .serializers import (
    CustomerSerializer,
    CustomerCreateUpdateSerializer,
    CustomerListSerializer
)


class CustomerViewSet(viewsets.ModelViewSet):
    """ViewSet for Customer management with search and filtering"""
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Search fields
    search_fields = ['first_name', 'last_name', 'phone', 'email']
    
    # Filter fields
    filterset_fields = ['is_active', 'loyalty_tier']
    
    # Ordering
    ordering_fields = ['created_at', 'total_purchases', 'purchase_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return CustomerListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CustomerCreateUpdateSerializer
        return CustomerSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new customer"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            CustomerSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['get'])
    def purchase_history(self, request, pk=None):
        """Get customer's purchase history"""
        customer = self.get_object()
        # Return basic info for now - will be linked to actual sales once Sales model is created
        return Response({
            'customer_id': customer.id,
            'total_purchases': customer.total_purchases,
            'purchase_count': customer.purchase_count,
            'last_purchase': customer.last_purchase_date,
            'message': 'Purchase history will be populated once Sales module is configured'
        })
    
    @action(detail=True, methods=['post'])
    def add_loyalty_points(self, request, pk=None):
        """Add loyalty points to a customer"""
        customer = self.get_object()
        points = request.data.get('points', 0)
        
        try:
            points = int(points)
            if points < 0:
                return Response(
                    {'error': 'Points must be positive'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            customer.loyalty_points += points
            customer.save()
            
            return Response({
                'id': customer.id,
                'loyalty_points': customer.loyalty_points,
                'message': f'Added {points} loyalty points'
            })
        except ValueError:
            return Response(
                {'error': 'Points must be a number'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def update_credit(self, request, pk=None):
        """Update customer credit information"""
        customer = self.get_object()
        credit_limit = request.data.get('credit_limit')
        credit_used = request.data.get('credit_used')
        
        if credit_limit is not None:
            try:
                customer.credit_limit = float(credit_limit)
            except (ValueError, TypeError):
                return Response(
                    {'error': 'credit_limit must be a valid number'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if credit_used is not None:
            try:
                customer.credit_used = float(credit_used)
            except (ValueError, TypeError):
                return Response(
                    {'error': 'credit_used must be a valid number'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        customer.save()
        return Response(CustomerSerializer(customer).data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced search endpoint"""
        query = request.query_params.get('q', '')
        tier = request.query_params.get('tier')
        min_spent = request.query_params.get('min_spent')
        max_spent = request.query_params.get('max_spent')
        
        queryset = Customer.objects.all()
        
        if query:
            queryset = queryset.filter(
                first_name__icontains=query
            ) | queryset.filter(
                last_name__icontains=query
            ) | queryset.filter(
                phone__icontains=query
            ) | queryset.filter(
                email__icontains=query
            )
        
        if tier:
            queryset = queryset.filter(loyalty_tier=tier)
        
        if min_spent:
            try:
                queryset = queryset.filter(total_purchases__gte=float(min_spent))
            except ValueError:
                pass
        
        if max_spent:
            try:
                queryset = queryset.filter(total_purchases__lte=float(max_spent))
            except ValueError:
                pass
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

