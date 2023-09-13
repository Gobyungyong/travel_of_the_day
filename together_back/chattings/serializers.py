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


class UnreadConversationSerializer(ModelSerializer):
    other_user = SerializerMethodField()
    last_message = SerializerMethodField()
    unread_messages_count = SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ("id", "name", "other_user", "last_message", "unread_messages_count")

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

    def get_unread_messages_count(self, obj):
        user = self.context["user"]
        # 방이 가지고 있는 메세지 중에 나한테 온건데 read가 false인것
        return obj.messages.filter(to_user=user, read=False).count()
