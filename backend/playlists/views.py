from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Playlist, Video, UserFollow, Tag, PlaylistView
from .serializers import (
    PlaylistSerializer, 
    PlaylistCreateSerializer,
    VideoSerializer, 
    UserFollowSerializer, 
    TagSerializer
)
from .permissions import IsOwnerOrReadOnly
from django.db.models import Q, F
from django.utils import timezone
from users.models import User

class TagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tags.
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    
    @action(detail=False, methods=['get'])
    def autocomplete(self, request):
        """
        API endpoint that allows autocomplete for tags.
        """
        query = request.query_params.get('q', '')
        if len(query) < 2:  
            return Response([])
            
        tags = Tag.objects.filter(name__icontains=query)[:10]  
        serializer = self.get_serializer(tags, many=True)
        return Response(serializer.data)

class PlaylistViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing playlists.
    """
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tags__name']
    ordering_fields = ['created_at', 'updated_at', 'title', 'view_count', 'share_count']
    
    def get_queryset(self):
        """
        Return public playlists and the user's private playlists.
        Filter by tag if requested.
        """
        user = self.request.user
        queryset = Playlist.objects.filter(
            Q(is_public=True) | Q(user=user)
        ).prefetch_related('videos', 'likes', 'tags')
        
        tag = self.request.query_params.get('tag', None)
        if tag:
            queryset = queryset.filter(tags__name=tag)
            
        return queryset
    
    def get_serializer_class(self):
        """
        Use different serializers for list/retrieve and create/update actions.
        """
        if self.action in ['create', 'update', 'partial_update']:
            return PlaylistCreateSerializer
        return PlaylistSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """
        Increment view count when a playlist is viewed and record in user's history.
        """
        instance = self.get_object()
        
        if request.user.is_authenticated:
            PlaylistView.objects.update_or_create(
                user=request.user,
                playlist=instance,
                defaults={'viewed_at': timezone.now()}
            )
            
            if request.user != instance.user:
                instance.view_count = F('view_count') + 1
                instance.save(update_fields=['view_count'])
                instance.refresh_from_db()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent_playlists(self, request):
        """
        Return recently viewed playlists for the current user.
        """
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Get distinct playlists from user's view history, ordered by most recent view
        recent_views = PlaylistView.objects.filter(
            user=request.user
        ).order_by('-viewed_at')[:10]
        
        playlists = [view.playlist for view in recent_views]
        serializer = self.get_serializer(playlists, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search playlists by query parameter.
        Searches across title, description, tags and username.
        """
        query = request.query_params.get('q', '')
        if not query:
            return Response(
                {'detail': 'Search query is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        queryset = Playlist.objects.filter(
            Q(is_public=True) | Q(user=user)
        ).prefetch_related('videos', 'likes', 'tags')
        
        queryset = queryset.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(tags__name__icontains=query) |
            Q(user__username__icontains=query)
        ).distinct()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
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
    
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """
        Increment share count for a playlist.
        """
        playlist = self.get_object()
        playlist.share_count = F('share_count') + 1
        playlist.save(update_fields=['share_count'])
        playlist.refresh_from_db()
        
        return Response({
            'status': 'shared',
            'share_count': playlist.share_count
        })
    
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
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """
        Return the most viewed public playlists.
        """
        queryset = Playlist.objects.filter(
            is_public=True
        ).order_by('-view_count')[:10]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_tag(self, request):
        """
        Return playlists filtered by tag name.
        """
        tag_name = request.query_params.get('tag', None)
        if not tag_name:
            return Response(
                {'detail': 'Tag parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        queryset = self.get_queryset().filter(tags__name=tag_name)
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
            Q(playlist__is_public=True) | Q(playlist__user=user)
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
            Q(follower=user) | Q(followed=user)
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