from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ParseError, NotFound, PermissionDenied
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User
from .serializers import SignUpUserSerializer, UserInfoSerializer


class Signup(APIView):
    def post(self, request):
        user = SignUpUserSerializer(data=request.data)

        if User.objects.filter(username=request.data["username"]).exists():
            raise ParseError("이미 존재하는 아이디입니다.")

        if user.is_valid():
            user = User.objects.create_user(
                username=request.data["username"],
                name=request.data["name"],
                password=request.data["password"],
                email=request.data["email"],
            )

            token = TokenObtainPairSerializer.get_token(user)
            refresh_token = str(token)
            access_token = str(token.access_token)

            # response = Response(
            #     {
            #         "user": SignUpUserSerializer(user).data,
            #         "access_token": access_token,
            #         "refresh_token": refresh_token,
            #     },
            #     status=status.HTTP_201_CREATED,
            # )

            # response.set_cookie("access_token", access_token, httponly=True)
            # response.set_cookie("refresh_token", refresh_token, httponly=True)

            return Response(
                {
                    "user": UserInfoSerializer(user).data,
                    "access": access_token,
                    "refresh": refresh_token,
                },
                status=status.HTTP_201_CREATED,
            )

        else:
            raise ParseError(user.errors)


class CheckUsername(APIView):
    def post(self, request):
        username = request.data["username"]
        if not username:
            raise ParseError("아이디 값이 없습니다.")
        if User.objects.filter(username=username).exists():
            return Response(
                {"errors": "이미 존재하는 아이디입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"message": "사용가능한 아이디입니다."}, status=status.HTTP_200_OK)


class UserInfo(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            raise NotFound("존재하지 않는 유저입니다.")

    def get(self, request):
        user = self.get_object(request.user)

        if user != request.user:
            raise PermissionDenied("타인 정보 조회는 불가합니다.")

        serializer = UserInfoSerializer(user)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        user = self.get_object(request.user)

        if user != request.user:
            raise PermissionDenied("비밀번호 변경 권한이 없습니다.")

        user.set_password(request.data["password"])
        updated_user = user.save()

        return Response(
            UserInfoSerializer(updated_user).data, status=status.HTTP_202_ACCEPTED
        )


class UserDelete(APIView):
    def get_object(self, username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            raise NotFound("존재하지 않는 유저입니다.")

    def post(self, request):
        user = self.get_object(request.user)

        if user != request.user:
            raise PermissionDenied("권한이 없습니다.")
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception as e:
            return Response(e, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = False
        user.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class Logout(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
