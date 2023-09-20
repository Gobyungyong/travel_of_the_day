from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ParseError, NotFound, PermissionDenied
from django.db.models import Q
from django.core.paginator import Paginator

from .models import Board
from .serializers import BoardSerializer, BoardInfoSerializer
from comments.models import Comment


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
        page = int(request.query_params.get("page", 1))
        boards = Board.objects.all().order_by("-created_at")
        paginator = Paginator(boards, 9)
        paginated_boards = paginator.get_page(page)
        total_pages = paginator.num_pages

        return Response(
            {
                "boards": BoardInfoSerializer(
                    paginated_boards, context={"request": request}, many=True
                ).data,
                "total_pages": total_pages,
            },
            status=status.HTTP_200_OK,
        )


class MyBoards(APIView):
    def get(self, request):
        page = int(request.query_params.get("page", 1))
        boards = Board.objects.filter(writer=request.user).order_by("-created_at")
        paginator = Paginator(boards, 9)
        paginated_boards = paginator.get_page(page)
        total_pages = paginator.num_pages

        return Response(
            {
                "boards": BoardSerializer(
                    boards, context={"request": request}, many=True
                ).data,
                "total_pages": total_pages,
            },
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
    def get_filtered_boards(self, kw):
        comments = Comment.objects.filter(recomment__content__icontains=kw)
        return Board.objects.filter(comment__in=comments)

    def get(self, request):
        keyword = request.query_params.get("keyword")
        category = request.query_params.get("category")

        if category == "board":
            search_result = Board.objects.filter(
                Q(subject__icontains=keyword) | Q(content__icontains=keyword)
            ).distinct()

        if category == "comment":
            boards = Board.objects.filter(comment__content__icontains=keyword)
            boards_filtered_by_recomments = self.get_filtered_boards(keyword)

            search_result = boards.union(boards_filtered_by_recomments)

        if category == "boardcomment":
            boards = Board.objects.filter(
                Q(subject__icontains=keyword)
                | Q(content__icontains=keyword)
                | Q(comment__content__icontains=keyword)
            ).distinct()
            boards_filtered_by_recomments = self.get_filtered_boards(keyword)
            search_result = boards.union(boards_filtered_by_recomments)

        if category == "writer":
            search_result = Board.objects.filter(
                writer__username__icontains=keyword
            ).distinct()

        if category == "all":
            boards = Board.objects.filter(
                Q(subject__icontains=keyword)
                | Q(content__icontains=keyword)
                | Q(comment__content__icontains=keyword)
                | Q(writer__username__icontains=keyword)
            ).distinct()
            boards_filtered_by_recomments = self.get_filtered_boards(keyword)
            search_result = boards.union(boards_filtered_by_recomments)

        if not search_result.exists():
            raise NotFound("해당하는 게시글이 없습니다.")

        page = int(request.query_params.get("page", 1))
        paginator = Paginator(search_result, 9)
        paginated_boards = paginator.get_page(page)
        total_pages = paginator.num_pages

        return Response(
            {
                "boards": BoardInfoSerializer(
                    paginated_boards, context={"request": request}, many=True
                ).data,
                "total_pages": total_pages,
            },
            status=status.HTTP_200_OK,
        )
