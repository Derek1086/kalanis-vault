"""
This module configures the Django admin interface for the custom User model.
It defines how User objects are displayed, filtered, and edited in the admin panel.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .forms import CustomUserChangeForm, CustomUserCreationForm
from django.utils.translation import gettext_lazy as _
from .models import User, UserFollow

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

@admin.register(UserFollow)
class UserFollowAdmin(admin.ModelAdmin):
    """
    Admin configuration for the UserFollow model.
    """
    list_display = ['follower', 'followed', 'created_at']
    list_filter = ['created_at']
    search_fields = ['follower__username', 'followed__username', 'follower__email', 'followed__email']
    date_hierarchy = 'created_at'
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Customize the foreign key fields in the admin form."""
        if db_field.name == "follower" or db_field.name == "followed":
            kwargs["queryset"] = User.objects.order_by('username')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


admin.site.register(User, UserAdmin)