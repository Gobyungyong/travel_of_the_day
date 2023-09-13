from rest_framework.serializers import ModelSerializer, SerializerMethodField

from .models import Recomment
from users.serializers import UsernameSerializer


class RecommentSerializer(ModelSerializer):
    writer = UsernameSerializer(read_only=True)
    is_writer = SerializerMethodField()

    class Meta:
        model = Recomment
        fields = "__all__"

    def get_is_writer(self, board):
        return board.writer == self.context["request"].user
