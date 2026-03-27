from django.urls import path
<<<<<<< tuesday
from .views import (
    HospitalRegisterView,
    HospitalListView,
    HospitalDetailView,
    DoctorRegisterView,
    DoctorListView,
    DoctorDetailView,
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
=======
from .views import ProviderRegisterView

urlpatterns = [
    path('register/', ProviderRegisterView.as_view(), name='provider-register'),
>>>>>>> main
]