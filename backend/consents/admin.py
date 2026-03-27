from django.contrib import admin
from django.utils.html import format_html, mark_safe
from django.utils import timezone
from .models import ConsentLog


@admin.register(ConsentLog)
class ConsentLogAdmin(admin.ModelAdmin):
    """Admin interface for Consent Log management."""

    list_display = [
        'patient_email',
        'hospital_name',
        'doctor_name',
        'granted_at',
        'status_badge',
        'expires_at',
    ]

    list_filter = [
        'is_revoked',
        'granted_at',
        'expires_at',
        'hospital',
    ]

    search_fields = [
        'patient__email',
        'patient__first_name',
        'patient__last_name',
        'hospital__name',
        'hospital__hospital_code',
        'doctor__email',
        'doctor__first_name',
        'doctor__last_name',
    ]

    readonly_fields = [
        'id',
        'granted_at',
        'patient_email',
        'hospital_name',
        'doctor_name',
        'status_display',
    ]

    fieldsets = (
        ('Consent Details', {
            'fields': ('id', 'patient', 'patient_email', 'hospital', 'hospital_name', 'doctor', 'doctor_name'),
        }),
        ('Timeline', {
            'fields': ('granted_at', 'expires_at'),
        }),
        ('Status', {
            'fields': ('is_revoked', 'status_display'),
        }),
    )

    actions = ['revoke_consents', 'restore_consents']

    ordering = ['-granted_at']

    def patient_email(self, obj):
        """Display patient email."""
        return obj.patient.email
    patient_email.short_description = 'Patient'

    def hospital_name(self, obj):
        """Display hospital name."""
        return obj.hospital.name
    hospital_name.short_description = 'Hospital'

    def doctor_name(self, obj):
        """Display doctor's full name or email."""
        if obj.doctor:
            return obj.doctor.get_full_name() or obj.doctor.email
        return '—'
    doctor_name.short_description = 'Doctor'

    def status_badge(self, obj):
        """Display consent status as badge."""
        if obj.is_revoked:
            return mark_safe(
                '<span style="background-color: #dc3545; color: white; padding: 5px 10px; border-radius: 3px;">🔒 Revoked</span>'
            )
        elif timezone.now() > obj.expires_at:
            return mark_safe(
                '<span style="background-color: #6c757d; color: white; padding: 5px 10px; border-radius: 3px;">⏰ Expired</span>'
            )
        else:
            return mark_safe(
                '<span style="background-color: #28a745; color: white; padding: 5px 10px; border-radius: 3px;">✓ Active</span>'
            )
    status_badge.short_description = 'Status'

    def status_display(self, obj):
        """Display detailed status information."""
        if obj.is_revoked:
            return 'REVOKED'
        elif timezone.now() > obj.expires_at:
            return 'EXPIRED'
        else:
            return 'ACTIVE'
    status_display.short_description = 'Status'

    @admin.action(description='Revoke selected consents')
    def revoke_consents(self, request, queryset):
        """Bulk action to revoke consents."""
        updated = queryset.exclude(is_revoked=True).update(is_revoked=True)
        self.message_user(request, f'{updated} consent(s) revoked.')

    @admin.action(description='Restore selected consents')
    def restore_consents(self, request, queryset):
        """Bulk action to restore consents."""
        updated = queryset.filter(is_revoked=True).update(is_revoked=False)
        self.message_user(request, f'{updated} consent(s) restored.')

    def get_queryset(self, request):
        """Optimize queries with related data."""
        qs = super().get_queryset(request)
        return qs.select_related('patient', 'hospital', 'doctor')
