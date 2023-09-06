from django.urls import path

from . import views

# api/v1/boards/
urlpatterns = [
    path("", views.Boards.as_view()),
    path("new/", views.NewBoard.as_view()),
    path("<int:board_id>/", views.BoardDetail.as_view()),
]
