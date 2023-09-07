from django.urls import path

from chattings.consumers import ChattingConsumer, NotificationConsumer

# 127.0.0.1:8000/chattings/<conversation_name>
websocket_urlpatterns = [
    path("chattings/<conversation_name>/", ChattingConsumer.as_asgi()),
    path("notifications/", NotificationConsumer.as_asgi()),
]
