from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import ConsentLog


class GrantConsentSerializer(serializers.Serializer):
    hospital_id = serializers.UUIDField()
    doctor_id = serializers.UUIDField(required=False, allow_null=True)
    expires_in_hours = serializers.IntegerField(min_value=1, max_value=720)  # max 30 days


class ConsentLogSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    doctor_email = serializers.CharField(source='doctor.email', read_only=True, default=None)
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = ConsentLog
        fields = [
            'id',
            'hospital_name',
            'doctor_email',
            'granted_at',
            'expires_at',
            'is_revoked',
            'is_active',
        ]

    def get_is_active(self, obj):
        return obj.is_active()


class RevokeConsentSerializer(serializers.Serializer):
    consent_id = serializers.UUIDField()
