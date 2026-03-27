from django.contrib import admin
from .models import HealthRecord


@admin.register(HealthRecord)
class HealthRecordAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'doctor',
        'patient',
        'record_type',
        'is_approved',
        'created_at',
    ]
    list_filter = ['is_approved', 'record_type', 'created_at']
    search_fields = ['title', 'description', 'patient__email', 'doctor__email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'approval_timestamp']
    
    fieldsets = (
        ('Record Information', {
            'fields': ('id', 'title', 'record_type', 'description')
        }),
        ('Relationships', {
            'fields': ('doctor', 'patient')
        }),
        ('Approval Workflow', {
            'fields': ('is_approved', 'approval_timestamp')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        readonly = list(self.readonly_fields)
        if obj:  # Editing existing record
            readonly.extend(['doctor', 'patient'])
        return readonly
