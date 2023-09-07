from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync
from rest_framework_simplejwt.tokens import TokenError, AccessToken
from urllib.parse import parse_qs

from .models import Conversation, Message
from .serializers import MessageSerializer
from users.models import User


class ChattingConsumer(JsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.conversation_name = None
        self.conversation = None

    def connect(self):
        query_string = self.scope["query_string"].decode()
        token_param = parse_qs(query_string).get("token", [""])[0]

        try:
            access_token = AccessToken(token_param)
            user_id = access_token.payload["user_id"]
            user = User.objects.get(id=user_id)
            self.user = user
        except TokenError as e:
            print("토큰 에러", e)
            user = None

        if user is None:
            print("유저가 없다.")
            self.close()
        else:
            print("Connected!")
            self.accept()
            self.conversation_name = self.scope["url_route"]["kwargs"][
                "conversation_name"
            ]
            usernames = self.conversation_name.split("__")
            if usernames[0] == usernames[1]:
                self.close()

            self.conversation, created = Conversation.objects.get_or_create(
                name=self.conversation_name
            )

            async_to_sync(self.channel_layer.group_add)(
                self.conversation_name,
                self.channel_name,
            )

            self.send_json(
                {
                    "type": "online_user_list",
                    "users": [user.username for user in self.conversation.online.all()],
                }
            )

            async_to_sync(self.channel_layer.group_send)(
                self.conversation_name,
                {
                    "type": "user_join",
                    "user": self.user.username,
                },
            )

            self.conversation.online.add(self.user)

            messages = self.conversation.messages.all().order_by("-timestamp")[0:50]
            message_count = self.conversation.messages.all().count()
            self.send_json(
                {
                    "type": "last_50_messages",
                    "messages": MessageSerializer(messages, many=True).data,
                    "has_more": message_count > 50,
                }
            )

    def disconnect(self, code):
        print("Disconnected! code: ", code)
        if self.user.is_authenticated:
            async_to_sync(self.channel_layer.group_send)(
                self.conversation_name,
                {
                    "type": "user_leave",
                    "user": self.user.username,
                },
            )
        self.conversation.online.remove(self.user)

        return super().disconnect(code)

    def get_receiver(self):
        usernames = self.conversation_name.split("__")
        for username in usernames:
            if username != self.user.username:
                return User.objects.get(username=username)

    def receive_json(self, content, **kwargs):
        message_type = content["type"]

        if message_type == "chat_message":
            message = Message.objects.create(
                from_user=self.user,
                to_user=self.get_receiver(),
                content=content["message"],
                conversation=self.conversation,
            )
            print(content)
            async_to_sync(self.channel_layer.group_send)(
                self.conversation_name,
                {
                    "type": "chat_message_echo",
                    "name": self.user.username,
                    "message": MessageSerializer(message).data,
                },
            )

        if message_type == "typing":
            async_to_sync(self.channel_layer.group_send)(
                self.conversation_name,
                {
                    "type": "typing",
                    "user": self.user.username,
                    "typing": content["typing"],
                },
            )

        return super().receive_json(content, **kwargs)

    def chat_message_echo(self, event):
        print(event)
        self.send_json(event)

    def typing(self, event):
        self.send_json(event)

    def user_join(self, event):
        self.send_json(event)

    def user_leave(self, event):
        self.send_json(event)
