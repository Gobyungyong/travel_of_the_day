from django.urls import path

from . import views

# api/v1/comments/
urlpatterns = [
    path("new/", views.NewComment.as_view()),
    path("delete/<int:comment_id>/", views.DeleteComment.as_view()),
    path("<int:board_id>/", views.AllComments.as_view()),
]
