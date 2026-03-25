from rest_framework import permissions


class IsPatient(permissions.BasePermission):
    message = 'Only patients are allowed to perform this action.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type == 'PATIENT'
        )


class IsDoctor(permissions.BasePermission):
    message = 'Only verified doctors are allowed to perform this action.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type == 'PROVIDER'
        )


class IsAdmin(permissions.BasePermission):
    message = 'Only admins are allowed to perform this action.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type == 'ADMIN'
        )


class IsPatientOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type in ('PATIENT', 'ADMIN')
        )


class IsDoctorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type in ('PROVIDER', 'ADMIN')
        )
