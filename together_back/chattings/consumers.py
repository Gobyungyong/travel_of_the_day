from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import TokenError, AccessToken
from urllib.parse import parse_qs
from .models import Conversation


class ChattingConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.conversation_name = None
        self.conversation = None

    async def connect(self):
        query_string = self.scope["query_string"].decode()
        token_param = parse_qs(query_string).get("token", [""])[0]

        try:
            access_token = AccessToken(token_param)
            user = access_token.user
        except TokenError:
            user = None

        if user is None:
            await self.close()
        else:
            print("Connected!")
            self.accept()
            self.conversation_name = (
                f"{self.scope['url_route']['kwargs']['conversation_name']}"
            )
            self.conversation, created = Conversation.objects.get_or_create(
                name=self.conversation_name
            )

            await self.channel_layer.group_add(
                self.conversation_name,
                self.channel_name,
            )

            # welcome message 송신
            self.send_json(
                {
                    "type": "welcome_message",
                    "message": "Hey there! You've successfully connected!",
                }
            )

    def disconnect(self, code):
        print("Disconnected!")
        return super().disconnect(code)

    async def receive_json(self, content, **kwargs):
        message_type = content["type"]
        if message_type == "chat_message":
            await self.channel_layer.group_send(
                self.conversation_name,
                {
                    "type": "chat_message_echo",
                    "name": content["name"],
                    "message": content["message"],
                },
            )
        return super().receive_json(content, **kwargs)

    def chat_message_echo(self, event):
        print(event)
        self.send_json(event)
