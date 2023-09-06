from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ParseError, NotFound

from .models import Board
from .serializers import BoardSerializer


class NewBoard(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BoardSerializer(data=request.data)

        if serializer.is_valid():
            new_board = serializer.save(writer=request.user)
            return Response(
                BoardSerializer(new_board).data, status=status.HTTP_201_CREATED
            )

        raise ParseError("Data validation 실패")


class Boards(APIView):
    def get(self, request):
        boards = Board.objects.all()

        return Response(
            BoardSerializer(boards, many=True).data, status=status.HTTP_200_OK
        )


class BoardDetail(APIView):
    def get_board(self, board_id):
        try:
            return Board.objects.get(id=board_id)
        except:
            raise NotFound("존재하지 않는 게시글입니다.")

    def get(self, request, board_id):
        board = self.get_board(board_id)

        return Response(BoardSerializer(board).data, status=status.HTTP_200_OK)
