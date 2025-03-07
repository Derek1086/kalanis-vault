import logging
from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer
from rest_framework import serializers

# Get the logger for the 'users' app
logger = logging.getLogger('users')

User = get_user_model()

class CreateUserSerializer(UserCreateSerializer):
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'password', 'profile_picture']
    
    def validate(self, data):
        if not data.get('username'):
            raise serializers.ValidationError("Username is required.")
        return data
    
    def create(self, validated_data):
        # Log the validated data
        logger.debug(f"Creating user with data: {validated_data}")

        # Ensure first_name and last_name are passed
        if 'first_name' not in validated_data or 'last_name' not in validated_data:
            raise ValueError("First name and last name are required")
        
        # Extract optional profile picture
        profile_picture = validated_data.pop('profile_picture', None)

        # Handle username
        username = validated_data.get('username')
        if not username:
            raise ValueError("Username is required")

        # Log the username and profile picture
        logger.debug(f"Username: {username}")
        logger.debug(f"Profile Picture: {profile_picture}")

        # Create user instance
        user = User.objects.create_user(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            password=validated_data['password'],
            username=username,
            profile_picture=profile_picture
        )

        # Log the created user
        logger.debug(f"User created: {user}")

        return user
    
from djoser.serializers import TokenCreateSerializer
from django.contrib.auth import authenticate
from rest_framework import serializers

class CustomTokenCreateSerializer(TokenCreateSerializer):
    def validate(self, attrs):
        # Allow login with either username or email
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(request=self.context.get('request'), username=username, password=password)
            if not user:
                user = authenticate(request=self.context.get('request'), email=username, password=password)
            if not user:
                raise serializers.ValidationError("Unable to log in with provided credentials.")
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'.")

        attrs['user'] = user
        return attrs