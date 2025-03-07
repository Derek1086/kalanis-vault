from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import CreateUserSerializer
from rest_framework.response import Response
from rest_framework import status

User = get_user_model()

class CreateUserView(generics.CreateAPIView):
    """API endpoint to register new users."""
    queryset = User.objects.all()
    serializer_class = CreateUserSerializer
    permission_classes = [permissions.AllowAny]  # Allow anyone to register


class UserProfileView(generics.RetrieveUpdateAPIView):
    """API endpoint for users to retrieve and update their profile."""
    queryset = User.objects.all()
    serializer_class = CreateUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # Allows image uploads

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
