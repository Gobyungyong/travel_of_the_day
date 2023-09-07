from rest_framework.serializers import SerializerMethodField, ModelSerializer

from .models import Message, Conversation
from users.serializers import UsernameSerializer
from users.models import User


class ConversationSerializer(ModelSerializer):
    other_user = SerializerMethodField()
    last_message = SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ("id", "name", "other_user", "last_message")

    def get_last_message(self, obj):
        messages = obj.messages.all().order_by("-timestamp")
        if not messages.exists():
            return None
        message = messages[0]
        return MessageSerializer(message).data

    def get_other_user(self, obj):
        usernames = obj.name.split("__")
        context = {}
        for username in usernames:
            if username != self.context["user"].username:
                other_user = User.objects.get(username=username)
                return UsernameSerializer(other_user, context=context).data


class MessageSerializer(ModelSerializer):
    from_user = SerializerMethodField()
    to_user = SerializerMethodField()
    conversation = SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            "conversation",
            "from_user",
            "to_user",
            "content",
            "timestamp",
            "read",
        )

    def get_conversation(self, obj):
        return str(obj.conversation.id)

    def get_from_user(self, obj):
        return UsernameSerializer(obj.from_user).data

    def get_to_user(self, obj):
        return UsernameSerializer(obj.to_user).data
