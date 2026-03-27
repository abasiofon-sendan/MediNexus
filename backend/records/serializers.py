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
    
    # We will accept an email address rather than a raw UUID
    patient_email = serializers.EmailField(write_only=True)
    
    class Meta:
        model = HealthRecord
        fields = [
            'patient_email',
            'record_type',
            'title',
            'description',
        ]
        
    def validate_patient_email(self, value):
        from accounts.models import User
        try:
            # Find the patient by email
            user = User.objects.get(email=value.lower(), user_type='PATIENT')
            return user
        except User.DoesNotExist:
            raise serializers.ValidationError("No patient found with this email.")

    def create(self, validated_data):
        # The validated patient_email is now actually the User object!
        patient = validated_data.pop('patient_email')
        
        # Doctor is set from the request user 
        validated_data['doctor'] = self.context['request'].user
        validated_data['patient'] = patient
        
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
