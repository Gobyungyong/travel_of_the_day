from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync
from rest_framework_simplejwt.tokens import TokenError, AccessToken
from urllib.parse import parse_qs
from django.db.models import Q

from .models import Conversation, Message
from .serializers import MessageSerializer, UnreadConversationSerializer
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
            # 여기부터
            self.conversation_name = self.scope["url_route"]["kwargs"][
                "conversation_name"
            ]
            usernames = self.conversation_name.split("__")

            if usernames[0] == usernames[1]:
                self.close()
                return

            if usernames[0] != usernames[1]:
                if not (
                    Conversation.objects.filter(name=f"{usernames[0]}__{usernames[1]}")
                    or Conversation.objects.filter(
                        name=f"{usernames[1]}__{usernames[0]}"
                    )
                ):
                    self.conversation, created = Conversation.objects.get_or_create(
                        name=self.conversation_name
                    )
                else:
                    try:
                        self.conversation = Conversation.objects.get(
                            name=f"{usernames[0]}__{usernames[1]}"
                        )
                    except:
                        self.conversation = Conversation.objects.get(
                            name=f"{usernames[1]}__{usernames[0]}"
                        )
                    self.conversation_name = self.conversation.name

            # 여기까지

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

        usernames = self.conversation_name.split("__")

        if usernames[0] == usernames[1]:
            return super().disconnect(code)

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
        usernames = self.conversation_name.split("__")

        if usernames[0] == usernames[1]:
            print("usernames[0]", usernames[0])
            print("usernames[1]", usernames[1])
            self.close()
            return

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

            notification_group_name = self.get_receiver().username + "__notifications"
            async_to_sync(self.channel_layer.group_send)(
                notification_group_name,
                {
                    "type": "new_message_notification",
                    "name": self.user.username,
                    "message": MessageSerializer(message).data,
                },
            )

            conversations = Conversation.objects.filter(
                name__contains=self.get_receiver()
            )
            notifications_group_name = (
                self.get_receiver().username + "__notifications__"
            )
            async_to_sync(self.channel_layer.group_send)(
                notifications_group_name,
                {
                    "type": "new_messages",
                    "conversations": UnreadConversationSerializer(
                        conversations,
                        many=True,
                        context={"user": self.get_receiver()},
                    ).data,
                },
            )

        if message_type == "read_messages":
            messages_to_me = self.conversation.messages.filter(to_user=self.user)
            messages_to_me.update(read=True)

            # Update the unread message count
            unread_count = Message.objects.filter(to_user=self.user, read=False).count()
            async_to_sync(self.channel_layer.group_send)(
                self.user.username + "__notifications",
                {
                    "type": "unread_count",
                    "unread_count": unread_count,
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

    def new_message_notification(self, event):
        self.send_json(event)

    def unread_count(self, event):
        self.send_json(event)

    def new_messages(self, event):
        self.send_json(event)


class NotificationConsumer(JsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.notification_group_name = None

    def connect(self):
        query_string = self.scope["query_string"].decode()
        token_param = parse_qs(query_string).get("token", [""])[0]

        try:
            access_token = AccessToken(token_param)
            user_id = access_token.payload["user_id"]
            user = User.objects.get(id=user_id)
            self.user = user
        except TokenError as e:
            print("알림 토큰 에러", e)
            user = None

        if user is None:
            print("알림 유저가 없다.")
            self.close()
        else:
            self.accept()
            print("알림 연결 성공")
            self.notification_group_name = self.user.username + "__notifications"
            async_to_sync(self.channel_layer.group_add)(
                self.notification_group_name,
                self.channel_name,
            )
            unread_count = Message.objects.filter(to_user=self.user, read=False).count()
            self.send_json(
                {
                    "type": "unread_count",
                    "unread_count": unread_count,
                }
            )

    def disconnect(self, code):
        print("알림 연결 끊김")
        async_to_sync(self.channel_layer.group_discard)(
            self.notification_group_name,
            self.channel_name,
        )
        return super().disconnect(code)

    def new_message_notification(self, event):
        self.send_json(event)

    def unread_count(self, event):
        self.send_json(event)


# 연결됐을 때 채팅목록
# 방이 가지고 있는 메세지 중에 나한테 온건데 read가 false인것


class ConversationNotificationConsumer(JsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.notifications_group_name = None

    def connect(self):
        query_string = self.scope["query_string"].decode()
        token_param = parse_qs(query_string).get("token", [""])[0]

        try:
            access_token = AccessToken(token_param)
            user_id = access_token.payload["user_id"]
            user = User.objects.get(id=user_id)
            self.user = user
        except TokenError as e:
            print("채팅방 토큰 에러", e)
            user = None

        if user is None:
            print("채팅방 유저가 없다.")
            self.close()
        else:
            self.accept()
            print("채팅방 연결 성공")
            self.notifications_group_name = self.user.username + "__notifications__"
            async_to_sync(self.channel_layer.group_add)(
                self.notifications_group_name,
                self.channel_name,
            )
            conversations = Conversation.objects.filter(
                Q(name__istartswith=f"{self.user.username}__")
                | Q(name__iendswith=f"__{self.user.username}")
            )
            print("conversations", conversations)
            print("self.user.username", self.user.username)
            active_conversations = [
                conv for conv in conversations if conv.count_messages() > 0
            ]
            print("active_conversations", active_conversations)

            self.send_json(
                {
                    "type": "conversations",
                    "conversations": UnreadConversationSerializer(
                        active_conversations, many=True, context={"user": self.user}
                    ).data,
                }
            )

    def disconnect(self, code):
        print("채팅방 연결 끊김")

        return super().disconnect(code)

    def new_message_notification(self, event):
        self.send_json(event)

    def unread_count(self, event):
        self.send_json(event)

    def conversations(self, event):
        self.send_json(event)

    def new_messages(self, event):
        self.send_json(event)
