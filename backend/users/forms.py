from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django import forms
from .models import User

class CustomUserCreationForm(UserCreationForm):
    profile_picture = forms.ImageField(required=False)  # Allow optional uploads

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ["email", "username", "first_name", "last_name", "profile_picture"]
        error_class = "error"

class CustomUserChangeForm(UserChangeForm):
    profile_picture = forms.ImageField(required=False)  # Allow optional updates

    class Meta(UserChangeForm.Meta):
        model = User
        fields = ["email", "username", "first_name", "last_name", "profile_picture"]
        error_class = "error"
