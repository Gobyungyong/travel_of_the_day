from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ParseError, NotFound, PermissionDenied

from boards.models import Board
from .models import Recomment
from .serializers import RecommentSerializer


class NewRecomment(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RecommentSerializer(data=request.data)

        if serializer.is_valid():
            new_recomment = serializer.save(writer=request.user)
            return Response(
                RecommentSerializer(new_recomment).data, status=status.HTTP_201_CREATED
            )

        raise ParseError("Data validation 실패")


class DeleteRecomment(APIView):
    def delete(self, request, recomment_id):
        recomment = Recomment.objects.get(id=recomment_id)

        if recomment.writer != request.user and not request.user.is_staff:
            raise PermissionDenied("삭제권한이 없습니다.")

        recomment.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
