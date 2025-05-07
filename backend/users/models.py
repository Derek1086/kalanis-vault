"""
This module defines the User model for the application.
It extends Django's AbstractBaseUser to implement a custom user model
with email-based authentication and additional profile fields.
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager
from django.core.exceptions import ValidationError

class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model that uses email as the unique identifier for authentication
    instead of username.
    
    This model extends Django's AbstractBaseUser and PermissionsMixin to create
    a fully featured User model with admin-compliant permissions.
    """
    first_name = models.CharField(_("First Name"), max_length=100)
    last_name = models.CharField(_("Last Name"), max_length=100)
    email = models.EmailField(_("Email Address"), max_length=254, unique=True)
    username = models.CharField(_("Username"), max_length=50, unique=True)
    profile_picture = models.ImageField(
        _("Profile Picture"), 
        upload_to="profile_pics/",
        default="profile_pics/default.png",
        blank=True
    )
    
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "username"]

    objects = CustomUserManager()

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")

    def __str__(self):
        """
        String representation of the user.
        
        Returns:
            The user's email address
        """
        return self.email
    
    @property
    def get_full_name(self):
        """
        Returns the user's full name.
        
        Returns:
            String containing the user's first and last name
        """
        return f"{self.first_name} {self.last_name}"
    
    @property
    def playlist_count(self):
        """Returns the number of playlists created by this user"""
        return self.playlists.count()

    @property
    def follower_count(self):
        """Returns the number of users following this user"""
        return self.followers.count()

    @property
    def following_count(self):
        """Returns the number of users this user is following"""
        return self.following.count()

    @property
    def liked_playlist_count(self):
        """Returns the number of playlists this user has liked"""
        return self.liked_playlists.count()
    
class UserFollow(models.Model):
    """
    Model to track user follow relationships.
    
    This model creates a many-to-many relationship between users,
    allowing users to follow each other.
    """
    follower = models.ForeignKey(
        User, 
        related_name='following', 
        on_delete=models.CASCADE,
        help_text="The user who is following"
    )
    followed = models.ForeignKey(
        User, 
        related_name='followers', 
        on_delete=models.CASCADE,
        help_text="The user who is being followed"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'followed')
        verbose_name = _("User Follow")
        verbose_name_plural = _("User Follows")

    def __str__(self):
        return f"{self.follower.username} follows {self.followed.username}"

    def clean(self):
        """Validate that users cannot follow themselves."""
        if self.follower == self.followed:
            raise ValidationError(_("Users cannot follow themselves."))