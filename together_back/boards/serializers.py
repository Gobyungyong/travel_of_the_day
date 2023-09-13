from rest_framework.serializers import ModelSerializer, SerializerMethodField

from .models import Board
from users.serializers import UsernameSerializer
from comments.serializers import RelatedCommentSerializer


class BoardSerializer(ModelSerializer):
    writer = UsernameSerializer(read_only=True)
    comment_set = RelatedCommentSerializer(read_only=True, many=True)
    comments_count = SerializerMethodField()

    class Meta:
        model = Board
        fields = "__all__"

    def get_comments_count(self, board):
        return board.comment_set.all().count()


class BoardInfoSerializer(ModelSerializer):
    writer = UsernameSerializer(read_only=True)
    comment_set = RelatedCommentSerializer(read_only=True, many=True)
    is_writer = SerializerMethodField()
    is_staff = SerializerMethodField()
    comments_count = SerializerMethodField()

    class Meta:
        model = Board
        fields = "__all__"

    def get_is_writer(self, board):
        return board.writer == self.context["request"].user

    def get_is_staff(self, board):
        return self.context["request"].user.is_staff

    def get_comments_count(self, board):
        return board.comment_set.all().count()


class RelatedBoardSerializer(ModelSerializer):
    class Meta:
        model = Board
        fields = ("id", "subject", "created_at", "updated_at")
