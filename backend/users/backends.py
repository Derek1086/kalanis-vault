"""
This module defines custom authentication backends for the users app.
It contains a custom backend that allows users to authenticate using their email address.
"""
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailModelBackend(ModelBackend):
    """
    Custom authentication backend that allows users to authenticate using their email address.
    
    This extends Django's default ModelBackend to support email-based login
    rather than only username-based authentication.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate a user based on email address instead of username.
        
        Args:
            request: The current request object
            username: The email address entered in the login form
            password: The password entered in the login form
            
        Returns:
            The authenticated user object if credentials are valid, None otherwise
        """
        try:
            user = User.objects.filter(email=username).first()
            
            if user and user.check_password(password):
                return user
        except User.DoesNotExist:
            return None