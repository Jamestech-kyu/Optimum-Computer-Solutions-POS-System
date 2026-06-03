from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from customers.models import Customer
from orders.models import Order
from payments.models import Payment
from products.models import Product
from returns.models import Return
from salesapp.models import Sale


class Command(BaseCommand):
    help = "Seed demo data for local development."

    def handle(self, *args, **options):
        User = get_user_model()

        demo_users = [
            {
                "username": "admin",
                "email": "admin@example.com",
                "password": "admin12345",
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
            },
            {
                "username": "cashier",
                "email": "cashier@example.com",
                "password": "cashier12345",
                "role": "cashier",
                "is_staff": False,
                "is_superuser": False,
            },
            {
                "username": "storekeeper",
                "email": "storekeeper@example.com",
                "password": "storekeeper12345",
                "role": "storekeeper",
                "is_staff": False,
                "is_superuser": False,
            },
        ]

        for demo_user in demo_users:
            user, _created = User.objects.get_or_create(
                username=demo_user["username"],
                defaults={"email": demo_user["email"]},
            )
            user.email = demo_user["email"]
            user.role = demo_user["role"]
            user.is_staff = demo_user["is_staff"]
            user.is_superuser = demo_user["is_superuser"]
            user.is_active = True
            user.two_factor_enabled = False
            user.two_factor_code = ""
            user.two_factor_verified_at = None
            user.set_password(demo_user["password"])
            user.save()

        products = [
            {
                "name": "Premium Sugar 2kg",
                "description": "Fast-moving household staple.",
                "price": Decimal("220.00"),
                "quantity": 48,
            },
            {
                "name": "Fresh Milk 500ml",
                "description": "Daily dairy product for retail checkout.",
                "price": Decimal("75.00"),
                "quantity": 80,
            },
            {
                "name": "Cooking Oil 3L",
                "description": "High-value grocery inventory item.",
                "price": Decimal("780.00"),
                "quantity": 25,
            },
        ]

        for item in products:
            Product.objects.get_or_create(name=item["name"], defaults=item)

        customers = [
            {
                "name": "Amina Otieno",
                "email": "amina@example.com",
                "phone": "0712345678",
                "address": "Nairobi CBD",
            },
            {
                "name": "Brian Mwangi",
                "email": "brian@example.com",
                "phone": "0798765432",
                "address": "Westlands",
            },
        ]

        for customer in customers:
            Customer.objects.get_or_create(email=customer["email"], defaults=customer)

        Sale.objects.get_or_create(
            customer_name="Amina Otieno",
            amount=Decimal("1540.00"),
        )
        Payment.objects.get_or_create(
            customer_name="Amina Otieno",
            amount=Decimal("1540.00"),
            method="mpesa",
            status="paid",
            mpesa_phone="254712345678",
            mpesa_receipt="QK12DEMO",
        )
        Order.objects.get_or_create(
            customer_name="Brian Mwangi",
            phone="0798765432",
            delivery_address="Westlands, Nairobi",
            product_name="Cooking Oil 3L",
            quantity=2,
            unit_price=Decimal("780.00"),
            total_amount=Decimal("1560.00"),
            payment_method="mpesa",
            payment_status="paid",
            status="confirmed",
        )
        Return.objects.get_or_create(
            customer_name="Amina Otieno",
            item_name="Fresh Milk 500ml",
            amount=Decimal("75.00"),
            reason="Damaged packaging",
            status="approved",
        )

        self.stdout.write(self.style.SUCCESS(
            "Demo data is ready. Logins: admin / admin12345, "
            "cashier / cashier12345, storekeeper / storekeeper12345"
        ))
