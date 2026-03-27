from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import AuditLog
from .serializers import AuditLogSerializer
from drf_spectacular.utils import extend_schema, OpenApiResponse


class MyAuditLogsView(APIView):
    """
    API endpoint to get the current user's audit logs
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Audit'],
        summary='Get my audit logs',
        description='Returns audit logs for the authenticated user, including actions they performed and actions on their records.',
        responses={
            200: AuditLogSerializer(many=True),
            401: OpenApiResponse(description='Authentication required'),
        }
    )
    def get(self, request):
        user = request.user
        
        # Get logs where the user performed an action OR
        # the user is the patient of a record that was accessed
        # This includes viewing, approving, creating records
        
        # First, get all logs where this user is the actor
        actor_logs = AuditLog.objects.filter(user=user).select_related('user', 'content_type')
        
        # Also get logs for records belonging to this user (if patient)
        from records.models import HealthRecord
        patient_records = HealthRecord.objects.filter(patient=user).values_list('id', flat=True)
        record_logs = AuditLog.objects.filter(
            object_id__in=patient_records
        ).select_related('user', 'content_type')
        
        # Combine and deduplicate
        all_logs = (actor_logs | record_logs).distinct().order_by('-timestamp')
        
        serializer = AuditLogSerializer(all_logs, many=True)
        return Response(serializer.data)
