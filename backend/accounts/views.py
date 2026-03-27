import logging
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import (
    extend_schema,
    OpenApiExample,
    OpenApiResponse,
)

from .models import User
from .serializers import (
    PatientRegisterSerializer,
    LoginSerializer,
    OTPSendSerializer,
    OTPVerifySerializer,
)
from .services import verify_nin, send_otp_email, verify_otp_email, get_nin_full_details, get_interswitch_token

logger = logging.getLogger(__name__)


def jwt_tokens_for_user(user):
    """Generate JWT access and refresh tokens for a given user."""
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


class PatientRegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Register a new patient',
        description=(
            'Creates a new patient account. The NIN should have been previously verified '
            'using the separate NIN verification endpoint.\n\n'
            'On success, a **verification OTP is sent** to the registered email '
            'address (valid 10 min). User must verify email to receive JWT tokens.'
        ),
        request=PatientRegisterSerializer,
        responses={
            201: OpenApiResponse(
                description='Registration successful — OTP sent, please verify email',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'message': 'Registration successful. Please check your email for the verification code.',
                            'email': 'user@example.com',
                            'nin_verified': True,
                        },
                    )
                ],
            ),
            400: OpenApiResponse(description='Validation error'),
            502: OpenApiResponse(description='Email delivery failed - registration rolled back'),
        },
    )
    def post(self, request):
        logger.info('Patient registration attempt from IP: %s', request.META.get('REMOTE_ADDR'))
        serializer = PatientRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning('Patient registration validation failed: %s', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data.get('email')
        nin = serializer.validated_data.get('nin')
        logger.info('Registering patient with NIN: %s (email: %s)', nin, email)

        try:
            with transaction.atomic():
                user = serializer.save()
                user.nin_verified = True  # NIN already verified via separate endpoint
                user.save(update_fields=['nin_verified'])
                logger.info('New patient account created: %s (id=%s)', user.email, user.id)

                logger.info('Sending verification OTP to: %s', user.email)
                otp_result = send_otp_email(user.email)
                
                if not otp_result['sent']:
                    error_msg = otp_result.get('error', 'Failed to send verification email')
                    logger.error('OTP email failed for %s: %s', user.email, error_msg)
                    # Raise exception to trigger transaction rollback
                    raise Exception(f'Email delivery failed: {error_msg}')
                
                logger.info('OTP email successfully sent to: %s', user.email)

        except Exception as exc:
            logger.error('Registration failed for %s: %s', email, str(exc))
            return Response(
                {
                    'error': 'Registration failed. Unable to send verification email. Please try again later.',
                    'details': str(exc)
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                'message': 'Registration successful. Please check your email for the verification code.',
                'email': user.email,
                'nin_verified': True,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Log in with email and password',
        description='Authenticates a user and returns JWT access and refresh tokens.',
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(
                description='Login successful',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'access': '<jwt-access-token>',
                            'refresh': '<jwt-refresh-token>',
                            'user_type': 'PATIENT',
                            'email': 'patient@example.com',
                        },
                    )
                ],
            ),
            400: OpenApiResponse(description='Invalid credentials'),
        },
    )
    def post(self, request):
        logger.info('Login attempt for email: %s', request.data.get('email', ''))

        serializer = LoginSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            logger.warning('Login failed for email: %s', request.data.get('email', ''))
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data['user']
        logger.info('Login successful for user: %s (type=%s)', user.email, user.user_type)
        tokens = jwt_tokens_for_user(user)
        return Response(
            {
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'user_type': user.user_type,
                'email': user.email,
                'email_verified': user.email_verified,
            },
            status=status.HTTP_200_OK,
        )


