from django.db import models
from django.core.validators import RegexValidator


class Customer(models.Model):
    """Customer model for managing customer information"""
    LOYALTY_TIER_CHOICES = [
        ('bronze', 'Bronze'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
    ]
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, blank=True, null=True)
    
    # Phone number with validation
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message='Phone number must be entered in the format: +999999999. Up to 15 digits allowed.'
    )
    phone = models.CharField(validators=[phone_regex], max_length=17, unique=True)
    
    # Address information
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Customer metrics
    loyalty_tier = models.CharField(
        max_length=10,
        choices=LOYALTY_TIER_CHOICES,
        default='bronze'
    )
    loyalty_points = models.IntegerField(default=0)
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    credit_used = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Stats
    total_purchases = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    purchase_count = models.IntegerField(default=0)
    last_purchase_date = models.DateTimeField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone']),
            models.Index(fields=['email']),
            models.Index(fields=['first_name', 'last_name']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.phone})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def available_credit(self):
        return self.credit_limit - self.credit_used
