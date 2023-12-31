from django.db import models
from common.models import CommonModel


class Comment(CommonModel):
    content = models.CharField(max_length=150)
    writer = models.ForeignKey("users.User", on_delete=models.CASCADE)
    board = models.ForeignKey("boards.Board", on_delete=models.CASCADE)
