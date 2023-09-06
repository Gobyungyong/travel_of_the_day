from django.db import models


class Board(models.Model):
    subject = models.CharField(max_length=30)
    content = models.TextField()
    writer = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="board"
    )
