from rest_framework import serializers
from .models import Playlist, Video, UserFollow, Tag, PlaylistView
from users.serializers import CreateUserSerializer

class TagSerializer(serializers.ModelSerializer):
    """
    Serializer for the Tag model.
    """
    class Meta:
        model = Tag
        fields = ['id', 'name']

class VideoSerializer(serializers.ModelSerializer):
    """
    Serializer for the Video model.
    """
    class Meta:
        model = Video
        fields = ['id', 'title', 'tiktok_url', 'tiktok_id', 'thumbnail_url', 
                 'custom_thumbnail', 'playlist', 'added_at', 'order']
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
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Playlist
        fields = ['id', 'title', 'description', 'cover_image', 
                 'user', 'created_at', 'updated_at', 'is_public', 'videos', 
                 'like_count', 'video_count', 'is_liked', 'view_count', 'share_count',
                 'tags']
        read_only_fields = ['created_at', 'updated_at', 'user', 'view_count', 'share_count']
    
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
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = Playlist
        fields = ['id', 'title', 'description', 'cover_image', 'is_public', 'tags']
    
    def create(self, validated_data):
        """Add the current user to the playlist data and handle tags"""
        tags_data = validated_data.pop('tags', [])
        
        user = self.context['request'].user
        playlist = Playlist.objects.create(user=user, **validated_data)
        
        self._add_tags_to_playlist(playlist, tags_data)
        
        return playlist

    def update(self, instance, validated_data):
        """Handle updating playlist and tags"""
        tags_data = validated_data.pop('tags', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if tags_data is not None:
            instance.tags.clear()
            self._add_tags_to_playlist(instance, tags_data)
        
        return instance
    
    def _add_tags_to_playlist(self, playlist, tags_data):
        """Helper method to add tags to a playlist"""
        if not tags_data:
            return
            
        for tag_name in tags_data:
            if isinstance(tag_name, str):
                tag, created = Tag.objects.get_or_create(name=tag_name.strip().lower())
                playlist.tags.add(tag)

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

class PlaylistViewSerializer(serializers.ModelSerializer):
    """
    Serializer for the PlaylistView model.
    """
    playlist = PlaylistSerializer(read_only=True)
    
    class Meta:
        model = PlaylistView
        fields = ['id', 'user', 'playlist', 'viewed_at']
        read_only_fields = ['viewed_at']