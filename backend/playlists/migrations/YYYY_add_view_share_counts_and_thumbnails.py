from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('playlists', '0001_initial'),  # Replace with your last migration
    ]

    operations = [
        migrations.AddField(
            model_name='playlist',
            name='view_count',
            field=models.PositiveIntegerField(default=0, verbose_name='View Count'),
        ),
        migrations.AddField(
            model_name='playlist',
            name='share_count',
            field=models.PositiveIntegerField(default=0, verbose_name='Share Count'),
        ),
        migrations.AddField(
            model_name='playlist',
            name='thumbnail',
            field=models.ImageField(blank=True, null=True, upload_to='playlist_thumbnails/', verbose_name='Thumbnail'),
        ),
        migrations.AddField(
            model_name='video',
            name='custom_thumbnail',
            field=models.ImageField(blank=True, null=True, upload_to='video_thumbnails/', verbose_name='Custom Thumbnail'),
        ),
    ]