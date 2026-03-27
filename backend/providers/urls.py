from django.urls import path
from .views import ProviderRegisterView

urlpatterns = [
    path('register/', ProviderRegisterView.as_view(), name='provider-register'),
]