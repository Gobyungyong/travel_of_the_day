from django.urls import path

from . import views

urlpatterns = [
    path("", views.Conversations.as_view()),
]
