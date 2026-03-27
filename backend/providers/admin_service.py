"""
Admin service layer for hospital and provider management.
Handles business logic for admin operations.
"""
import logging
from django.db import transaction
from django.db.models import Q, Count
from .models import Hospital, DoctorProfile
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)


class HospitalAdminService:
    """Service for admin hospital management operations."""

    @staticmethod
    @transaction.atomic
    def create_hospital(name, hospital_code, address, contact_phone, email=''):
        """
        Create a new hospital.
        
        Args:
            name: Hospital name
            hospital_code: Unique hospital code (uppercase)
            address: Hospital address
            contact_phone: Contact phone number
            email: Optional email address
            
        Returns:
            Hospital instance
            
        Raises:
            ValueError: If hospital_code already exists
        """
        hospital_code = hospital_code.upper().strip()
        
        if Hospital.objects.filter(hospital_code=hospital_code).exists():
            raise ValueError(f'Hospital with code {hospital_code} already exists.')
        
        hospital = Hospital.objects.create(
            name=name,
            hospital_code=hospital_code,
            address=address,
            contact_phone=contact_phone,
            email=email,
        )
        
        logger.info(f'Hospital created: {hospital.name} ({hospital.hospital_code})')
        return hospital

    @staticmethod
    @transaction.atomic
    def update_hospital(hospital_id, **kwargs):
        """
        Update hospital details.
        
        Args:
            hospital_id: UUID of the hospital
            **kwargs: Fields to update (name, address, contact_phone, email)
            
        Returns:
            Updated Hospital instance
            
        Raises:
            Hospital.DoesNotExist
        """
        hospital = Hospital.objects.get(id=hospital_id)
        
        allowed_fields = ['name', 'address', 'contact_phone', 'email']
        for field, value in kwargs.items():
            if field in allowed_fields:
                setattr(hospital, field, value)
        
        hospital.save()
        logger.info(f'Hospital updated: {hospital.name} ({hospital.hospital_code})')
        return hospital

    @staticmethod
    @transaction.atomic
    def deactivate_hospital(hospital_id):
        """
        Deactivate a hospital (soft delete).
        
        Args:
            hospital_id: UUID of the hospital
            
        Returns:
            Updated Hospital instance
        """
        hospital = Hospital.objects.get(id=hospital_id)
        hospital.is_active = False
        hospital.save()
        logger.info(f'Hospital deactivated: {hospital.name}')
        return hospital

    @staticmethod
    @transaction.atomic
    def reactivate_hospital(hospital_id):
        """
        Reactivate a deactivated hospital.
        
        Args:
            hospital_id: UUID of the hospital
            
        Returns:
            Updated Hospital instance
        """
        hospital = Hospital.objects.get(id=hospital_id)
        hospital.is_active = True
        hospital.save()
        logger.info(f'Hospital reactivated: {hospital.name}')
        return hospital

    @staticmethod
    def get_hospital_with_stats(hospital_id):
        """
        Get hospital with statistics.
        
        Args:
            hospital_id: UUID of the hospital
            
        Returns:
            dict with hospital details and stats
        """
        hospital = Hospital.objects.annotate(
            total_doctors=Count('doctors'),
            verified_doctors=Count('doctors', filter=Q(doctors__is_verified=True)),
        ).get(id=hospital_id)
        
        return {
            'hospital': hospital,
            'total_doctors': hospital.total_doctors,
            'verified_doctors': hospital.verified_doctors,
            'unverified_doctors': hospital.total_doctors - hospital.verified_doctors,
        }

    @staticmethod
    def list_hospitals_with_filters(is_active=None, search=None):
        """
        List hospitals with optional filters.
        
        Args:
            is_active: Filter by active status (True, False, or None for all)
            search: Search by name or hospital_code
            
        Returns:
            QuerySet of Hospital objects with doctor counts
        """
        queryset = Hospital.objects.annotate(
            doctor_count=Count('doctors'),
            verified_count=Count('doctors', filter=Q(doctors__is_verified=True)),
        )
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(hospital_code__icontains=search)
            )
        
        return queryset.order_by('name')


class DoctorAdminService:
    """Service for admin doctor/provider management."""

    @staticmethod
    def get_doctor_details(doctor_id):
        """
        Get full doctor profile with associated data.
        
        Args:
            doctor_id: UUID of the doctor profile
            
        Returns:
            dict with doctor details
        """
        doctor = DoctorProfile.objects.select_related('user', 'hospital').get(id=doctor_id)
        
        return {
            'id': doctor.id,
            'first_name': doctor.user.first_name,
            'last_name': doctor.user.last_name,
            'email': doctor.user.email,
            'phone_number': doctor.user.phone_number,
            'hospital': doctor.hospital,
            'license_number': doctor.license_number,
            'specialty': doctor.specialty,
            'is_verified': doctor.is_verified,
            'created_at': doctor.created_at,
        }

    @staticmethod
    @transaction.atomic
    def verify_doctor(doctor_id):
        """
        Mark a doctor as verified.
        
        Args:
            doctor_id: UUID of the doctor profile
            
        Returns:
            Updated DoctorProfile instance
        """
        doctor = DoctorProfile.objects.get(id=doctor_id)
        doctor.is_verified = True
        doctor.save()
        logger.info(f'Doctor verified: {doctor.user.email}')
        return doctor

    @staticmethod
    @transaction.atomic
    def unverify_doctor(doctor_id):
        """
        Mark a doctor as unverified.
        
        Args:
            doctor_id: UUID of the doctor profile
            
        Returns:
            Updated DoctorProfile instance
        """
        doctor = DoctorProfile.objects.get(id=doctor_id)
        doctor.is_verified = False
        doctor.save()
        logger.info(f'Doctor unverified: {doctor.user.email}')
        return doctor

    @staticmethod
    def list_doctors_by_hospital(hospital_id, verified_only=False):
        """
        List all doctors in a hospital.
        
        Args:
            hospital_id: UUID of the hospital
            verified_only: If True, return only verified doctors
            
        Returns:
            QuerySet of DoctorProfile objects
        """
        queryset = DoctorProfile.objects.filter(hospital_id=hospital_id).select_related('user')
        
        if verified_only:
            queryset = queryset.filter(is_verified=True)
        
        return queryset.order_by('user__first_name', 'user__last_name')

    @staticmethod
    def list_all_doctors(verified_only=False, search=None):
        """
        List all doctors across all hospitals.
        
        Args:
            verified_only: If True, return only verified doctors
            search: Search by first name, last name, or email
            
        Returns:
            QuerySet of DoctorProfile objects
        """
        queryset = DoctorProfile.objects.select_related('user', 'hospital')
        
        if verified_only:
            queryset = queryset.filter(is_verified=True)
        
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search)
            )
        
        return queryset.order_by('user__first_name', 'user__last_name')
