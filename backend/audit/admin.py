from django.contrib import admin
from django.utils.html import format_html
import json
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Admin interface for Audit Log management."""

    list_display = [
        'timestamp',
        'user_email',
        'action_badge',
        'content_type_name',
        'description_preview',
    ]

    list_filter = [
        'action',
        'timestamp',
        'content_type',
    ]

    search_fields = [
        'description',
        'user__email',
        'user__first_name',
        'user__last_name',
    ]

    readonly_fields = [
        'id',
        'timestamp',
        'user_email',
        'action_display',
        'metadata_display',
        'content_object_link',
    ]

    fieldsets = (
        ('Audit Information', {
            'fields': ('id', 'user_email', 'action_display', 'timestamp'),
        }),
        ('Related Object', {
            'fields': ('content_type', 'object_id', 'content_object_link'),
        }),
        ('Details', {
            'fields': ('description', 'metadata_display'),
        }),
    )

    ordering = ['-timestamp']

    def user_email(self, obj):
        """Display user email."""
        if obj.user:
            return obj.user.email
        return 'System'
    user_email.short_description = 'User'

    def action_badge(self, obj):
        """Display action as colored badge."""
        action_colors = {
            'CREATE': '#28a745',
            'VIEW': '#0c5460',
            'APPROVE': '#007bff',
            'REJECT': '#dc3545',
            'UPDATE': '#ffc107',
            'DELETE': '#dc3545',
            'OTP_SENT': '#17a2b8',
            'OTP_VERIFIED': '#28a745',
        }
        color = action_colors.get(obj.action, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_action_display(),
        )
    action_badge.short_description = 'Action'

    def action_display(self, obj):
        """Display action."""
        return obj.get_action_display()
    action_display.short_description = 'Action'

    def content_type_name(self, obj):
        """Display content type name."""
        if obj.content_type:
            return f'{obj.content_type.app_label}.{obj.content_type.model}'
        return '—'
    content_type_name.short_description = 'Object Type'

    def content_object_link(self, obj):
        """Display link to the related object if available."""
        if obj.content_object:
            return str(obj.content_object)
        elif obj.object_id:
            return str(obj.object_id)
        return '—'
    content_object_link.short_description = 'Related Object'

    def description_preview(self, obj):
        """Display preview of description."""
        if obj.description:
            return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
        return '—'
    description_preview.short_description = 'Description'

    def metadata_display(self, obj):
        """Display metadata formatted as JSON."""
        if obj.metadata:
            return format_html(
                '<pre style="background-color: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto;">{}</pre>',
                json.dumps(obj.metadata, indent=2),
            )
        return '—'
    metadata_display.short_description = 'Metadata'

    def get_queryset(self, request):
        """Optimize queries with related data."""
        qs = super().get_queryset(request)
        return qs.select_related('user', 'content_type')


    def get_readonly_fields(self, request, obj=None):
        # All fields are readonly for audit logs
        return self.readonly_fields

    def has_add_permission(self, request):
        # Audit logs are only created programmatically
        return False

    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of audit logs for compliance
        return False
