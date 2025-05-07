from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import CreateUserSerializer, UserFollowSerializer, UserFollowStatusSerializer
from .models import UserFollow
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from rest_framework.views import APIView

User = get_user_model()

class CreateUserView(generics.CreateAPIView):
    """API endpoint to register new users."""
    queryset = User.objects.all()
    serializer_class = CreateUserSerializer
    permission_classes = [permissions.AllowAny] 


class UserProfileView(generics.RetrieveUpdateAPIView):
    """API endpoint for users to retrieve and update their profile."""
    queryset = User.objects.all()
    serializer_class = CreateUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  

    def get_object(self):
        """Retrieve the authenticated user's profile."""
        return self.request.user

    def update(self, request, *args, **kwargs):
        """Custom update method to handle profile picture uploads."""
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserByUsernameView(generics.RetrieveAPIView):
    """API endpoint to retrieve a user by their username."""
    queryset = User.objects.all()
    serializer_class = CreateUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'username'
    lookup_url_kwarg = 'username'

    def retrieve(self, request, *args, **kwargs):
        """Custom retrieve method to include follow stats."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        data['follower_count'] = instance.followers.count()
        data['following_count'] = instance.following.count()
        
        is_following = False
        if request.user.is_authenticated:
            is_following = instance.followers.filter(follower=request.user).exists()
        data['is_following'] = is_following
        
        return Response(data)

class FollowUserView(generics.CreateAPIView):
    """API endpoint to follow a user."""
    serializer_class = UserFollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            user_to_follow = User.objects.get(id=request.data.get('user_id'))
            
            # Prevent users from following themselves
            if user_to_follow == request.user:
                return Response(
                    {"detail": "You cannot follow yourself."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if already following
            if UserFollow.objects.filter(follower=request.user, followed=user_to_follow).exists():
                return Response(
                    {"detail": "You are already following this user."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create follow relationship
            follow = UserFollow.objects.create(
                follower=request.user,
                followed=user_to_follow
            )
            
            serializer = self.get_serializer(follow)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class UnfollowUserView(generics.DestroyAPIView):
    """API endpoint to unfollow a user."""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, *args, **kwargs):
        try:
            user_to_unfollow_id = kwargs.get('user_id')
            user_to_unfollow = User.objects.get(id=user_to_unfollow_id)
            
            # Find and delete the follow relationship
            follow = UserFollow.objects.filter(
                follower=request.user,
                followed=user_to_unfollow
            ).first()
            
            if not follow:
                return Response(
                    {"detail": "You are not following this user."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            follow.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class FollowStatusView(generics.RetrieveAPIView):
    """API endpoint to check if current user is following another user."""
    serializer_class = UserFollowStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            user_id = kwargs.get('user_id')
            target_user = User.objects.get(id=user_id)
            
            is_following = UserFollow.objects.filter(
                follower=request.user, 
                followed=target_user
            ).exists()
            
            follower_count = target_user.followers.count()
            
            data = {
                'is_following': is_following,
                'follower_count': follower_count
            }
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid()
            return Response(serializer.data)
        
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
class UserSearchView(APIView):
    """API endpoint to search for users by username or name."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Search users by query parameter.
        Searches across username, first_name, and last_name.
        """
        query = request.query_params.get('q', '')
        if not query:
            return Response(
                {"detail": "Search query is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = User.objects.exclude(id=request.user.id)
        
        queryset = queryset.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).distinct()
        
        users_data = []
        for user in queryset:
            user_data = CreateUserSerializer(user, context={'request': request}).data
            user_data['follower_count'] = user.followers.count()
            user_data['following_count'] = user.following.count()
            user_data['is_following'] = user.followers.filter(follower=request.user).exists()
            users_data.append(user_data)
        
        return Response(users_data)