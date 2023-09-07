from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ParseError, NotFound, PermissionDenied
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .serializers import ConversationSerializer, MessageSerializer

from .models import Conversation, Message


class Conversations(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(name__contains=request.user)
        active_conversations = [
            conv for conv in conversations if conv.count_messages() > 0
        ]

        if len(active_conversations) == 0:
            raise NotFound("채팅방이 없습니다.")

        return Response(
            ConversationSerializer(
                active_conversations,
                context={"user": request.user, "request": request},
                many=True,
            ).data,
            status=status.HTTP_202_ACCEPTED,
        )


class SpecificConversation(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_name):
        try:
            print(conversation_name)
            conversation = Conversation.objects.get(name=conversation_name)
        except:
            raise NotFound("채팅방이 없습니다.")

        if not conversation.messages.all().exists():
            raise NotFound("채팅방이 없습니다.")

        return Response(
            ConversationSerializer(
                conversation,
                context={"user": request.user, "request": request},
            ).data,
            status=status.HTTP_202_ACCEPTED,
        )


class Messages(APIView):
    def get(self, request):
        conversation_name = request.query_params.get("conversation")
        page = int(request.query_params.get("page", 1))

        messages = Message.objects.filter(
            conversation__name=conversation_name
        ).order_by("-timestamp")[(page - 1) * 51 : page * 50]

        all_messages_count = (
            Message.objects.filter(conversation__name=conversation_name).all().count()
        )

        next = all_messages_count > (page * 50)

        return Response(
            {"messages": MessageSerializer(messages, many=True).data, "next": next},
            status=status.HTTP_202_ACCEPTED,
        )
