"""
worknest_backend URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework import routers

from api.views import (
    UserViewSet,
    TaskViewSet,
    AnnouncementViewSet,
    MessageViewSet,
    CareerRecommendationView,
    LoginView,
    LogoutView,
)

# Router for API viewsets
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'announcements', AnnouncementViewSet)
router.register(r'messages', MessageViewSet)

# Simple home view
def home(request):
    return HttpResponse("WorkNest Backend is Running Successfully")

urlpatterns = [
    path('', home, name='home'),  # Root URL
    path('admin/', admin.site.urls),

    # API routes
    path('api/', include(router.urls)),

    # Authentication
    path('api/auth/login/', LoginView.as_view(), name='api-login'),
    path('api/auth/logout/', LogoutView.as_view(), name='api-logout'),

    # AI recommendation
    path('api/ai/recommend-career/', CareerRecommendationView.as_view(), name='ai-career'),

    # DRF login
    path('api-auth/', include('rest_framework.urls')),
]