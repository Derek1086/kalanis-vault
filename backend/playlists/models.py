from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import User

class Tag(models.Model):
    """
    Model representing playlist tags.
    """
    name = models.CharField(_("Name"), max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _("Tag")
        verbose_name_plural = _("Tags")
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Playlist(models.Model):
    """
    Model representing a user's video playlist.
    """
    title = models.CharField(_("Title"), max_length=100)
    description = models.TextField(_("Description"), blank=True, null=True)
    cover_image = models.ImageField(
        _("Cover Image"),
        upload_to="playlist_covers/",
        default="playlist_covers/default.png",
        blank=True,
        null=True
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="playlists")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_public = models.BooleanField(_("Public"), default=True)
    view_count = models.PositiveIntegerField(_("View Count"), default=0)
    share_count = models.PositiveIntegerField(_("Share Count"), default=0)
    
    likes = models.ManyToManyField(User, related_name="liked_playlists", blank=True)
    tags = models.ManyToManyField(Tag, related_name="playlists", blank=True)
    
    class Meta:
        verbose_name = _("Playlist")
        verbose_name_plural = _("Playlists")
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} by {self.user.username}"
    
    @property
    def video_count(self):
        """Returns the number of videos in this playlist"""
        return self.videos.count()
    
    @property
    def like_count(self):
        """Returns the number of likes for this playlist"""
        return self.likes.count()


class Video(models.Model):
    """
    Model representing a TikTok video saved to a playlist.
    """
    title = models.CharField(_("Title"), max_length=200, blank=True, null=True)
    tiktok_url = models.URLField(_("TikTok URL"))
    tiktok_id = models.CharField(_("TikTok ID"), max_length=100)
    thumbnail_url = models.URLField(_("Thumbnail URL"), blank=True, null=True)
    custom_thumbnail = models.ImageField(
        _("Custom Thumbnail"),
        upload_to="video_thumbnails/",
        blank=True,
        null=True
    )
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="videos")
    added_at = models.DateTimeField(auto_now_add=True)
    order = models.PositiveIntegerField(_("Order"), default=0)
    
    class Meta:
        verbose_name = _("Video")
        verbose_name_plural = _("Videos")
        ordering = ['order', 'added_at']
    
    def __str__(self):
        return f"Video {self.tiktok_id} in {self.playlist.title}"


class UserFollow(models.Model):
    """
    Model to track user following relationships.
    """
    follower = models.ForeignKey(User, related_name="following", on_delete=models.CASCADE)
    followed = models.ForeignKey(User, related_name="followers", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _("User Follow")
        verbose_name_plural = _("User Follows")
        unique_together = ['follower', 'followed']
    
    def __str__(self):
        return f"{self.follower.username} follows {self.followed.username}"