from django.urls import path

from . import views

# api/v1/recomments/
urlpatterns = [
    path("new/", views.NewComment.as_view()),
    path("<int:recomment_id>/", views.DeleteComment.as_view()),
]
