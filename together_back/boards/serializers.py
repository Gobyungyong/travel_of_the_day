from rest_framework.serializers import ModelSerializer, SerializerMethodField

from .models import Board
from users.serializers import UsernameSerializer


class BoardSerializer(ModelSerializer):
    writer = UsernameSerializer(read_only=True)

    class Meta:
        model = Board
        fields = "__all__"


class BoardInfoSerializer(ModelSerializer):
    writer = UsernameSerializer(read_only=True)
    is_writer = SerializerMethodField()
    is_staff = SerializerMethodField()

    class Meta:
        model = Board
        fields = "__all__"

    def get_is_writer(self, board):
        return board.writer == self.context["request"].user

    def get_is_staff(self, board):
        return self.context["request"].user.is_staff


class RelatedBoardSerializer(ModelSerializer):
    class Meta:
        model = Board
        fields = (
            "id",
            "subject",
        )
