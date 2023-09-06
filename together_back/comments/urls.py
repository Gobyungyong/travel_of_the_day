from django.urls import path

from . import views

# api/v1/comments/
urlpatterns = [
    path("", views.AllComments.as_view()),
    path("new/", views.NewComment.as_view()),
]
