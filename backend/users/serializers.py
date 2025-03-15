"""
This module defines serializers for the User model.
These serializers handle the conversion between complex model instances and
Python datatypes that can be easily rendered into JSON/XML/other content types.
"""
import logging
from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer
from rest_framework import serializers
from djoser.serializers import TokenCreateSerializer
from django.contrib.auth import authenticate

logger = logging.getLogger('users')

User = get_user_model()

class CreateUserSerializer(UserCreateSerializer):
    """
    Serializer for creating new user instances through the API.
    
    Extends Djoser's UserCreateSerializer to handle our custom User model,
    including profile picture uploads and additional validation.
    """
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'password', 'profile_picture']
    
    def validate(self, data):
        """
        Performs custom validation on the input data.
        
        Raises:
            ValidationError: If username is missing
        """
        if not data.get('username'):
            raise serializers.ValidationError("Username is required.")
        return data
    
    def create(self, validated_data):
        """
        Creates a new user instance with the validated data.
        
        Handles special case for profile pictures and performs additional validation.
        
        Returns:
            The created user instance
            
        Raises:
            ValueError: If required fields are missing
        """
        logger.debug(f"Creating user with data: {validated_data}")

        if 'first_name' not in validated_data or 'last_name' not in validated_data:
            raise ValueError("First name and last name are required")
        
        profile_picture = validated_data.pop('profile_picture', None)

        username = validated_data.get('username')
        if not username:
            raise ValueError("Username is required")

        user = User.objects.create_user(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            password=validated_data['password'],
            username=username,
            profile_picture=profile_picture
        )

        logger.debug(f"User created: {user}")

        return user

class CustomTokenCreateSerializer(TokenCreateSerializer):
    """
    Custom serializer for token creation during user authentication.
    
    Extends Djoser's TokenCreateSerializer to handle email-based authentication.
    """
    def validate(self, attrs):
        """
        Validates the authentication credentials.
        
        Raises:
            ValidationError: If credentials are invalid or missing
        """
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(request=self.context.get('request'), username=username, password=password)
            if not user:
                raise serializers.ValidationError("Unable to log in with provided credentials.")
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'.")

        attrs['user'] = user
        return attrs