from rest_framework import serializers
from .models import HealthRecord
from accounts.models import User


class HealthRecordSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    patient_email = serializers.CharField(source='patient.email', read_only=True)

    class Meta:
        model = HealthRecord
        fields = [
            'id',
            'doctor',
            'doctor_name',
            'patient',
            'patient_name',
            'patient_email',
            'record_type',
            'title',
            'description',
            'is_approved',
            'approval_timestamp',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'is_approved',
            'approval_timestamp',
            'created_at',
            'updated_at',
        ]

    def get_doctor_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}"

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"


class HealthRecordCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new health records"""
    
    class Meta:
        model = HealthRecord
        fields = [
            'patient',
            'record_type',
            'title',
            'description',
        ]

    def create(self, validated_data):
        # Doctor is set from the request user
        validated_data['doctor'] = self.context['request'].user
        return super().create(validated_data)


class HealthRecordApproveSerializer(serializers.Serializer):
    """Serializer for approving a health record with OTP"""
    otp_code = serializers.CharField(max_length=6, min_length=6)


class PendingRecordsSerializer(serializers.ModelSerializer):
    """Serializer for listing pending records awaiting patient approval"""
    doctor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = HealthRecord
        fields = [
            'id',
            'doctor',
            'doctor_name',
            'record_type',
            'title',
            'description',
            'is_approved',
            'created_at',
        ]
        read_only_fields = fields

    def get_doctor_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}"
