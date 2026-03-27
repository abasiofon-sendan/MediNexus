from django.contrib import admin
from django.utils.html import format_html, mark_safe
from .models import HealthRecord


@admin.register(HealthRecord)
class HealthRecordAdmin(admin.ModelAdmin):
    """Admin interface for Health Records management."""

    list_display = [
        'title',
        'doctor_name',
        'patient_name',
        'record_type_badge',
        'approval_status_badge',
        'created_at',
    ]

    list_filter = [
        'is_approved',
        'record_type',
        'created_at',
        'updated_at',
    ]

    search_fields = [
        'title',
        'description',
        'patient__email',
        'patient__first_name',
        'patient__last_name',
        'doctor__email',
        'doctor__first_name',
        'doctor__last_name',
    ]

    readonly_fields = [
        'id',
        'created_at',
        'updated_at',
        'approval_timestamp',
        'patient_email',
        'doctor_email',
    ]

    fieldsets = (
        ('Record Information', {
            'fields': ('id', 'title', 'record_type', 'description'),
        }),
        ('Doctor & Patient', {
            'fields': ('doctor', 'doctor_email', 'patient', 'patient_email'),
        }),
        ('Approval Status', {
            'fields': ('is_approved', 'approval_timestamp'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    actions = ['approve_records', 'unapprove_records']

    ordering = ['-created_at']

    def doctor_name(self, obj):
        """Display doctor's full name."""
        return obj.doctor.get_full_name() or obj.doctor.email
    doctor_name.short_description = 'Doctor'

    def patient_name(self, obj):
        """Display patient's full name."""
        return obj.patient.get_full_name() or obj.patient.email
    patient_name.short_description = 'Patient'

    def doctor_email(self, obj):
        """Display doctor's email."""
        return obj.doctor.email

    def patient_email(self, obj):
        """Display patient's email."""
        return obj.patient.email

    def record_type_badge(self, obj):
        """Display record type as badge."""
        type_colors = {
            'DIAGNOSIS': '#0c5460',
            'PRESCRIPTION': '#004085',
            'LAB_TEST': '#6c63ff',
            'VACCINATION': '#28a745',
            'CONSULTATION': '#ff6b6b',
            'OTHER': '#6c757d',
        }
        color = type_colors.get(obj.record_type, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_record_type_display(),
        )
    record_type_badge.short_description = 'Type'

    def approval_status_badge(self, obj):
        """Display approval status as badge."""
        if obj.is_approved:
            return mark_safe(
                '<span style="background-color: #28a745; color: white; padding: 5px 10px; border-radius: 3px;">✓ Approved</span>'
            )
        else:
            return mark_safe(
                '<span style="background-color: #ffc107; color: black; padding: 5px 10px; border-radius: 3px;">⏳ Pending</span>'
            )
    approval_status_badge.short_description = 'Status'

    @admin.action(description='Approve selected records')
    def approve_records(self, request, queryset):
        """Bulk action to approve records."""
        for record in queryset:
            record.approve()
        self.message_user(request, f'{queryset.count()} record(s) approved.')

    @admin.action(description='Mark selected records as unapproved')
    def unapprove_records(self, request, queryset):
        """Bulk action to unapprove records."""
        updated = queryset.update(is_approved=False, approval_timestamp=None)
        self.message_user(request, f'{updated} record(s) marked as unapproved.')

    def get_queryset(self, request):
        """Optimize queries with related data."""
        qs = super().get_queryset(request)
        return qs.select_related('doctor', 'patient')


    def get_readonly_fields(self, request, obj=None):
        readonly = list(self.readonly_fields)
        if obj:  # Editing existing record
            readonly.extend(['doctor', 'patient'])
        return readonly
