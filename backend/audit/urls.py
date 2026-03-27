from django.urls import path
from .views import MyLogsView

urlpatterns = [
    path('my-logs/', MyLogsView.as_view(), name='audit-my-logs'),
]
