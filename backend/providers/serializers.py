from rest_framework import serializers
from accounts.models import User

class ProviderRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer to register a healthcare provider via API.
    A user created here will automatically get the 'PROVIDER' user_type.
    """
    password = serializers.CharField(
        write_only=True, 
        min_length=8,
        help_text='At least 8 characters. Will be securely hashed.',
    )

    class Meta:
        model = User
        fields = [
            'email',
            'password',
            'first_name',
            'last_name',
            'phone_number',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        # Here we hardcode the user_type to PROVIDER so it matches the check
        # in the records app: if request.user.user_type != 'PROVIDER':
        user = User(**validated_data)
        user.user_type = User.PROVIDER
        user.email_verified = True # Skip email verification for mock/dev provider setup for now
        user.set_password(password)
        user.save()

        return user
