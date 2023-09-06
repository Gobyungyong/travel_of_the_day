from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ParseError, NotFound, PermissionDenied

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


class AllBoards(APIView):
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

    def put(self, request, board_id):
        board = self.get_board(board_id)

        if board.writer != request.user and not request.user.is_staff:
            raise PermissionDenied("수정권한이 없습니다.")

        serializer = BoardSerializer(board, data=request.data, partial=True)

        if serializer.is_valid():
            updated_board = serializer.save()
            return Response(
                BoardSerializer(updated_board).data, status=status.HTTP_200_OK
            )

        raise ParseError("Data validation 실패")

    def delete(self, request):
        pass
