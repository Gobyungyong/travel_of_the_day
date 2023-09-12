from django.urls import path

from chattings.consumers import (
    ChattingConsumer,
    NotificationConsumer,
    ConversationNotificationConsumer,
)

websocket_urlpatterns = [
    path("chattings/<conversation_name>/", ChattingConsumer.as_asgi()),
    path("notifications/", NotificationConsumer.as_asgi()),
    path("conversations/", ConversationNotificationConsumer.as_asgi()),
]
