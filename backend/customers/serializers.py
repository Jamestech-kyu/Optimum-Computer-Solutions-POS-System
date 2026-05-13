from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    """Serializer for Customer model"""
    full_name = serializers.CharField(read_only=True)
    available_credit = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = Customer
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'address', 'city', 'postal_code', 'loyalty_tier', 'loyalty_points',
            'credit_limit', 'credit_used', 'available_credit',
            'total_purchases', 'purchase_count', 'last_purchase_date',
            'is_active', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_purchases', 'purchase_count', 'last_purchase_date',
            'created_at', 'updated_at'
        ]


class CustomerCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating customers"""
    
    class Meta:
        model = Customer
        fields = [
            'first_name', 'last_name', 'email', 'phone',
            'address', 'city', 'postal_code',
            'loyalty_tier', 'credit_limit', 'is_active', 'notes'
        ]


class CustomerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list view"""
    full_name = serializers.CharField(read_only=True)
    available_credit = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = Customer
        fields = [
            'id', 'full_name', 'phone', 'email', 'loyalty_tier',
            'loyalty_points', 'credit_limit', 'available_credit',
            'total_purchases', 'purchase_count', 'is_active'
        ]
