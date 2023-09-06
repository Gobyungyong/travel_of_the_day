from rest_framework.serializers import ModelSerializer

from .models import Board
from users.serializers import UserInfoSerializer


class BoardSerializer(ModelSerializer):
    writer = UserInfoSerializer(read_only=True)

    class Meta:
        model = Board
        fields = "__all__"


class RelatedBoardSerializer(ModelSerializer):
    class Meta:
        model = Board
        fields = (
            "id",
            "subject",
        )
