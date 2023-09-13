from django.urls import path

from . import views

# api/v1/recomments/
urlpatterns = [
    path("new/", views.NewRecomment.as_view()),
    path("delete/<int:recomment_id>/", views.DeleteRecomment.as_view()),
]
