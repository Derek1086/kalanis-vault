from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from .models import Playlist, Video, Tag, PlaylistView
from .serializers import (
    PlaylistSerializer, 
    PlaylistCreateSerializer,
    VideoSerializer, 
    TagSerializer
)
from .permissions import IsOwnerOrReadOnly
from django.db.models import Q, F, Count
from django.utils import timezone
import random

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
        instance = self.get_object()
        
        if request.user.is_authenticated:
            view_exists = PlaylistView.objects.filter(
                user=request.user,
                playlist=instance
            ).exists()
            
            PlaylistView.objects.update_or_create(
                user=request.user,
                playlist=instance,
                defaults={'viewed_at': timezone.now()}
            )
            
            # Only increment the view count if:
            # 1. The viewer is not the owner
            # 2. This is a new view (not just updating an existing view)
            if request.user != instance.user and not view_exists:
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
    
    @action(detail=False, methods=['get'])
    def explore(self, request):
        """
        Returns a random selection of public playlists for exploration.
        Supports pagination for infinite scrolling with 6 playlists per page.
        """
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 6)) 
        
        base_queryset = Playlist.objects.filter(
            is_public=True
        ).annotate(
            num_videos=Count('videos')
        ).filter(
            num_videos__gt=0
        ).prefetch_related('videos', 'likes', 'tags')
        
        day_of_year = timezone.now().timetuple().tm_yday
        user_id = request.user.id
        seed = day_of_year * 1000 + user_id + page
        random.seed(seed)
        
        total_playlists = base_queryset.count()
        
        if total_playlists <= limit:
            queryset = base_queryset.all()
        else:
            offset = (page - 1) * limit
            if offset >= total_playlists:
                queryset = []
            else:
                playlist_ids = list(base_queryset.values_list('id', flat=True))
                random.shuffle(playlist_ids)
                
                end_idx = min(offset + limit, len(playlist_ids))
                page_ids = playlist_ids[offset:end_idx]
                
                if page_ids:
                    queryset = Playlist.objects.filter(
                        id__in=page_ids
                    ).prefetch_related('videos', 'likes', 'tags')
                else:
                    queryset = []
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """
        Toggle like status for a playlist.
        Any authenticated user can like/unlike a playlist.
        """
        playlist = self.get_object()
        user = request.user
        
        if user in playlist.likes.all():
            playlist.likes.remove(user)
            return Response({'status': 'unliked'})
        else:
            playlist.likes.add(user)
            return Response({'status': 'liked'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def share(self, request, pk=None):
        """
        Increment share count for a playlist.
        Any authenticated user can share a playlist.
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


