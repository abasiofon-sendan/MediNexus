from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['action', 'actor', 'actor_type', 'patient', 'nin_authorized', 'timestamp']
    list_filter = ['action', 'actor_type', 'nin_authorized']
    search_fields = ['actor__email', 'patient__email', 'description']
    readonly_fields = [f.name for f in AuditLog._meta.get_fields()]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
