import uuid
from django.db import models
from django.conf import settings


class Hospital(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    hospital_code = models.CharField(max_length=50, unique=True)
    address = models.TextField()
    contact_phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Hospital'
        verbose_name_plural = 'Hospitals'
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.hospital_code})'


class DoctorProfile(models.Model):
    SPECIALTY_CHOICES = [
        ('GENERAL_PRACTICE', 'General Practice'),
        ('CARDIOLOGY', 'Cardiology'),
        ('DERMATOLOGY', 'Dermatology'),
        ('ENDOCRINOLOGY', 'Endocrinology'),
        ('GASTROENTEROLOGY', 'Gastroenterology'),
        ('NEUROLOGY', 'Neurology'),
        ('OBSTETRICS', 'Obstetrics & Gynaecology'),
        ('ONCOLOGY', 'Oncology'),
        ('OPHTHALMOLOGY', 'Ophthalmology'),
        ('ORTHOPAEDICS', 'Orthopaedics'),
        ('PAEDIATRICS', 'Paediatrics'),
        ('PSYCHIATRY', 'Psychiatry'),
        ('RADIOLOGY', 'Radiology'),
        ('SURGERY', 'Surgery'),
        ('UROLOGY', 'Urology'),
        ('OTHER', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_profile',
    )
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='doctors',
    )
    license_number = models.CharField(max_length=50, unique=True)
    specialty = models.CharField(
        max_length=30,
        choices=SPECIALTY_CHOICES,
        default='GENERAL_PRACTICE',
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Doctor Profile'
        verbose_name_plural = 'Doctor Profiles'

    def __str__(self):
        return f'Dr. {self.user.get_full_name()} – {self.get_specialty_display()}'
