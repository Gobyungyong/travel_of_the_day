from rest_framework.serializers import (
    ModelSerializer,
    ValidationError,
    CharField,
    URLField,
)
from .models import User
from dj_rest_auth.registration.serializers import RegisterSerializer


class CustomRegisterSerializer(RegisterSerializer):
    name = CharField(max_length=10)
    nickname = CharField(max_length=10)
    avatar = URLField(
        default="https://kr.object.ncloudstorage.com/travel-together/profile/basic_profile/basic.png"
    )

    def get_cleaned_data(self):
        super(CustomRegisterSerializer, self).get_cleaned_data()
        return {
            "username": self.validated_data.get("username", ""),
            "password1": self.validated_data.get("password1", ""),
            "password2": self.validated_data.get("password2", ""),
            "email": self.validated_data.get("email", ""),
            "name": self.validated_data.get("name", ""),
            "nickname": self.validated_data.get("nickname", ""),
            "avatar": self.validated_data.get("avatar", ""),
        }

    def save(self, request):
        if User.objects.filter(email=self.validated_data["email"]):
            raise ValidationError({"email": "이미 존재하는 이메일입니다."})
        if User.objects.filter(nickname=self.validated_data["nickname"]):
            raise ValidationError({"nickname": "이미 존재하는 닉네임입니다."})

        user = User(
            email=self.validated_data["email"],
            username=self.validated_data["username"],
            name=self.validated_data["name"],
            nickname=self.validated_data["nickname"],
            avatar=self.validated_data["avatar"],
        )

        password = self.validated_data["password1"]
        password2 = self.validated_data["password2"]

        if password != password2:
            raise ValidationError({"password": "Passwords must match."})
        user.set_password(password)
        user.save()
        return user


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "name", "is_staff", "nickname", "avatar")


class SignUpUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class UserInfoSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "name", "email", "is_staff", "id", "nickname", "avatar")


class UsernameSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "id", "nickname", "avatar")
