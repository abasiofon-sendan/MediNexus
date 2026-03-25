from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, PatientProfile


class PatientRegisterSerializer(serializers.ModelSerializer):
    """Serializer for patient self-registration."""

    password = serializers.CharField(write_only=True, min_length=8)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    blood_group = serializers.ChoiceField(
        choices=PatientProfile.BLOOD_GROUP_CHOICES, required=False, default='UNKNOWN'
    )
    genotype = serializers.ChoiceField(
        choices=PatientProfile.GENOTYPE_CHOICES, required=False, default='UNKNOWN'
    )
    allergies = serializers.CharField(required=False, default='', allow_blank=True)
    emergency_contact = serializers.CharField(required=False, default='', allow_blank=True)

    class Meta:
        model = User
        fields = [
            'email',
            'password',
            'first_name',
            'last_name',
            'phone_number',
            'nin',
            # optional patient profile fields
            'date_of_birth',
            'blood_group',
            'genotype',
            'allergies',
            'emergency_contact',
        ]

    def validate_nin(self, value):
        if not value.isdigit():
            raise serializers.ValidationError('NIN must contain only digits.')
        if len(value) != 11:
            raise serializers.ValidationError('NIN must be exactly 11 digits.')
        return value

    def validate_phone_number(self, value):
        # Accept formats: 08012345678, +2348012345678, 2348012345678
        digits = value.lstrip('+')
        if not digits.isdigit():
            raise serializers.ValidationError(
                'Phone number must contain only digits (and optional leading +).'
            )
        return value

    def create(self, validated_data):
        # Pull out patient-profile-specific fields
        profile_fields = {
            'date_of_birth': validated_data.pop('date_of_birth', None),
            'blood_group': validated_data.pop('blood_group', 'UNKNOWN'),
            'genotype': validated_data.pop('genotype', 'UNKNOWN'),
            'allergies': validated_data.pop('allergies', ''),
            'emergency_contact': validated_data.pop('emergency_contact', ''),
        }
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.user_type = User.PATIENT
        user.set_password(password)
        user.save()

        PatientProfile.objects.create(user=user, **profile_fields)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').lower()
        password = attrs.get('password', '')

        user = authenticate(request=self.context.get('request'), email=email, password=password)
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('This account has been deactivated.')

        attrs['user'] = user
        return attrs


class OTPSendSerializer(serializers.Serializer):
    email = serializers.EmailField()


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6, min_length=6)
