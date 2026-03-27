import logging
from datetime import timedelta

from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample

from accounts.permissions import IsPatient
from providers.models import Hospital
from audit.utils import create_audit_log

from .models import ConsentLog
from .serializers import GrantConsentSerializer, RevokeConsentSerializer, ConsentLogSerializer

logger = logging.getLogger(__name__)


class GrantConsentView(APIView):
    permission_classes = [IsPatient]

    @extend_schema(
        tags=['Consents'],
        summary='Grant consent to a hospital',
        description=(
            'Creates a consent entry allowing a hospital (and optionally a specific doctor) '
            'to access the authenticated patient\'s approved health records. '
            'Consent expires after the specified number of hours.'
        ),
        request=GrantConsentSerializer,
        responses={
            201: OpenApiResponse(
                response=ConsentLogSerializer,
                description='Consent granted',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'id': '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                            'hospital_name': 'Lagos General Hospital',
                            'doctor_email': None,
                            'granted_at': '2026-02-25T12:00:00Z',
                            'expires_at': '2026-02-26T12:00:00Z',
                            'is_revoked': False,
                            'is_active': True,
                        },
                    )
                ],
            ),
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Hospital or doctor not found'),
        },
    )
    def post(self, request):
        serializer = GrantConsentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        patient = request.user

        # Validate hospital
        try:
            hospital = Hospital.objects.get(pk=data['hospital_id'], is_active=True)
        except Hospital.DoesNotExist:
            return Response({'error': 'Hospital not found or inactive.'}, status=status.HTTP_404_NOT_FOUND)

        # Validate doctor (optional)
        doctor = None
        if data.get('doctor_id'):
            from accounts.models import User
            try:
                doctor = User.objects.get(pk=data['doctor_id'], user_type='PROVIDER')
            except User.DoesNotExist:
                return Response({'error': 'Doctor not found.'}, status=status.HTTP_404_NOT_FOUND)

        expires_at = timezone.now() + timedelta(hours=data['expires_in_hours'])

        consent = ConsentLog.objects.create(
            patient=patient,
            hospital=hospital,
            doctor=doctor,
            expires_at=expires_at,
        )

        create_audit_log(
            action='CONSENT_GRANTED',
            actor=patient,
            description=f'{patient.email} granted consent to {hospital.name}',
            patient=patient,
        )

        logger.info('Consent granted: patient=%s hospital=%s expires=%s', patient.email, hospital.name, expires_at)
        return Response(ConsentLogSerializer(consent).data, status=status.HTTP_201_CREATED)


class RevokeConsentView(APIView):
    permission_classes = [IsPatient]

    @extend_schema(
        tags=['Consents'],
        summary='Revoke a consent',
        description='Marks a consent entry as revoked. The consent must belong to the authenticated patient.',
        request=RevokeConsentSerializer,
        responses={
            200: OpenApiResponse(description='Consent revoked'),
            400: OpenApiResponse(description='Validation error or already revoked'),
            404: OpenApiResponse(description='Consent not found'),
        },
    )
    def post(self, request):
        serializer = RevokeConsentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        patient = request.user
        consent_id = serializer.validated_data['consent_id']

        try:
            consent = ConsentLog.objects.get(pk=consent_id, patient=patient)
        except ConsentLog.DoesNotExist:
            return Response({'error': 'Consent not found.'}, status=status.HTTP_404_NOT_FOUND)

        if consent.is_revoked:
            return Response({'error': 'Consent is already revoked.'}, status=status.HTTP_400_BAD_REQUEST)

        consent.is_revoked = True
        consent.save(update_fields=['is_revoked'])

        create_audit_log(
            action='CONSENT_REVOKED',
            actor=patient,
            description=f'{patient.email} revoked consent to {consent.hospital.name}',
            patient=patient,
        )

        logger.info('Consent revoked: patient=%s consent_id=%s', patient.email, consent_id)
        return Response({'message': 'Consent revoked successfully.'}, status=status.HTTP_200_OK)
