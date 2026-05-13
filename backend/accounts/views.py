from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import (
    CustomTokenObtainPairSerializer,
    LoginSerializer,
    UserSerializer,
    UserDetailSerializer,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token view with user data"""
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login endpoint that returns JWT tokens"""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user = serializer.validated_data['user']
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': UserSerializer(user).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout endpoint"""
    return Response({'detail': 'Logout successful'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail_view(request):
    """Get current user details"""
    serializer = UserDetailSerializer(request.user)
    return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User management"""
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """Return current user if 'me' is requested"""
        if self.kwargs.get('pk') == 'me':
            return self.request.user
        return super().get_object()
