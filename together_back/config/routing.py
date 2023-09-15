from django.urls import path

from chattings.consumers import (
    ChattingConsumer,
    NotificationConsumer,
    ConversationNotificationConsumer,
)

websocket_urlpatterns = [
    path("ws/chattings/<conversation_name>/", ChattingConsumer.as_asgi()),
    path("ws/notifications/", NotificationConsumer.as_asgi()),
    path("ws/conversations/", ConversationNotificationConsumer.as_asgi()),
]
