from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class EmailOrUsernameModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = User.objects.filter(
                Q(email=username) | Q(username=username)
            ).first()
            
            if user and user.check_password(password):
                return user
        except User.DoesNotExist:
            return None