from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Hospital, DoctorProfile

User = get_user_model()


class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = [
            'id',
            'name',
            'hospital_code',
            'address',
            'contact_phone',
            'email',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['id', 'is_active', 'created_at']

    def validate_hospital_code(self, value):
        value = value.upper().strip()
        if Hospital.objects.filter(hospital_code=value).exists():
            raise serializers.ValidationError(
                'A hospital with this code already exists.'
            )
        return value


class HospitalListSerializer(serializers.ModelSerializer):
    doctor_count = serializers.SerializerMethodField()

    class Meta:
        model = Hospital
        fields = ['id', 'name', 'hospital_code', 'address', 'contact_phone', 'email', 'doctor_count']

    def get_doctor_count(self, obj):
        return obj.doctors.count()


class DoctorRegisterSerializer(serializers.Serializer):
    # User fields
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    phone_number = serializers.CharField(max_length=15)

    # Doctor-profile fields
    hospital_id = serializers.UUIDField()
    license_number = serializers.CharField(max_length=50)
    specialty = serializers.ChoiceField(choices=DoctorProfile.SPECIALTY_CHOICES)


    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_phone_number(self, value):
        digits = value.lstrip('+')
        if not digits.isdigit():
            raise serializers.ValidationError(
                'Phone number must contain only digits (and optional leading +).'
            )
        return value

    def validate_hospital_id(self, value):
        if not Hospital.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError('Hospital not found or is inactive.')
        return value

    def validate_license_number(self, value):
        value = value.upper().strip()
        if DoctorProfile.objects.filter(license_number=value).exists():
            raise serializers.ValidationError(
                'A doctor with this licence number is already registered.'
            )
        return value

    def create(self, validated_data):
        hospital = Hospital.objects.get(id=validated_data.pop('hospital_id'))
        license_number = validated_data.pop('license_number')
        specialty = validated_data.pop('specialty')

        password = validated_data.pop('password')
        user = User(**validated_data)
        user.user_type = User.PROVIDER
        user.set_password(password)
        user.save()

        DoctorProfile.objects.create(
            user=user,
            hospital=hospital,
            license_number=license_number,
            specialty=specialty,
        )
        return user


class DoctorProfileSerializer(serializers.ModelSerializer):
    hospital = HospitalListSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = DoctorProfile
        fields = [
            'id',
            'full_name',
            'email',
            'hospital',
            'license_number',
            'specialty',
            'is_verified',
            'created_at',
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name()
