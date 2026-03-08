from django.db.models import Q
from django.contrib.auth import authenticate
from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from .models import User, Task, Announcement, Message
from .serializers import (
    UserSerializer,
    TaskSerializer,
    AnnouncementSerializer,
    MessageSerializer,
    CareerInputSerializer,
    CareerSerializer,
)
from .services.ai_engine import compute_career_matches, format_career_response


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        For now, return all tasks so records created in the
        Django admin are visible in the frontend.
        """
        return Task.objects.all().order_by("-created_at")


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all().order_by("-created_at")
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    queryset = Message.objects.all()

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).order_by("-timestamp")

    def perform_create(self, serializer):
        # Ensure sender is always the authenticated user
        serializer.save(sender=self.request.user)


class CareerRecommendationView(APIView):
    """
    AI-powered (simulated) career path recommendation.
    This is a simple rules-based placeholder that can be
    swapped for a real ML model later.
    """

    permission_classes = [IsAuthenticated]

class CareerRecommendationView(APIView):
    """
    AI-powered (simulated) career path recommendation.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CareerInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        matches = compute_career_matches(
            skills=data["skills"],
            interests=data["interests"],
        )

        formatted = format_career_response(matches, limit=3)

        if not formatted:
            return Response(
                {"error": "No career matches found."},
                status=status.HTTP_200_OK,
            )

        top = formatted[0]

        return Response(
            {
                "recommended_career_path": top["title"],
                "confidence_score": top["match_score"] / 100,
                "skill_gap_analysis": top["missing_skills"],
                "suggested_courses": top["learning_path"],
                "industry": top["industry"],
                "market_insight": top["market_insight"],
                "all_matches": formatted,
            },
            status=status.HTTP_200_OK,
        )




class LoginView(APIView):
    """
    Token-based login endpoint at /api/auth/login/
    """

    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)
        if not user:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user).data
        return Response(
            {"token": token.key, "user": user_data},
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    Simple logout that deletes the user's token.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)