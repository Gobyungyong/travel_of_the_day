from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import TokenError, AccessToken
from urllib.parse import parse_qs
from asgiref.sync import async_to_sync


class ChattingConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_name = None

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
            self.room_name = "home"
            self.accept()

            async_to_sync(self.channel_layer.group_add)(
                self.room_name,
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

    def receive_json(self, content, **kwargs):
        message_type = content["type"]
        if message_type == "chat_message":
            async_to_sync(self.channel_layer.group_send)(
                self.room_name,
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
