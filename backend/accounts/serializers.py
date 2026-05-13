from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'full_name', 'role', 'is_superuser', 'is_staff')


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user data"""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user information to the token response
        user = self.user
        data['user'] = UserSerializer(user).data
        
        return data


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        user = authenticate(username=username, password=password)
        
        if not user:
            raise serializers.ValidationError('Invalid username or password.')
        
        attrs['user'] = user
        return attrs


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed user serializer"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'full_name', 'role', 'is_superuser', 'is_staff', 'is_active')
        read_only_fields = ('id', 'is_superuser', 'is_staff')
