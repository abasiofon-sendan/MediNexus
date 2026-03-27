import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse

from .serializers import ProviderRegisterSerializer

logger = logging.getLogger(__name__)

class ProviderRegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Providers'],
        summary='Register a new generic healthcare Provider/Doctor',
        description=(
            'Creates a mock Doctor/Provider account immediately.\n'
            'The created account gets the user_type="PROVIDER"\n'
            'This allows them to use the /api/records endpoints immediately to create records.\n\n'
            '**Required Fields**:\n'
            '- `email`: Unique email address.\n'
            '- `password`: Secure password (min 8 chars).\n'
            '- `first_name`: Provider\'s first name.\n'
            '- `last_name`: Provider\'s last name.\n'
            '- `phone_number`: Unique contact phone number.'
        ),
        request=ProviderRegisterSerializer,
        responses={
            201: OpenApiResponse(
                description='Provider registration successful',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'message': 'Provider registration successful. You can now login.',
                            'email': 'doctor@example.com',
                            'user_type': 'PROVIDER'
                        }
                    )
                ]
            ),
            400: OpenApiResponse(description='Validation error (e.g. email already exists)'),
        },
    )
    def post(self, request):
        logger.info('Provider registration attempt')
        serializer = ProviderRegisterSerializer(data=request.data)
        
        if not serializer.is_valid():
            logger.warning('Provider registration validation failed: %s', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        logger.info('New provider account created: %s (id=%s)', user.email, user.id)

        return Response(
            {
                'message': 'Provider registration successful. You can now login.',
                'email': user.email,
                'user_type': user.user_type
            },
            status=status.HTTP_201_CREATED,
        )
