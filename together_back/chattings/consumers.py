import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class ChattingConsumer(WebsocketConsumer):
    # websocket 연결 시
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]

        # room group
        self.room_group_name = "chat_%s" % self.room_name
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()

    # websocket 연결 종료 시
    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    # websocket 메세지 수신 시
    # def receive(self, text_data):
    #     text_data_json = json.loads(text_data)
    #     message = text_data_json['message']
    #     self.send(text_data=json.dumps({
    #         'message': message
    #     }))

    # room group
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        text = text_data_json["text"]
        sender = text_data_json["sender"]
        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {"type": "chat_message", "message": text, "sender": sender},
        )

    def chat_message(self, event):
        # Receive message from room group
        text = event["message"]
        sender = event["sender"]
        # Send message to WebSocket
        self.send(text_data=json.dumps({"text": text, "sender": sender}))
