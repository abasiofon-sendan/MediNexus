from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html, mark_safe
from .models import User, PatientProfile, OTPToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Enhanced admin interface for User management."""

    model = User
    list_display = (
        'email',
        'full_name',
        'user_type_badge',
        'verification_status',
        'is_active_badge',
        'date_joined',
    )
    list_filter = (
        'user_type',
        'is_active',
        'email_verified',
        'nin_verified',
        'is_staff',
        'date_joined',
    )
    search_fields = (
        'email',
        'first_name',
        'last_name',
        'nin',
        'phone_number',
    )
    ordering = ('-date_joined',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'phone_number', 'nin', 'nin_verified', 'email_verified')
        }),
        ('User Type & Role', {
            'fields': ('user_type',)
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'first_name',
                'last_name',
                'phone_number',
                'nin',
                'user_type',
                'password1',
                'password2',
            ),
        }),
    )

    filter_horizontal = ('groups', 'user_permissions')

    def full_name(self, obj):
        """Display user's full name."""
        full_name = obj.get_full_name()
        return full_name if full_name else '—'
    full_name.short_description = 'Full Name'

    def user_type_badge(self, obj):
        """Display user type as colored badge."""
        type_colors = {
            'PATIENT': '#0c5460',
            'PROVIDER': '#004085',
            'ADMIN': '#721c24',
        }
        color = type_colors.get(obj.user_type, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_user_type_display(),
        )
    user_type_badge.short_description = 'Type'

    def verification_status(self, obj):
        """Display email and NIN verification status."""
        statuses = []
        
        if obj.email_verified:
            statuses.append(format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 8px; border-radius: 3px; margin-right: 5px;">✓ Email</span>'
            ))
        else:
            statuses.append(format_html(
                '<span style="background-color: #ffc107; color: black; padding: 3px 8px; border-radius: 3px; margin-right: 5px;">✗ Email</span>'
            ))
        
        if obj.nin_verified:
            statuses.append(format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 8px; border-radius: 3px;">✓ NIN</span>'
            ))
        else:
            statuses.append(format_html(
                '<span style="background-color: #ffc107; color: black; padding: 3px 8px; border-radius: 3px;">✗ NIN</span>'
            ))
        
        return format_html(' '.join(str(s) for s in statuses))
    verification_status.short_description = 'Verification'

    def is_active_badge(self, obj):
        """Display active status as badge."""
        if obj.is_active:
            return mark_safe(
                '<span style="background-color: #28a745; color: white; padding: 5px 10px; border-radius: 3px;">Active</span>'
            )
        else:
            return mark_safe(
                '<span style="background-color: #dc3545; color: white; padding: 5px 10px; border-radius: 3px;">Inactive</span>'
            )
    is_active_badge.short_description = 'Status'


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    """Enhanced admin interface for Patient Profile management."""

    list_display = (
        'user_email',
        'user_full_name',
        'blood_group',
        'genotype',
        'date_of_birth',
        'has_allergies',
    )
    list_filter = (
        'blood_group',
        'genotype',
        'date_of_birth',
    )
    search_fields = (
        'user__email',
        'user__first_name',
        'user__last_name',
        'user__nin',
        'allergies',
        'emergency_contact',
    )
    readonly_fields = ('id', 'user_email')

    fieldsets = (
        ('User Information', {
            'fields': ('user', 'user_email', 'id')
        }),
        ('Medical Information', {
            'fields': ('blood_group', 'genotype', 'allergies')
        }),
        ('Personal Details', {
            'fields': ('date_of_birth', 'emergency_contact')
        }),
    )

    raw_id_fields = ('user',)
    ordering = ('-user__date_joined',)

    def user_email(self, obj):
        """Display user email."""
        return obj.user.email
    user_email.short_description = 'Email'

    def user_full_name(self, obj):
        """Display user full name."""
        return obj.user.get_full_name() or obj.user.email
    user_full_name.short_description = 'Name'

    def has_allergies(self, obj):
        """Display if patient has allergies."""
        if obj.allergies and obj.allergies.strip():
            return mark_safe(
                '<span style="background-color: #ff6b6b; color: white; padding: 5px 10px; border-radius: 3px;">⚠ Has Allergies</span>'
            )
        else:
            return mark_safe(
                '<span style="background-color: #28a745; color: white; padding: 5px 10px; border-radius: 3px;">No Allergies</span>'
            )
    has_allergies.short_description = 'Allergies'

    def get_queryset(self, request):
        """Optimize queries."""
        qs = super().get_queryset(request)
        return qs.select_related('user')


@admin.register(OTPToken)
class OTPTokenAdmin(admin.ModelAdmin):
    """Enhanced admin interface for OTP Token management."""

    list_display = (
        'email',
        'code_masked',
        'status_badge',
        'created_at',
        'expires_at',
    )
    list_filter = (
        'is_used',
        'created_at',
        'expires_at',
    )
    search_fields = ('email', 'code')
    readonly_fields = ('id', 'created_at', 'expires_at', 'email_display')

    fieldsets = (
        ('OTP Information', {
            'fields': ('id', 'email_display', 'code')
        }),
        ('Status', {
            'fields': ('is_used',)
        }),
        ('Timeline', {
            'fields': ('created_at', 'expires_at')
        }),
    )

    ordering = ('-created_at',)

    def code_masked(self, obj):
        """Display OTP code masked for security."""
        return '●' * len(obj.code)
    code_masked.short_description = 'Code'

    def email_display(self, obj):
        """Display email."""
        return obj.email
    email_display.short_description = 'Email'

    def status_badge(self, obj):
        """Display OTP status as badge."""
        if obj.is_used:
            return mark_safe(
                '<span style="background-color: #6c757d; color: white; padding: 5px 10px; border-radius: 3px;">Used</span>'
            )
        elif obj.is_valid():
            return mark_safe(
                '<span style="background-color: #28a745; color: white; padding: 5px 10px; border-radius: 3px;">Valid</span>'
            )
        else:
            return mark_safe(
                '<span style="background-color: #dc3545; color: white; padding: 5px 10px; border-radius: 3px;">Expired</span>'
            )
    status_badge.short_description = 'Status'

    actions = ['mark_as_used']

    @admin.action(description='Mark selected OTPs as used')
    def mark_as_used(self, request, queryset):
        """Bulk action to mark OTPs as used."""
        updated = queryset.exclude(is_used=True).update(is_used=True)
        self.message_user(request, f'{updated} OTP(s) marked as used.')

    def has_add_permission(self, request):
        # OTPs are only created programmatically
        return False
