"""
This module defines custom forms for user creation and modification.
These forms extend Django's default user forms to include custom fields
and validation for our User model.
"""
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django import forms
from .models import User

class CustomUserCreationForm(UserCreationForm):
    """
    Custom form for creating new users.
    
    Extends Django's UserCreationForm to include additional fields like
    profile picture, and specifies the custom User model.
    """
    profile_picture = forms.ImageField(required=False)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ["email", "username", "first_name", "last_name", "profile_picture"]
        error_class = "error"

class CustomUserChangeForm(UserChangeForm):
    """
    Custom form for updating existing users.
    
    Extends Django's UserChangeForm to include additional fields like
    profile picture, and specifies the custom User model.
    """
    profile_picture = forms.ImageField(required=False)

    class Meta(UserChangeForm.Meta):
        model = User
        fields = ["email", "username", "first_name", "last_name", "profile_picture"]
        error_class = "error"