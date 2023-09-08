from rest_framework.serializers import ModelSerializer, SerializerMethodField

from .models import Comment
from users.serializers import UsernameSerializer

# from boards.serializers import RelatedBoardSerializer
from recomments.serializers import RecommentSerializer


class CommentSerializer(ModelSerializer):
    writer = UsernameSerializer(read_only=True)
    # board = RelatedBoardSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = "__all__"


class RelatedCommentSerializer(ModelSerializer):
    recomment_set = RecommentSerializer(read_only=True, many=True)
    recomments_count = SerializerMethodField()
    writer = UsernameSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ("content", "writer", "recomment_set", "recomments_count")

    def get_recomments_count(self, comment):
        return comment.recomment_set.all().count()
