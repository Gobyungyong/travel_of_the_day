from rest_framework.serializers import ModelSerializer
from .models import User


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = (
            "username",
            "name",
            "is_staff",
        )


class SignUpUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class UserInfoSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = (
            "username",
            "name",
            "email",
            "gender",
            "age",
            "is_staff",
        )
