from django.db import models


class Recomment(models.Model):
    content = models.CharField(max_length=150)
    writer = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="recomment"
    )
    comment = models.ForeignKey(
        "comments.Comment", on_delete=models.CASCADE, related_name="recomment"
    )
