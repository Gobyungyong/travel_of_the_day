from django.urls import path

from chattings.consumers import ChattingConsumer

# 127.0.0.1:8000/chattings/<room_name>
websocket_urlpatterns = [
    path("chattings", ChattingConsumer.as_asgi()),
    # path(r"^chattings/(?P<room_name>[^/]+)/$", ChattingConsumer.as_asgi()),
]
