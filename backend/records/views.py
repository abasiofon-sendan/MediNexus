from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

from .models import HealthRecord
from .serializers import (
    HealthRecordSerializer,
    HealthRecordCreateSerializer,
    HealthRecordApproveSerializer,
    PendingRecordsSerializer
)
from accounts.models import User, OTPToken
from audit.models import AuditLog
from audit.serializers import AuditLogSerializer
from django.contrib.contenttypes.models import ContentType
import random
import string


def generate_otp():
    """Generate a random 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))


def send_otp_email(email, otp_code, patient_name, record_title):
    """Send OTP email to patient for record approval"""
    subject = f"Record Approval Required - {record_title}"
    context = {
        'patient_name': patient_name,
        'otp_code': otp_code,
        'record_title': record_title,
    }
    message = render_to_string('otp_email.html', context)
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        html_message=message,
        fail_silently=True,
    )


class HealthRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing health records
    - Doctors create records
    - Patients approve records via OTP
    """
    serializer_class = HealthRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'PROVIDER':
            # Doctors see records they created
            return HealthRecord.objects.filter(doctor=user)
        elif user.user_type == 'PATIENT':
            # Patients see records assigned to them
            return HealthRecord.objects.filter(patient=user)
        else:
            # Admins see all records
            return HealthRecord.objects.all()

    def retrieve(self, request, *args, **kwargs):
        """
        Override retrieve to log VIEW action when user accesses a record
        """
        response = super().retrieve(request, *args, **kwargs)
        record = self.get_object()

        # Log VIEW action
        AuditLog.objects.create(
            user=request.user,
            action='VIEW',
            content_type=ContentType.objects.get_for_model(HealthRecord),
            object_id=record.id,
            description=f"Record accessed by {request.user.user_type.lower()}",
        )

        return response

    def get_serializer_class(self):
        if self.action == 'create':
            return HealthRecordCreateSerializer
        elif self.action == 'approve':
            return HealthRecordApproveSerializer
        return self.serializer_class

    @action(detail=False, methods=['post'])
    def create_record(self, request):
        """
        POST /api/records/create/
        Doctors create a new health record for a patient
        """
        # Only providers can create records
        if request.user.user_type != 'PROVIDER':
            return Response(
                {'error': 'Only healthcare providers can create records'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        record = serializer.save()

        # Generate OTP for patient approval
        otp_code = generate_otp()
        otp_token = OTPToken.objects.create(
            email=record.patient.email,
            code=otp_code
        )

        # Send OTP to patient
        send_otp_email(
            record.patient.email,
            otp_code,
            record.patient.first_name,
            record.title
        )

        # Create audit log for record creation
        AuditLog.objects.create(
            user=request.user,
            action='CREATE',
            content_type=ContentType.objects.get_for_model(HealthRecord),
            object_id=record.id,
            description=f"Record created: {record.title}",
            metadata={
                'record_type': record.record_type,
                'patient_id': str(record.patient.id),
            }
        )

        # Create audit log for OTP sent
        AuditLog.objects.create(
            user=request.user,
            action='OTP_SENT',
            content_type=ContentType.objects.get_for_model(HealthRecord),
            object_id=record.id,
            description=f"OTP sent to {record.patient.email}",
        )

        return Response(
            {
                'message': 'Record created successfully. OTP sent to patient.',
                'record': HealthRecordSerializer(record).data,
                'otp_id': str(otp_token.id),
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        POST /api/records/<id>/approve/
        Patients approve a record by providing OTP
        """
        record = self.get_object()

        # Verify the user is the record's patient
        if request.user.id != record.patient.id:
            return Response(
                {'error': 'You can only approve records assigned to you'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if already approved
        if record.is_approved:
            return Response(
                {'error': 'Record is already approved'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate OTP
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp_code = serializer.validated_data['otp_code']

        # Find valid OTP
        try:
            otp_token = OTPToken.objects.get(
                email=request.user.email,
                code=otp_code,
                is_used=False
            )
            
            if not otp_token.is_valid():
                return Response(
                    {'error': 'OTP has expired'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except OTPToken.DoesNotExist:
            return Response(
                {'error': 'Invalid or expired OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark OTP as used
        otp_token.is_used = True
        otp_token.save()

        # Approve the record
        record.approve()

        # Create audit log for approval
        AuditLog.objects.create(
            user=request.user,
            action='APPROVE',
            content_type=ContentType.objects.get_for_model(HealthRecord),
            object_id=record.id,
            description=f"Record approved by patient",
            metadata={
                'used_otp_id': str(otp_token.id),
            }
        )

        # Create audit log for OTP verification
        AuditLog.objects.create(
            user=request.user,
            action='OTP_VERIFIED',
            content_type=ContentType.objects.get_for_model(HealthRecord),
            object_id=record.id,
            description=f"OTP verified for record approval",
        )

        return Response(
            {
                'message': 'Record approved successfully',
                'record': HealthRecordSerializer(record).data,
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        GET /api/records/pending/
        Patients see their pending records awaiting approval
        """
        if request.user.user_type != 'PATIENT':
            return Response(
                {'error': 'Only patients can view pending records'},
                status=status.HTTP_403_FORBIDDEN
            )

        pending_records = HealthRecord.objects.filter(
            patient=request.user,
            is_approved=False
        )
        
        serializer = PendingRecordsSerializer(pending_records, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def audit_trail(self, request, pk=None):
        """
        GET /api/records/<id>/audit-trail/
        Patients view the activity/audit trail for their records
        Shows: who created it, when approved, OTP verification, views, etc.
        """
        record = self.get_object()

        # Privacy: Only the record's patient can view the audit trail
        if request.user.id != record.patient.id:
            return Response(
                {'error': 'You can only view audit trail for your own records'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Log VIEW action - patient viewing their own record's audit trail
        AuditLog.objects.create(
            user=request.user,
            action='VIEW',
            content_type=ContentType.objects.get_for_model(HealthRecord),
            object_id=record.id,
            description=f"Patient viewed record audit trail",
        )

        # Get all audit logs for this record, ordered by timestamp (oldest first)
        audit_logs = AuditLog.objects.filter(
            content_type=ContentType.objects.get_for_model(HealthRecord),
            object_id=record.id
        ).order_by('timestamp')

        serializer = AuditLogSerializer(audit_logs, many=True)
        return Response({
            'record_id': record.id,
            'record_title': record.title,
            'audit_trail': serializer.data,
        })
