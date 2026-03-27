import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from accounts.permissions import IsAdmin
from drf_spectacular.utils import (
    extend_schema,
    OpenApiExample,
    OpenApiResponse,
    OpenApiParameter,
)

from .models import Hospital, DoctorProfile
from .serializers import (
    HospitalSerializer,
    HospitalListSerializer,
    DoctorRegisterSerializer,
    DoctorProfileSerializer,
)

logger = logging.getLogger(__name__)


class HospitalRegisterView(APIView):
    """Register a new hospital (admin action)."""

    permission_classes = [IsAdmin]

    @extend_schema(
        tags=['Hospitals'],
        summary='Register a new hospital',
        description=(
            'Creates a new hospital record. `hospital_code` must be unique '
            'across the platform. In production this endpoint should be '
            'restricted to admin users.'
        ),
        request=HospitalSerializer,
        responses={
            201: OpenApiResponse(
                response=HospitalSerializer,
                description='Hospital registered successfully',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'id': '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                            'name': 'Lagos General Hospital',
                            'hospital_code': 'LGH001',
                            'address': '1 Marina Road, Lagos',
                            'contact_phone': '0801234567',
                            'email': 'admin@lgh.ng',
                            'is_active': True,
                            'created_at': '2026-02-24T12:00:00Z',
                        },
                    )
                ],
            ),
            400: OpenApiResponse(description='Validation error'),
        },
    )
    def post(self, request):
        logger.info('Hospital registration request from IP: %s', request.META.get('REMOTE_ADDR'))
        serializer = HospitalSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning('Hospital registration validation failed: %s', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        hospital = serializer.save()
        logger.info('Hospital registered: %s (code=%s, id=%s)', hospital.name, hospital.hospital_code, hospital.id)
        return Response(HospitalSerializer(hospital).data, status=status.HTTP_201_CREATED)


class HospitalListView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Hospitals'],
        summary='List all active hospitals',
        description='Returns a list of all active hospitals with doctor counts.',
        responses={
            200: OpenApiResponse(
                response=HospitalListSerializer(many=True),
                description='List of hospitals',
            ),
        },
    )
    def get(self, request):
        hospitals = Hospital.objects.filter(is_active=True)
        logger.info('Hospital list fetched — %d active hospitals returned', hospitals.count())
        serializer = HospitalListSerializer(hospitals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class HospitalDetailView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Hospitals'],
        summary='Get hospital details',
        description='Returns full details for a single hospital.',
        responses={
            200: HospitalSerializer,
            404: OpenApiResponse(description='Hospital not found'),
        },
    )
    def get(self, request, pk):
        logger.info('Hospital detail requested for id: %s', pk)
        try:
            hospital = Hospital.objects.get(pk=pk)
        except Hospital.DoesNotExist:
            logger.warning('Hospital not found for id: %s', pk)
            return Response({'error': 'Hospital not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(HospitalSerializer(hospital).data, status=status.HTTP_200_OK)


class DoctorRegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Doctors'],
        summary='Register a new doctor',
        description=(
            'Creates a new doctor account (user_type = PROVIDER) and links it '
            'to an existing hospital. The `license_number` must be unique. '
            'On success the doctor profile is returned.'
        ),
        request=DoctorRegisterSerializer,
        responses={
            201: OpenApiResponse(
                response=DoctorProfileSerializer,
                description='Doctor registered successfully',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'id': '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                            'full_name': 'Dr. Emeka Obi',
                            'email': 'emeka.obi@lgh.ng',
                            'hospital': {
                                'id': '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                                'name': 'Lagos General Hospital',
                                'hospital_code': 'LGH001',
                            },
                            'license_number': 'MDCN-12345',
                            'specialty': 'CARDIOLOGY',
                            'is_verified': False,
                            'created_at': '2026-02-24T14:00:00Z',
                        },
                    )
                ],
            ),
            400: OpenApiResponse(description='Validation error'),
        },
    )
    def post(self, request):
        logger.info('Doctor registration request from IP: %s', request.META.get('REMOTE_ADDR'))
        serializer = DoctorRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning('Doctor registration validation failed: %s', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        logger.info(
            'Doctor account created: %s (id=%s, hospital=%s)',
            user.email, user.id, user.doctor_profile.hospital,
        )
        profile_serializer = DoctorProfileSerializer(user.doctor_profile)
        return Response(profile_serializer.data, status=status.HTTP_201_CREATED)


class DoctorListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Doctors'],
        summary='List doctors',
        description='Returns doctors. Use `?hospital_id=<uuid>` to filter by hospital.',
        parameters=[
            OpenApiParameter(
                name='hospital_id',
                description='Filter doctors by hospital UUID',
                required=False,
                type=str,
            )
        ],
        responses={200: DoctorProfileSerializer(many=True)},
    )
    def get(self, request):
        qs = DoctorProfile.objects.select_related('user', 'hospital').all()
        hospital_id = request.query_params.get('hospital_id')
        if hospital_id:
            logger.info('Doctors list filtered by hospital_id: %s', hospital_id)
            qs = qs.filter(hospital_id=hospital_id)
        else:
            logger.info('Doctors list fetched by user: %s', request.user.email)
        serializer = DoctorProfileSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DoctorDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Doctors'],
        summary='Get doctor details',
        responses={
            200: DoctorProfileSerializer,
            404: OpenApiResponse(description='Doctor not found'),
        },
    )
    def get(self, request, pk):
        logger.info('Doctor detail requested for id: %s by user: %s', pk, request.user.email)
        try:
            profile = DoctorProfile.objects.select_related('user', 'hospital').get(pk=pk)
        except DoctorProfile.DoesNotExist:
            logger.warning('Doctor not found for id: %s', pk)
            return Response({'error': 'Doctor not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(DoctorProfileSerializer(profile).data, status=status.HTTP_200_OK)
