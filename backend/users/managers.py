from django.contrib.auth.base_user import BaseUserManager
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):

    def email_validator(self, email):
        try:
            validate_email(email)
        except ValidationError:
            raise ValueError(_("You must provide a valid email"))
    
    def username_validator(self, username):
        if not username:
            raise ValueError(_("Users must submit a username"))
        
        # Add any additional username validation logic here (e.g., allowed characters)
        if len(username) < 3:
            raise ValueError(_("Username must be at least 3 characters long"))
        
    def create_user(self, first_name, last_name, email, password, username=None, **extra_fields):
        if not first_name:
            raise ValueError(_("Users must submit a first name"))
        
        if not last_name:
            raise ValueError(_("Users must submit a last name"))
        
        if email:
            email = self.normalize_email(email)
            self.email_validator(email)
        else:
            raise ValueError(_("Base User: Email address is required"))
        
        # Make username validation optional
        if username:
            self.username_validator(username)
        
        user = self.model(
            first_name=first_name,
            last_name=last_name,
            email=email,
            username=username,  # Allow None
            **extra_fields
        )

        user.set_password(password)
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)

        user.save(using=self._db)

        return user
    
    def create_superuser(self, first_name, last_name, email, username, password, **extra_fields):

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

        # Validate username
        self.username_validator(username)

        user = self.create_user(first_name, last_name, email, username, password, **extra_fields)

        user.save()   

        return user