class OTPSendView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Resend OTP to email',
        description=(
            'Manually resends a 6-digit OTP to the given email. '
            'Use this if the original OTP (auto-sent on registration) '
            'has expired or was not received. Valid for **10 minutes**.'
        ),
        request=OTPSendSerializer,
        responses={
            200: OpenApiResponse(
                description='OTP sent successfully',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'message': 'A 6-digit OTP has been sent to user@example.com. It expires in 10 minutes.'
                        },
                    )
                ],
            ),
            400: OpenApiResponse(description='Invalid email'),
            502: OpenApiResponse(description='SMTP delivery failure'),
        },
    )
    def post(self, request):
        serializer = OTPSendSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning('OTP send request failed validation: %s', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        logger.info('Manual OTP resend requested for: %s', email)
        result = send_otp_email(email)

        if not result['sent']:
            logger.error('OTP send failed for %s: %s', email, result.get('error'))
            return Response(
                {'error': result.get('error', 'Failed to send OTP email')},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        logger.info('OTP successfully sent to: %s', email)
        return Response(
            {'message': f'A 6-digit OTP has been sent to {email}. It expires in 10 minutes.'},
            status=status.HTTP_200_OK,
        )


class OTPVerifyView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Verify OTP code and get JWT tokens',
        description=(
            'Verifies the 6-digit OTP sent to the user\'s email. '
            'Each OTP can only be used once and expires after 10 minutes. '
            'On success, the user\'s `email_verified` flag is set to `true` '
            'and JWT access and refresh tokens are returned.'
        ),
        request=OTPVerifySerializer,
        responses={
            200: OpenApiResponse(
                description='OTP verified - JWT tokens issued',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'message': 'Email verified successfully',
                            'access': '<jwt-access-token>',
                            'refresh': '<jwt-refresh-token>',
                            'user_type': 'PATIENT',
                            'email': 'user@example.com',
                        }
                    )
                ],
            ),
            400: OpenApiResponse(description='Invalid, expired, or already-used OTP'),
        },
    )
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning('OTP verify request failed validation: %s', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']

        logger.info('OTP verification attempt for: %s', email)
        result = verify_otp_email(email, otp_code)
        if not result['verified']:
            logger.warning('OTP verification failed for %s: %s', email, result.get('error'))
            return Response(
                {'error': result.get('error', 'Invalid OTP')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email.lower())
            user.email_verified = True
            user.save(update_fields=['email_verified'])
            logger.info('Email verified for user: %s (id=%s)', user.email, user.id)
            
            tokens = jwt_tokens_for_user(user)
            logger.info('JWT tokens issued for verified user: %s', user.email)
            
            return Response(
                {
                    'message': 'Email verified successfully',
                    'access': tokens['access'],
                    'refresh': tokens['refresh'],
                    'user_type': user.user_type,
                    'email': user.email,
                },
                status=status.HTTP_200_OK,
            )
            
        except User.DoesNotExist:
            logger.error('OTP verified but no user found for email: %s', email)
            return Response(
                {'error': 'User account not found. Please register first.'},
                status=status.HTTP_404_NOT_FOUND,
            )


class InterswitchAuthView(APIView):
    """
    Endpoint to authenticate with Interswitch and retrieve an access token.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Authenticate with Interswitch (get access token)',
        description='Fetches an OAuth2 access token from Interswitch to be used for subsequent API calls like NIN verification.',
        responses={
            200: OpenApiResponse(
                description='Token retrieved successfully',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'success': True,
                            'access_token': 'eyJh...'
                        },
                    )
                ],
            ),
            500: OpenApiResponse(description='Interswitch API service error'),
        },
    )
    def post(self, request):
        try:
            logger.info('Requesting Interswitch access token...')
            access_token = get_interswitch_token()
            return Response({'success': True, 'access_token': access_token}, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.error('Error fetching Interswitch access token: %s', exc)
            return Response(
                {'success': False, 'error': f'Failed to fetch token: {str(exc)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetNINFullDetailsView(APIView):
    """
    Endpoint to fetch full NIN details from Interswitch Identity API.
    Requires an access token provided by the frontend.
    """
    permission_classes = [AllowAny]
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Get full NIN details (auto-complete for registration)',
        description=(
            'Retrieves complete identity information for a given NIN from the '
            'Interswitch Identity API.\n\n'
            'Requires the frontend to provide both the `nin` and the `access_token` '
            'obtained from the `/api/accounts/interswitch/auth/` endpoint.\n\n'
            '**Mock mode** (default during development): use any of these test NIPs:\n'
            '- `12345678901` (Test User, DOB: 1990-01-01)\n'
            '- `10000000001` (John Doe, DOB: 1985-06-15)\n'
            '- `10000000002` (Jane Doe, DOB: 1992-03-22)'
        ),
        request={'application/json': {'type': 'object', 'properties': {'nin': {'type': 'string', 'description': '11-digit NIN'}, 'access_token': {'type': 'string', 'description': 'Interswitch Access Token'}}}},
        responses={
            200: OpenApiResponse(
                description='NIN details retrieved successfully',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'success': True,
                            'data': {
                                'firstName': 'John',
                                'lastName': 'Doe',
                                'dateOfBirth': '1985-06-15',
                                'gender': 'M',
                                'phoneNumber': '08012345678',
                            },
                        },
                    )
                ],
            ),
            400: OpenApiResponse(
                description='Invalid NIN format or missing token or NIN not found',
                examples=[
                    OpenApiExample(
                        'Invalid NIN',
                        value={
                            'success': False,
                            'error': 'NIN not found in database',
                        },
                    )
                ],
            ),
            500: OpenApiResponse(description='Interswitch API service error'),
        },
    )
    def post(self, request):
        """Fetch full NIN details - authentication handled by frontend."""
        nin = request.data.get('nin', '').strip()
        access_token = request.data.get('access_token', '').strip()
        
        if not nin:
            logger.warning('NIN details request with missing NIN')
            return Response(
                {'success': False, 'error': 'NIN is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        if not access_token:
            logger.warning('NIN details request with missing access token')
            return Response(
                {'success': False, 'error': 'access_token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            logger.info('Fetching NIN details for NIN: %s using provided access token', nin)
            
            # Get full NIN details using the provided token
            result = get_nin_full_details(nin, access_token)
            
            if not result['success']:
                logger.warning('Failed to fetch NIN details for NIN %s: %s', nin, result.get('error'))
                return Response(
                    result,
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            logger.info('Successfully fetched NIN details for NIN: %s', nin)
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as exc:  # noqa: BLE001
            logger.error('Error fetching NIN details: %s', exc)
            return Response(
                {'success': False, 'error': f'Failed to fetch NIN details: {str(exc)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
