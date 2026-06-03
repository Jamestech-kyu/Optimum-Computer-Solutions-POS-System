from django.contrib import admin
from django.urls import path, include
from users import api  # Import the api

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', api.login_api, name='login'),
    # ... other URLs
]