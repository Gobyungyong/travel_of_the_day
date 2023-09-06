from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ParseError

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
