from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlaylistViewSet, VideoViewSet, UserFollowViewSet, TagViewSet

router = DefaultRouter()
router.register(r'playlists', PlaylistViewSet, basename='playlist')
router.register(r'videos', VideoViewSet, basename='video')
router.register(r'follows', UserFollowViewSet, basename='follow')
router.register(r'tags', TagViewSet, basename='tag')

urlpatterns = [
    path('', include(router.urls)),
]