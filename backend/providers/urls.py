from django.urls import path
from .views import (
    HospitalRegisterView,
    HospitalListView,
    HospitalDetailView,
    DoctorRegisterView,
    DoctorListView,
    DoctorDetailView,
    # ProviderRegisterView,
)

urlpatterns = [
    # Hospitals
    path('hospitals/', HospitalListView.as_view(), name='hospital-list'),
    path('hospitals/register/', HospitalRegisterView.as_view(), name='hospital-register'),
    path('hospitals/<uuid:pk>/', HospitalDetailView.as_view(), name='hospital-detail'),

    # Doctors
    path('doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('doctors/register/', DoctorRegisterView.as_view(), name='doctor-register'),
    path('doctors/<uuid:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
]