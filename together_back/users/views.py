from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ParseError, NotFound, PermissionDenied
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User
from .serializers import SignUpUserSerializer, UserInfoSerializer


class CheckUsername(APIView):
    def post(self, request):
        username = request.data["username"]
        if not username:
            raise ParseError("아이디 값이 없습니다.")
        if User.objects.filter(username=username).exists():
            return Response(
                {"message": "이미 존재하는 아이디입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"message": "사용가능한 아이디입니다."}, status=status.HTTP_200_OK)


class CheckNickname(APIView):
    def post(self, request):
        nickname = request.data["nickname"]
        if not nickname:
            raise ParseError("닉네임 값이 없습니다.")
        if User.objects.filter(nickname=nickname).exists():
            return Response(
                {"message": "이미 존재하는 닉네임입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"message": "사용가능한 닉네임입니다."}, status=status.HTTP_200_OK)


class CheckEmail(APIView):
    def post(self, request):
        email = request.data["email"]
        if not email:
            raise ParseError("이메일 값이 없습니다.")
        if User.objects.filter(email=email).exists():
            return Response(
                {"message": "이미 존재하는 이메일입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"message": "사용가능한 이메일입니다."}, status=status.HTTP_200_OK)


# class Signup(APIView):
#     def post(self, request):
#         user = SignUpUserSerializer(data=request.data)

#         if User.objects.filter(username=request.data["username"]).exists():
#             raise ParseError("이미 존재하는 아이디입니다.")

#         if User.objects.filter(nickname=request.data["nickname"]).exists():
#             raise ParseError("이미 존재하는 닉네임입니다.")

#         if user.is_valid():
#             user = User.objects.create_user(
#                 username=request.data["username"],
#                 name=request.data["name"],
#                 password=request.data["password"],
#                 nickname=request.data["nickname"],
#                 avatar=request.data["avatar"],
#             )

#             token = TokenObtainPairSerializer.get_token(user)
#             refresh_token = str(token)
#             access_token = str(token.access_token)

#             # response = Response(
#             #     {
#             #         "user": SignUpUserSerializer(user).data,
#             #         "access_token": access_token,
#             #         "refresh_token": refresh_token,
#             #     },
#             #     status=status.HTTP_201_CREATED,
#             # )

#             # response.set_cookie("access_token", access_token, httponly=True)
#             # response.set_cookie("refresh_token", refresh_token, httponly=True)

#             return Response(
#                 {
#                     "user": UserInfoSerializer(user).data,
#                     "access": access_token,
#                     "refresh": refresh_token,
#                 },
#                 status=status.HTTP_201_CREATED,
#             )

#         else:
#             raise ParseError(user.errors)


# class UserInfo(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, username):
#         try:
#             return User.objects.get(username=username)
#         except User.DoesNotExist:
#             raise NotFound("존재하지 않는 유저입니다.")

#     def get(self, request):
#         user = self.get_object(request.user)

#         if user != request.user:
#             raise PermissionDenied("타인 정보 조회는 불가합니다.")

#         serializer = UserInfoSerializer(user)

#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def put(self, request):
#         user = self.get_object(request.user)

#         if user != request.user:
#             raise PermissionDenied("회원정보수정 권한이 없습니다.")

#         user.set_password(request.data["password"])
#         user.nickname = request.data["nickname"]
#         user.avatar = request.data["avatar"]
#         updated_user = user.save()

#         return Response(
#             UserInfoSerializer(updated_user).data, status=status.HTTP_202_ACCEPTED
#         )

#     def delete(self, request):
#         user = self.get_object(request.user)

#         if user != request.user:
#             raise PermissionDenied("권한이 없습니다.")

#         user.is_active = False
#         user.save()

#         return Response(status=status.HTTP_204_NO_CONTENT)


# class Logout(APIView):
#     def post(self, request):
#         try:
#             refresh_token = request.data["refresh"]
#             token = RefreshToken(refresh_token)
#             token.blacklist()
#             return Response(status=status.HTTP_205_RESET_CONTENT)
#         except Exception as e:
#             return Response(status=status.HTTP_400_BAD_REQUEST)
