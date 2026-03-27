from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = [
        'action',
        'user',
        'timestamp',
        'content_type',
        'description',
    ]
    list_filter = ['action', 'timestamp', 'content_type']
    search_fields = ['description', 'user__email', 'metadata']
    readonly_fields = ['id', 'timestamp', 'user', 'content_object']
    
    fieldsets = (
        ('Audit Information', {
            'fields': ('id', 'user', 'action', 'timestamp')
        }),
        ('Related Object', {
            'fields': ('content_type', 'object_id', 'content_object')
        }),
        ('Details', {
            'fields': ('description', 'metadata')
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        # All fields are readonly for audit logs
        return self.readonly_fields

    def has_add_permission(self, request):
        # Audit logs are only created programmatically
        return False

    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of audit logs for compliance
        return False
