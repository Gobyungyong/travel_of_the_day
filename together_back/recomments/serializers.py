from rest_framework.serializers import ModelSerializer

from .models import Recomment
from users.serializers import UsernameSerializer


class RecommentSerializer(ModelSerializer):
    writer = UsernameSerializer(read_only=True)

    class Meta:
        model = Recomment
        fields = "__all__"
