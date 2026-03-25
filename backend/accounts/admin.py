from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, PatientProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ('email', 'first_name', 'last_name', 'user_type', 'nin_verified', 'is_active', 'date_joined')
    list_filter = ('user_type', 'nin_verified', 'is_active', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name', 'nin', 'phone_number')
    ordering = ('-date_joined',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number', 'nin', 'nin_verified')}),
        ('Role', {'fields': ('user_type',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'phone_number', 'nin', 'user_type', 'password1', 'password2'),
        }),
    )

    # AbstractUser uses 'username' in filter_horizontal — remove it since we dropped username
    filter_horizontal = ('groups', 'user_permissions')


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'blood_group', 'genotype', 'date_of_birth')
    search_fields = ('user__email', 'user__nin')
    raw_id_fields = ('user',)
