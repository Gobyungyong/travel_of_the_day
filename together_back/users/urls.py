from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path("rest_auth/", include("dj_rest_auth.urls")),
    path("rest_auth_registration/", include("dj_rest_auth.registration.urls")),
    path("all_auth/", include("allauth.urls")),
    # path("login/", TokenObtainPairView.as_view()),
    # path("refresh/", TokenRefreshView.as_view()),
    # path("signup/", views.Signup.as_view()),
    # path("logout/", views.Logout.as_view()),
    # path("myinfo/", views.UserInfo.as_view()),
    # path("check_username/", views.CheckUsername.as_view()),
    # path("check_nickname/", views.CheckNickname.as_view()),
]
