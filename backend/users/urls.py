from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserByUsernameView, CreateUserView, UserProfileView, FollowUserView, UnfollowUserView, FollowStatusView, UserSearchView

router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    path('register/', CreateUserView.as_view(), name='user-register'),
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('by-username/<str:username>/', UserByUsernameView.as_view(), name='user-by-username'),
    path('follow/', FollowUserView.as_view(), name='follow-user'),
    path('unfollow/<int:user_id>/', UnfollowUserView.as_view(), name='unfollow-user'),
    path('follow-status/<int:user_id>/', FollowStatusView.as_view(), name='follow-status'),
    path('search/', UserSearchView.as_view(), name='user-search'),
]