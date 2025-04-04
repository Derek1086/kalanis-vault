from django.contrib import admin
from .models import Playlist, Video, UserFollow

@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'created_at', 'is_public', 'video_count', 'like_count']
    list_filter = ['is_public', 'created_at', 'updated_at']
    search_fields = ['title', 'description', 'user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['tiktok_id', 'title', 'playlist', 'added_at', 'order']
    list_filter = ['added_at', 'playlist__title']
    search_fields = ['title', 'tiktok_id', 'tiktok_url', 'playlist__title']
    readonly_fields = ['added_at']

@admin.register(UserFollow)
class UserFollowAdmin(admin.ModelAdmin):
    list_display = ['follower', 'followed', 'created_at']
    list_filter = ['created_at']
    search_fields = ['follower__username', 'followed__username']
    readonly_fields = ['created_at']