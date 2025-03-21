"""
This module configures the Django admin interface for the custom User model.
It defines how User objects are displayed, filtered, and edited in the admin panel.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .forms import CustomUserChangeForm, CustomUserCreationForm
from django.utils.translation import gettext_lazy as _
from .models import User

class UserAdmin(BaseUserAdmin):
    """
    Custom UserAdmin class that extends Django's BaseUserAdmin.
    Customizes the admin interface for our User model with appropriate
    display fields, filtering options, and form layouts.
    """
    ordering = ["email"]
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = ["email", "username", "first_name", "last_name", "is_staff", "is_active", "profile_picture"]
    list_display_links = ["email", "username"]
    list_filter = ["email", "username", "first_name", "last_name", "is_staff", "is_active"]
    search_fields = ["email", "username", "first_name", "last_name"]
    
    fieldsets = (
        (_("Login Credentials"), {"fields": ("email", "username", "password")}),
        (_("Personal Information"), {"fields": ('first_name', 'last_name', 'profile_picture')}),
        (_("Permissions and Groups"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Important Dates"), {"fields": ("last_login",)}),
    )
    
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "first_name", "last_name", "password1", "password2", "is_staff", "is_active", "profile_picture"),
        }),
    )

admin.site.register(User, UserAdmin)