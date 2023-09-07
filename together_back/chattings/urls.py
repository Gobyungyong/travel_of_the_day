from django.urls import path

from . import views

urlpatterns = [
    path("conversations/", views.Conversations.as_view()),
    path("<str:conversation_name>/", views.SpecificConversation.as_view()),
    path("messages/", views.Messages.as_view()),
]
