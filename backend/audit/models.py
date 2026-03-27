import uuid
from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('READ',             'Read'),
        ('WRITE_REQUEST',    'Write Request'),
        ('WRITE_APPROVED',   'Write Approved'),
        ('WRITE_REJECTED',   'Write Rejected'),
        ('CONSENT_GRANTED',  'Consent Granted'),
        ('CONSENT_REVOKED',  'Consent Revoked'),
    ]

    ACTOR_TYPE_CHOICES = [
        ('PATIENT',  'Patient'),
        ('PROVIDER', 'Provider'),
        ('ADMIN',    'Admin'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_actions'
    )
    actor_type = models.CharField(max_length=10, choices=ACTOR_TYPE_CHOICES, null=True, blank=True)
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_subject'
    )
    record = models.ForeignKey(
        'records.HealthRecord',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    description = models.TextField(null=True, blank=True)
    nin_authorized = models.BooleanField(default=False, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-timestamp']

    def save(self, *args, **kwargs):
        if self.pk and AuditLog.objects.filter(pk=self.pk).exists():
            raise PermissionError('AuditLog entries are immutable and cannot be edited.')
        super().save(*args, **kwargs)

    def __str__(self):
        return f'[{self.timestamp:%Y-%m-%d %H:%M}] {self.action} by {self.actor}'
