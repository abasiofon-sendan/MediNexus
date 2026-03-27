from django.contrib import admin
from django.utils.html import format_html, mark_safe
from .models import Hospital, DoctorProfile


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    """Admin interface for Hospital management."""

    list_display = [
        'name',
        'hospital_code',
        'contact_phone',
        'email',
        'doctor_count',
        'is_active_badge',
        'created_at',
    ]

    list_filter = [
        'is_active',
        'created_at',
    ]

    search_fields = [
        'name',
        'hospital_code',
        'address',
        'contact_phone',
        'email',
    ]

    fieldsets = (
        ('Hospital Information', {
            'fields': ('name', 'hospital_code', 'address'),
        }),
        ('Contact Details', {
            'fields': ('contact_phone', 'email'),
        }),
        ('Status', {
            'fields': ('is_active',),
        }),
        ('Metadata', {
            'fields': ('id', 'created_at'),
            'classes': ('collapse',),
        }),
    )

    readonly_fields = ['id', 'created_at']

    ordering = ['-created_at']

    def doctor_count(self, obj):
        """Display count of doctors in hospital."""
        count = obj.doctors.count()
        return format_html(
            '<span style="background-color: #417690; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            count,
        )
    doctor_count.short_description = 'Doctors'

    def is_active_badge(self, obj):
        """Display active status as badge."""
        if obj.is_active:
            return mark_safe(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Active</span>'
            )
        else:
            return mark_safe(
                '<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">Inactive</span>'
            )
    is_active_badge.short_description = 'Status'

    def get_queryset(self, request):
        """Optimize queries with doctor counts."""
        qs = super().get_queryset(request)
        return qs.prefetch_related('doctors')


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    """Admin interface for Doctor Profile management."""

    list_display = [
        'doctor_name',
        'doctor_email',
        'hospital',
        'license_number',
        'specialty_display',
        'is_verified_badge',
        'created_at',
    ]

    list_filter = [
        'is_verified',
        'specialty',
        'hospital',
        'created_at',
    ]

    search_fields = [
        'user__first_name',
        'user__last_name',
        'user__email',
        'license_number',
        'hospital__name',
    ]

    fieldsets = (
        ('Doctor Information', {
            'fields': ('user', 'license_number', 'specialty'),
        }),
        ('Hospital Assignment', {
            'fields': ('hospital',),
        }),
        ('Verification Status', {
            'fields': ('is_verified',),
        }),
        ('Metadata', {
            'fields': ('id', 'created_at'),
            'classes': ('collapse',),
        }),
    )

    readonly_fields = ['id', 'created_at', 'user']

    ordering = ['-created_at']

    actions = ['verify_doctors', 'unverify_doctors']

    def doctor_name(self, obj):
        """Display doctor's full name."""
        return obj.user.get_full_name() or obj.user.email
    doctor_name.short_description = 'Doctor Name'

    def doctor_email(self, obj):
        """Display doctor's email."""
        return obj.user.email
    doctor_email.short_description = 'Email'

    def specialty_display(self, obj):
        """Display specialty in readable format."""
        return obj.get_specialty_display()
    specialty_display.short_description = 'Specialty'

    def is_verified_badge(self, obj):
        """Display verification status as badge."""
        if obj.is_verified:
            return mark_safe(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Verified</span>'
            )
        else:
            return mark_safe(
                '<span style="background-color: #ffc107; color: black; padding: 3px 10px; border-radius: 3px;">Pending</span>'
            )
    is_verified_badge.short_description = 'Verification'

    @admin.action(description='Mark selected doctors as verified')
    def verify_doctors(self, request, queryset):
        """Bulk action to verify doctors."""
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'{updated} doctor(s) marked as verified.')

    @admin.action(description='Mark selected doctors as unverified')
    def unverify_doctors(self, request, queryset):
        """Bulk action to unverify doctors."""
        updated = queryset.update(is_verified=False)
        self.message_user(request, f'{updated} doctor(s) marked as unverified.')

    def get_queryset(self, request):
        """Optimize queries with related data."""
        qs = super().get_queryset(request)
        return qs.select_related('user', 'hospital')
