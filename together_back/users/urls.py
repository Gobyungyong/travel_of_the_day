from django.urls import path, include, re_path
from dj_rest_auth.registration.views import VerifyEmailView
from rest_framework_simplejwt.views import TokenRefreshView

# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

urlpatterns = [
    path("rest_auth/", include("dj_rest_auth.urls")),
    path("rest_auth_registration/", include("dj_rest_auth.registration.urls")),
    re_path(
        r"^account-confirm-email/$",
        VerifyEmailView.as_view(),
        name="account_email_verification_sent",
    ),
    re_path(
        r"^confirm-email/(?P<key>[-:\w]+)/$",
        views.ConfirmEmailView.as_view(),
        name="account_confirm_email",
    ),
    # path("login/", TokenObtainPairView.as_view()), # rest_auth/login/
    path("refresh/", TokenRefreshView.as_view()),
    # path("signup/", views.Signup.as_view()), # rest_auth/
    # path("logout/", views.Logout.as_view()), # rest_auth/logout/
    path("myinfo/", views.UserInfo.as_view()),  # GET rest_auth/user/
    path("check_username/", views.CheckUsername.as_view()),
    path("check_nickname/", views.CheckNickname.as_view()),
    path("check_email/", views.CheckNickname.as_view()),
    path("", include("allauth.urls")),
]
