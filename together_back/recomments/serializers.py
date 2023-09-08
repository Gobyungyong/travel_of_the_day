from rest_framework.serializers import ModelSerializer

from .models import Recomment


class RecommentSerializer(ModelSerializer):
    class Meta:
        model = Recomment
        fields = "__all__"
