import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class ConsentLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='consents_given',
        limit_choices_to={'user_type': 'PATIENT'},
    )
    hospital = models.ForeignKey(
        'providers.Hospital',
        on_delete=models.CASCADE,
        related_name='consents_received',
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='consents_granted_to',
        limit_choices_to={'user_type': 'PROVIDER'},
    )
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_revoked = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Consent Log'
        verbose_name_plural = 'Consent Logs'
        ordering = ['-granted_at']

    def is_active(self) -> bool:
        # True if consent has not been revoked and has not expired.
        return not self.is_revoked and timezone.now() < self.expires_at

    def __str__(self):
        status = 'ACTIVE' if self.is_active() else 'INACTIVE'
        return f'Consent [{status}] – {self.patient.email} → {self.hospital.name}'
