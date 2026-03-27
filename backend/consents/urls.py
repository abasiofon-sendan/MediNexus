from django.urls import path
from .views import GrantConsentView, RevokeConsentView

urlpatterns = [
    path('grant/', GrantConsentView.as_view(), name='consent-grant'),
    path('revoke/', RevokeConsentView.as_view(), name='consent-revoke'),
]
