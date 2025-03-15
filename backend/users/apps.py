"""
This module configures the Django app configuration for the users app.
It defines metadata used by Django to recognize and manage the app.
"""
from django.apps import AppConfig

class UsersConfig(AppConfig):
    """
    Configuration class for the users app.
    
    This class provides metadata about the app to Django, including
    the default database field type and the app's name.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'