from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ParseError, NotFound, PermissionDenied
from django.db.models import Q

from .models import Board
from .serializers import BoardSerializer, BoardInfoSerializer


class NewBoard(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BoardSerializer(data=request.data)

        if serializer.is_valid():
            new_board = serializer.save(writer=request.user)
            return Response(
                BoardInfoSerializer(new_board, context={"request": request}).data,
                status=status.HTTP_201_CREATED,
            )
        raise ParseError(serializer.errors)


class AllBoards(APIView):
    def get(self, request):
        boards = Board.objects.all()

        return Response(
            BoardInfoSerializer(boards, context={"request": request}, many=True).data,
            status=status.HTTP_200_OK,
        )


class BoardDetail(APIView):
    def get_board(self, board_id):
        try:
            return Board.objects.get(id=board_id)
        except:
            raise NotFound("존재하지 않는 게시글입니다.")

    def get(self, request, board_id):
        board = self.get_board(board_id)

        return Response(
            BoardInfoSerializer(
                board,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, board_id):
        board = self.get_board(board_id)

        if board.writer != request.user and not request.user.is_staff:
            raise PermissionDenied("수정권한이 없습니다.")

        serializer = BoardSerializer(board, data=request.data, partial=True)

        if serializer.is_valid():
            updated_board = serializer.save()
            return Response(
                BoardInfoSerializer(updated_board, context={"request": request}).data,
                status=status.HTTP_200_OK,
            )

        raise ParseError(serializer.errors)

    def delete(self, request, board_id):
        board = self.get_board(board_id)

        if board.writer != request.user and not request.user.is_staff:
            raise PermissionDenied("삭제권한이 없습니다.")

        board.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class SearchBoard(APIView):
    def get(self, request):
        keyword = request.query_params.get("kw")
        category = request.query_params.get("category")

        if category == "board":
            search_result = Board.objects.filter(
                Q(subject__icontains=keyword) | Q(content__icontains=keyword)
            ).distinct()

        if category == "comment":
            search_result = Board.objects.filter(
                Q(comment_set__content__icontains=keyword)
                | Q(comment_set__recomment_set__content__icontains=keyword)
            )

        if category == "boardcomment":
            search_result = Board.objects.filter(
                Q(subject__icontains=keyword)
                | Q(content__icontains=keyword)
                | Q(comment_set__content__icontains=keyword)
                | Q(comment_set__recomment_set__content__icontains=keyword)
            )

        if category == "writer":
            search_result = Board.objects.filter(writer__icontains=keyword)

        if category == "all":
            search_result = Board.objects.filter(
                Q(subject__icontains=keyword)
                | Q(content__icontains=keyword)
                | Q(comment_set__content__icontains=keyword)
                | Q(comment_set__recomment_set__content__icontains=keyword)
                | Q(writer__icontains=keyword)
            )

        if not search_result.exists():
            raise NotFound("해당하는 게시글이 없습니다.")

        return Response(
            BoardInfoSerializer(
                search_result, many=True, context={"request": request}
            ).data,
            status=status.HTTP_200_OK,
        )
