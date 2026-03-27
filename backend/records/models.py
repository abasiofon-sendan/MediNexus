import uuid
from django.db import models
from django.utils import timezone
from accounts.models import User


class HealthRecord(models.Model):
    """
    Health Record created by doctors and approved by patients via OTP
    """
    RECORD_TYPES = [
        ('DIAGNOSIS', 'Diagnosis'),
        ('PRESCRIPTION', 'Prescription'),
        ('LAB_TEST', 'Lab Test'),
        ('VACCINATION', 'Vaccination'),
        ('CONSULTATION', 'Consultation'),
        ('OTHER', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    doctor = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_records',
        limit_choices_to={'user_type': 'PROVIDER'}
    )
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='health_records',
        limit_choices_to={'user_type': 'PATIENT'}
    )
    
    # Record details
    record_type = models.CharField(max_length=20, choices=RECORD_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Approval workflow
    is_approved = models.BooleanField(default=False)
    approval_timestamp = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Health Record'
        verbose_name_plural = 'Health Records'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', '-created_at']),
            models.Index(fields=['doctor', '-created_at']),
            models.Index(fields=['is_approved']),
        ]

    def __str__(self):
        return f'{self.title} - {self.patient.email} (Approved: {self.is_approved})'
    
    def approve(self):
        """Mark record as approved and set timestamp"""
        self.is_approved = True
        self.approval_timestamp = timezone.now()
        self.save()
