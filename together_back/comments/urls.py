from django.urls import path

from . import views

# api/v1/comments/
urlpatterns = [
    path("<int:board_id>/", views.AllComments.as_view()),
    path("new/", views.NewComment.as_view()),
    path("<int:comment_id>/", views.DeleteComment.as_view()),
]
