from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    name = models.CharField(max_length=10)
    nickname = models.CharField(max_length=10, unique=True)
    avatar = models.URLField()
