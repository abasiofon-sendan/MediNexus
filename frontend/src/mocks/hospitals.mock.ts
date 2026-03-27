import type { Hospital, Doctor } from '#/types/api.types';

// ============================================================================
// MOCK HOSPITALS DATA (complement to real API data)
// ============================================================================

export const mockHospitals: Hospital[] = [
  {
    id: '880e8400-e29b-41d4-a716-446655440001',
    name: 'Lagos University Teaching Hospital',
    hospital_code: 'LUTH001',
    address: 'Idi-Araba, Surulere, Lagos State',
    contact_phone: '+234-1-8990000',
    email: 'info@luth.edu.ng',
    is_active: true,
    created_at: '2025-01-15T00:00:00Z'
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440002',
    name: 'National Hospital Abuja',
    hospital_code: 'NHA001',
    address: 'Central Business District, Abuja FCT',
    contact_phone: '+234-9-4612000',
    email: 'info@nationalhospital.gov.ng',
    is_active: true,
    created_at: '2024-11-20T00:00:00Z'
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440003',
    name: 'University College Hospital Ibadan',
    hospital_code: 'UCH001',
    address: 'Queen Elizabeth Road, Ibadan, Oyo State',
    contact_phone: '+234-2-2414100',
    email: 'info@uch.edu.ng',
    is_active: true,
    created_at: '2024-08-10T00:00:00Z'
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440004',
    name: 'Eko Hospital',
    hospital_code: 'EKO001',
    address: 'Kofo Abayomi Street, Victoria Island, Lagos',
    contact_phone: '+234-1-4618989',
    email: 'contact@ekohospital.com',
    is_active: true,
    created_at: '2024-12-05T00:00:00Z'
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440005',
    name: 'St. Nicholas Hospital',
    hospital_code: 'STN001',
    address: '57 Campbell Street, Lagos Island, Lagos',
    contact_phone: '+234-1-2630090',
    email: 'info@stnicholas.ng',
    is_active: true,
    created_at: '2024-09-18T00:00:00Z'
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440006',
    name: 'Lagos State University Teaching Hospital',
    hospital_code: 'LASUTH001',
    address: '1-5 Oba Akinjobi Street, Ikeja, Lagos State',
    contact_phone: '+234-1-4525837',
    email: 'info@lasuth.lg.gov.ng',
    is_active: true,
    created_at: '2025-02-12T00:00:00Z'
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440007',
    name: 'Federal Medical Centre Abuja',
    hospital_code: 'FMCA001',
    address: 'Jabi District, Abuja FCT',
    contact_phone: '+234-9-2919191',
    email: 'info@fmc-abuja.org',
    is_active: true,
    created_at: '2024-10-30T00:00:00Z'
  }
];

// ============================================================================
// MOCK DOCTORS DATA
// ============================================================================

export const mockDoctors: Doctor[] = [
  {
    id: '990e8400-e29b-41d4-a716-446655440001',
    full_name: 'Dr. Adebayo Ogundimu',
    email: 'adebayo.ogundimu@luth.edu.ng',
    hospital: mockHospitals[0], // LUTH
    license_number: 'MDCN-12345',
    specialty: 'CARDIOLOGY',
    is_verified: true,
    created_at: '2025-01-20T00:00:00Z'
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440002',
    full_name: 'Dr. Fatima Ibrahim',
    email: 'fatima.ibrahim@nationalhospital.gov.ng',
    hospital: mockHospitals[1], // National Hospital Abuja
    license_number: 'MDCN-23456',
    specialty: 'CARDIOLOGY',
    is_verified: true,
    created_at: '2024-11-25T00:00:00Z'
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440003',
    full_name: 'Dr. Chinedu Okoro',
    email: 'chinedu.okoro@ekohospital.com',
    hospital: mockHospitals[3], // Eko Hospital
    license_number: 'MDCN-34567',
    specialty: 'GENERAL_PRACTICE',
    is_verified: true,
    created_at: '2024-12-10T00:00:00Z'
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440004',
    full_name: 'Dr. Amina Hassan',
    email: 'amina.hassan@stnicholas.ng',
    hospital: mockHospitals[4], // St. Nicholas Hospital
    license_number: 'MDCN-45678',
    specialty: 'RADIOLOGY',
    is_verified: true,
    created_at: '2024-09-25T00:00:00Z'
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440005',
    full_name: 'Dr. Kemi Adeniran',
    email: 'kemi.adeniran@uch.edu.ng',
    hospital: mockHospitals[2], // UCH Ibadan
    license_number: 'MDCN-56789',
    specialty: 'ENDOCRINOLOGY',
    is_verified: true,
    created_at: '2024-08-15T00:00:00Z'
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440006',
    full_name: 'Dr. Tunde Adeyemi',
    email: 'tunde.adeyemi@lasuth.lg.gov.ng',
    hospital: mockHospitals[5], // LASUTH
    license_number: 'MDCN-67890',
    specialty: 'SURGERY',
    is_verified: true,
    created_at: '2025-02-18T00:00:00Z'
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getMockHospitalById(id: string): Hospital | undefined {
  return mockHospitals.find(hospital => hospital.id === id);
}

export function getMockDoctorById(id: string): Doctor | undefined {
  return mockDoctors.find(doctor => doctor.id === id);
}

export function getMockDoctorsByHospital(hospitalId: string): Doctor[] {
  return mockDoctors.filter(doctor => doctor.hospital.id === hospitalId);
}

export function getMockHospitalByName(name: string): Hospital | undefined {
  return mockHospitals.find(hospital => 
    hospital.name.toLowerCase().includes(name.toLowerCase())
  );
}

export function getMockDoctorByEmail(email: string): Doctor | undefined {
  return mockDoctors.find(doctor => doctor.email === email);
}

// For consent granting - get hospitals with their doctor counts
export function getMockHospitalsWithDoctorCount() {
  return mockHospitals.map(hospital => ({
    ...hospital,
    doctor_count: getMockDoctorsByHospital(hospital.id).length
  }));
}

// Duration presets for consent granting (in hours)
export const CONSENT_DURATION_PRESETS = [
  { label: '24 Hours', value: 24 },
  { label: '3 Days', value: 72 },
  { label: '1 Week', value: 168 },
  { label: '2 Weeks', value: 336 },
  { label: '1 Month', value: 720 }
];