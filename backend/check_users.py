import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sales_system.settings')
django.setup()

from accounts.models import User

users = User.objects.all()
print("Total users in database:", len(users))
print("-" * 50)

if len(users) == 0:
    print("No users found in the database.")
else:
    for user in users:
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Superuser: {user.is_superuser}")
        print(f"Staff: {user.is_staff}")
        print("-" * 50)
