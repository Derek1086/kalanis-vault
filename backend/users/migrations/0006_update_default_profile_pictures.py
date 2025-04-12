from django.db import migrations
from django.core.files.storage import default_storage
from django.core.files import File
import os

def update_profile_pictures(apps, schema_editor):
    User = apps.get_model('users', 'User')
    
    # Make sure default image exists
    default_path = "profile_pics/default.png"
    if not default_storage.exists(default_path):
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(default_storage.path(default_path)), exist_ok=True)
        # Copy your default image to this location
        with open('path/to/your/default.png', 'rb') as f:
            default_storage.save(default_path, File(f))
    
    # Update existing users
    for user in User.objects.filter(profile_picture=''):
        user.profile_picture = default_path
        user.save()

def reverse_func(apps, schema_editor):
    # No reverse operation needed
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0005_alter_user_profile_picture'),
    ]

    operations = [
        migrations.RunPython(update_profile_pictures, reverse_func),
    ]