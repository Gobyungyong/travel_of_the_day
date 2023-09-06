from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ParseError, NotFound, PermissionDenied

from boards.models import Board
from .models import Comment
from .serializers import CommentSerializer


class NewComment(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CommentSerializer(data=request.data)

        if serializer.is_valid():
            new_comment = serializer.save(writer=request.user)
            return Response(
                CommentSerializer(new_comment).data, status=status.HTTP_201_CREATED
            )

        raise ParseError("Data validation 실패")


class AllComments(APIView):
    def get(self, request, board_id):
        board = Board.objects.get(id=board_id)

        comments = CommentSerializer(board.comment, many=True)

        return Response(comments.data, status=status.HTTP_200_OK)
