# Generated by Django 4.2.5 on 2023-09-10 09:59

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("boards", "0001_initial"),
        ("comments", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="comment",
            name="board",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to="boards.board"
            ),
        ),
        migrations.AlterField(
            model_name="comment",
            name="writer",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL
            ),
        ),
    ]
