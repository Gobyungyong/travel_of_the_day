from django.db import models


class Conversation(models.Model):
    name = models.CharField(max_length=128)
    online = models.ManyToManyField("users.User", blank=True)

    def get_online_count(self):
        return self.online.count()

    def join(self, user):
        self.online.add(user)
        self.save()

    def leave(self, user):
        self.online.remove(user)
        self.save()

    def count_messages(self):
        return self.messages.count()

    def __str__(self):
        return f"{self.name} ({self.get_online_count()})"


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    from_user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="messages_from_me"
    )
    to_user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="messages_to_me"
    )
    content = models.CharField(max_length=512)
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"From {self.from_user.username} to {self.to_user.username}: {self.content} [{self.timestamp}]"
