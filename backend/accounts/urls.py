from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    login_view,
    logout_view,
    user_detail_view,
    CustomTokenObtainPairView,
)

app_name = 'accounts'

urlpatterns = [
    # Authentication
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User
    path('user/me/', user_detail_view, name='user_detail'),
]
