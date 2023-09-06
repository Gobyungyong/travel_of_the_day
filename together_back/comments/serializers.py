from rest_framework.serializers import ModelSerializer

from .models import Comment
from users.serializers import UserInfoSerializer
from boards.serializers import RelatedBoardSerializer


class CommentSerializer(ModelSerializer):
    writer = UserInfoSerializer(read_only=True)
    board = RelatedBoardSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = "__all__"


class RelatedCommentSerializer(ModelSerializer):
    class Meta:
        model = Comment
        fields = ("content",)
