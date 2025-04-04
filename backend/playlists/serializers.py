from rest_framework import serializers
from .models import Playlist, Video, UserFollow
from users.serializers import CreateUserSerializer

class VideoSerializer(serializers.ModelSerializer):
    """
    Serializer for the Video model.
    """
    class Meta:
        model = Video
        fields = ['id', 'title', 'tiktok_url', 'tiktok_id', 'thumbnail_url', 'playlist', 'added_at', 'order']
        read_only_fields = ['added_at']


class PlaylistSerializer(serializers.ModelSerializer):
    """
    Serializer for the Playlist model.
    """
    videos = VideoSerializer(many=True, read_only=True)
    user = CreateUserSerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    video_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Playlist
        fields = ['id', 'title', 'description', 'cover_image', 'user', 'created_at', 
                 'updated_at', 'is_public', 'videos', 'like_count', 'video_count', 'is_liked']
        read_only_fields = ['created_at', 'updated_at', 'user']
    
    def get_is_liked(self, obj):
        """Check if the current user has liked this playlist"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user in obj.likes.all()
        return False


class PlaylistCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating playlists.
    """
    class Meta:
        model = Playlist
        fields = ['id', 'title', 'description', 'cover_image', 'is_public']
    
    def create(self, validated_data):
        """Add the current user to the playlist data"""
        user = self.context['request'].user
        playlist = Playlist.objects.create(user=user, **validated_data)
        return playlist


class UserFollowSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserFollow model.
    """
    follower_detail = CreateUserSerializer(source='follower', read_only=True)
    followed_detail = CreateUserSerializer(source='followed', read_only=True)
    
    class Meta:
        model = UserFollow
        fields = ['id', 'follower', 'followed', 'created_at', 'follower_detail', 'followed_detail']
        read_only_fields = ['created_at']