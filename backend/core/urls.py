from django.urls import path
from .views import dashboard_statistics

app_name = 'core'

urlpatterns = [
    path('dashboard/statistics/', dashboard_statistics, name='dashboard_statistics'),
]
