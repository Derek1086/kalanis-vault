from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserByUsernameView, CreateUserView, UserProfileView

router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    path('register/', CreateUserView.as_view(), name='user-register'),
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('by-username/<str:username>/', UserByUsernameView.as_view(), name='user-by-username'),
]