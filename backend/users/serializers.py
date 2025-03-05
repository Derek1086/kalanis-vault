from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer


User = get_user_model()

class CreateUserSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'password']
    
    def create(self, validated_data):
        # Ensure first_name and last_name are passed
        if 'first_name' not in validated_data or 'last_name' not in validated_data:
            raise ValueError("First name and last name are required")
        
        # Optional username handling
        username = validated_data.get('username')
        
        user = User.objects.create_user(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            password=validated_data['password'],
            username=username
        )
        return user