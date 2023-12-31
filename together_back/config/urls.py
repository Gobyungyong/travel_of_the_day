from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/users/", include("users.urls")),
    path("api/v1/boards/", include("boards.urls")),
    path("api/v1/comments/", include("comments.urls")),
    path("api/v1/recomments/", include("recomments.urls")),
    path("api/v1/chattings/", include("chattings.urls")),
]
