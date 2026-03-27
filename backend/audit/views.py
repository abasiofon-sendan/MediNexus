import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import AuditLog
from .serializers import AuditLogSerializer

logger = logging.getLogger(__name__)


class MyLogsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Audit'],
        summary='Get my audit logs',
        description=(
            'Returns all audit log entries where the authenticated user is either '
            'the actor or the subject patient. Ordered newest-first.'
        ),
        responses={
            200: OpenApiResponse(
                response=AuditLogSerializer(many=True),
                description='Audit log entries',
            )
        },
    )
    def get(self, request):
        user = request.user
        logs = AuditLog.objects.filter(
            **{}
        ).none()

        from django.db.models import Q
        logs = AuditLog.objects.filter(
            Q(actor=user) | Q(patient=user)
        ).select_related('actor', 'patient', 'record')

        logger.info('Audit logs fetched by user: %s (%d entries)', user.email, logs.count())
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
