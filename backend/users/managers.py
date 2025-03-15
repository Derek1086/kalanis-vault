"""
This module defines custom manager classes for the User model.
It provides specialized creation methods and validation logic for user instances.
"""
from django.contrib.auth.base_user import BaseUserManager
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.translation import gettext_lazy as _

import logging

logger = logging.getLogger('users')

class CustomUserManager(BaseUserManager):
    """
    Custom manager for the User model that provides methods for creating
    users and superusers with appropriate validation.
    """
    
    def email_validator(self, email):
        """
        Validate that the provided email is properly formatted.
        
        Raises:
            ValueError: If the email is not valid
        """
        try:
            validate_email(email)
        except ValidationError:
            raise ValueError(_("You must provide a valid email"))
    
    def username_validator(self, username):
        """
        Validate that the provided username meets requirements.
        
        Raises:
            ValueError: If the username is missing or too short
        """
        if not username:
            raise ValueError(_("Users must submit a username"))
        
        if len(username) < 3:
            raise ValueError(_("Username must be at least 3 characters long"))

    def create_user(self, first_name, last_name, email, password, username, profile_picture=None, **extra_fields):
        """
        Create and return a regular user with the provided details.
        
        Performs validation on required fields and normalizes data before
        creating the user instance.
            
        Returns:
            The created user instance
            
        Raises:
            ValueError: If required fields are missing or invalid
        """
        if not first_name:
            raise ValueError(_("Users must submit a first name"))
        
        if not last_name:
            raise ValueError(_("Users must submit a last name"))
        
        if not username:
            raise ValueError(_("Users must submit a username"))
        
        if email:
            email = self.normalize_email(email)
            self.email_validator(email)
        else:
            raise ValueError(_("Base User: Email address is required"))
        
        self.username_validator(username)
        
        user = self.model(
            first_name=first_name,
            last_name=last_name,
            email=email,
            username=username,  
            profile_picture=profile_picture,
            **extra_fields
        )

        user.set_password(password)
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)

        user.save(using=self._db)
        logger.debug(f"User created: {user}")
        return user
    
    def create_superuser(self, first_name, last_name, email, username, password, profile_picture=None, **extra_fields):
        """
        Create and return a superuser with the provided details.
        
        Extends the create_user method with additional validation and
        permission setting specific to superusers.
            
        Returns:
            The created superuser instance
            
        Raises:
            ValueError: If required fields are missing or invalid
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Superusers must have is_superuser=True"))
        
        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Superusers must have is_staff=True"))
        
        if not password:
            raise ValueError(_("Superusers must have a password"))

        if email:
            email = self.normalize_email(email)
            self.email_validator(email)
        else:
            raise ValueError(_("Admin User: Email address is required"))

        self.username_validator(username)
        user = self.create_user(first_name, last_name, email, password, username, profile_picture, **extra_fields)
        user.save()

        return user