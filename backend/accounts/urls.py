from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    PatientRegisterView,
    LoginView,
    OTPSendView,
    OTPVerifyView,
    GetNINFullDetailsView,
    InterswitchAuthView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

urlpatterns = [
    path('patient/register/', PatientRegisterView.as_view(), name='patient-register'),
    path('login/', LoginView.as_view(), name='login'),
    path('otp/send/', OTPSendView.as_view(), name='otp-send'),
    path('otp/verify/', OTPVerifyView.as_view(), name='otp-verify'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('nin/interswitch/auth/', InterswitchAuthView.as_view(), name='interswitch-auth'),
    path('nin/full-details/', GetNINFullDetailsView.as_view(), name='get-nin-full-details'),
    path('password/reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
