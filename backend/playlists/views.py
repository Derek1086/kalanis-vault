from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Playlist, Video, UserFollow
from .serializers import (
    PlaylistSerializer, 
    PlaylistCreateSerializer,
    VideoSerializer, 
    UserFollowSerializer
)
from .permissions import IsOwnerOrReadOnly

class PlaylistViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing playlists.
    """
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'title']
    
    def get_queryset(self):
        """
        Return public playlists and the user's private playlists.
        """
        user = self.request.user
        return Playlist.objects.filter(
            models.Q(is_public=True) | models.Q(user=user)
        ).prefetch_related('videos', 'likes')
    
    def get_serializer_class(self):
        """
        Use different serializers for list/retrieve and create actions.
        """
        if self.action == 'create':
            return PlaylistCreateSerializer
        return PlaylistSerializer
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """
        Toggle like status for a playlist.
        """
        playlist = self.get_object()
        user = request.user
        
        if user in playlist.likes.all():
            playlist.likes.remove(user)
            return Response({'status': 'unliked'})
        else:
            playlist.likes.add(user)
            return Response({'status': 'liked'})
    
    @action(detail=False, methods=['get'])
    def my_playlists(self, request):
        """
        Return only the current user's playlists.
        """
        queryset = Playlist.objects.filter(user=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def liked_playlists(self, request):
        """
        Return playlists the current user has liked.
        """
        queryset = request.user.liked_playlists.all()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class VideoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing videos within playlists.
    """
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter videos based on playlist ownership or public status.
        """
        user = self.request.user
        return Video.objects.filter(
            models.Q(playlist__is_public=True) | models.Q(playlist__user=user)
        )
    
    def perform_create(self, serializer):
        """
        Check if the current user owns the playlist before adding a video.
        """
        playlist_id = self.request.data.get('playlist')
        playlist = Playlist.objects.get(id=playlist_id)
        
        if playlist.user != self.request.user:
            return Response(
                {'detail': 'You do not have permission to add videos to this playlist.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Set the order to be the last position if not specified
        if 'order' not in self.request.data:
            order = playlist.videos.count()
            serializer.save(order=order)
        else:
            serializer.save()


class UserFollowViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user follows.
    """
    serializer_class = UserFollowSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Return follows where the current user is either follower or followed.
        """
        user = self.request.user
        return UserFollow.objects.filter(
            models.Q(follower=user) | models.Q(followed=user)
        )
    
    def perform_create(self, serializer):
        """
        Set the follower as the current user.
        """
        serializer.save(follower=self.request.user)
    
    @action(detail=False, methods=['post'])
    def toggle_follow(self, request):
        """
        Toggle follow status for a user.
        """
        user_to_follow_id = request.data.get('user_id')
        if not user_to_follow_id:
            return Response({'detail': 'User ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_to_follow = User.objects.get(id=user_to_follow_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        if user_to_follow == request.user:
            return Response({'detail': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            follow = UserFollow.objects.get(follower=request.user, followed=user_to_follow)
            follow.delete()
            return Response({'status': 'unfollowed'})
        except UserFollow.DoesNotExist:
            UserFollow.objects.create(follower=request.user, followed=user_to_follow)
            return Response({'status': 'followed'})