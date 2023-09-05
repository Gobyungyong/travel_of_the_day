from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = (
        (
            None,
            {"fields": ("username", "password", "is_active")},
        ),
        (("Personal info"), {"fields": ("email", "age", "gender")}),
    )

    list_display = ("username", "name", "age", "gender")
