import type { 
  HealthRecordDetail, 
  AuditLog,
  RecordType 
} from '#/types/api.types';

// ============================================================================
// DOCTOR MOCK DATA - Minimal for hackathon demo
// ============================================================================

// Mock patient profiles with Nigerian-style names
export const mockPatients = [
  {
    nin: '12345678901',
    name: 'Adebayo Ogundimu',
    age: 42,
    bloodGroup: 'O+' as const,
    lastAccessed: '2026-03-25T14:30:00Z',
    recordCount: 3
  },
  {
    nin: '98765432109', 
    name: 'Fatima Mohammed',
    age: 29,
    bloodGroup: 'A+' as const,
    lastAccessed: '2026-03-25T09:15:00Z',
    recordCount: 2
  },
  {
    nin: '55512345678',
    name: 'Chioma Okwu',
    age: 35,
    bloodGroup: 'B+' as const,
    lastAccessed: '2026-03-24T16:45:00Z',
    recordCount: 4
  }
];

// Mock patient records organized by NIN
export const mockPatientRecordsByNin: Record<string, HealthRecordDetail[]> = {
  '12345678901': [
    {
      id: 'dr-rec-001',
      title: 'Hypertension Follow-up',
      record_type: 'DIAGNOSIS',
      hospital: 'Lagos University Teaching Hospital',
      recorded_at: '2026-03-20T10:30:00Z',
      is_approved: true,
      is_rejected: false,
      content: `Follow-up Visit - Hypertension Management

Patient: Adebayo Ogundimu (42M)
Date: March 20, 2026

Chief Complaint:
Routine follow-up for essential hypertension

Vital Signs:
- Blood Pressure: 138/85 mmHg (improved from 155/95)
- Heart Rate: 72 bpm, regular
- Weight: 78.5 kg (BMI: 26.2)

Assessment:
Patient shows good response to current antihypertensive regimen (Amlodipine 5mg daily). Blood pressure trending downward from initial presentation. Patient reports good medication compliance and dietary modifications.

Plan:
1. Continue Amlodipine 5mg daily
2. Return in 6 weeks for BP check
3. Continue low-sodium diet
4. Regular exercise as tolerated

Dr. Kemi Adeyemi, MD
Cardiology Department`,
      doctor_name: 'Dr. Kemi Adeyemi',
      patient_nin: '12345678901',
      created_at: '2026-03-20T10:30:00Z'
    },
    {
      id: 'dr-rec-002',
      title: 'Lipid Panel Results',
      record_type: 'LAB_RESULT',
      hospital: 'Lagos University Teaching Hospital', 
      recorded_at: '2026-03-18T14:15:00Z',
      is_approved: true,
      is_rejected: false,
      content: `Lipid Profile Analysis

Total Cholesterol: 195 mg/dL (Optimal: <200)
LDL Cholesterol: 118 mg/dL (Near optimal: 100-129)
HDL Cholesterol: 52 mg/dL (Good: >40 for men)
Triglycerides: 125 mg/dL (Normal: <150)

Interpretation: Overall good lipid profile. Continue current lifestyle modifications.`,
      doctor_name: 'Dr. Kemi Adeyemi',
      patient_nin: '12345678901',
      created_at: '2026-03-18T14:15:00Z'
    }
  ],
  '98765432109': [
    {
      id: 'dr-rec-003',
      title: 'Prenatal Check - 28 weeks',
      record_type: 'DIAGNOSIS',
      hospital: 'National Hospital Abuja',
      recorded_at: '2026-03-25T11:00:00Z',
      is_approved: false,
      is_rejected: false,
      content: `Routine Prenatal Visit - 28 Weeks Gestation

Patient: Fatima Mohammed (29F)
Gravida 2, Para 1

Vital Signs:
- Blood Pressure: 110/70 mmHg
- Weight: +12kg from pre-pregnancy
- Fundal Height: 28 cm (appropriate for gestational age)
- Fetal Heart Rate: 142 bpm

Glucose Tolerance Test: Normal (120 mg/dL at 1 hour)

Assessment: Normal pregnancy progression. No complications noted.

Plan:
1. Continue prenatal vitamins
2. Return in 2 weeks
3. Schedule growth ultrasound at 32 weeks

Dr. Amina Hassan, MD
Obstetrics & Gynecology`,
      doctor_name: 'Dr. Amina Hassan',
      patient_nin: '98765432109',
      created_at: '2026-03-25T11:00:00Z'
    }
  ],
  '55512345678': [
    {
      id: 'dr-rec-004', 
      title: 'Asthma Management',
      record_type: 'PRESCRIPTION',
      hospital: 'University College Hospital Ibadan',
      recorded_at: '2026-03-24T15:30:00Z',
      is_approved: true,
      is_rejected: false,
      content: `Prescription for Asthma Control

Patient: Chioma Okwu (35F)
Diagnosis: Moderate Persistent Asthma

Medications:
1. Salbutamol Inhaler (100mcg) - 2 puffs PRN for acute symptoms
2. Beclomethasone Inhaler (250mcg) - 2 puffs twice daily
3. Montelukast 10mg - 1 tablet at bedtime

Instructions:
- Use controller medication daily even when feeling well
- Carry rescue inhaler at all times
- Rinse mouth after steroid inhaler use
- Return if symptoms worsen or rescue use increases

Dr. Olumide Balogun, MD
Pulmonology Department`,
      doctor_name: 'Dr. Olumide Balogun',
      patient_nin: '55512345678', 
      created_at: '2026-03-24T15:30:00Z'
    }
  ]
};

// Mock doctor dashboard stats
export const mockDoctorStats = {
  patientsAccessedToday: 8,
  recordsCreated: 12,
  pendingApprovals: 3,
  recentActivities: 15
};

// Mock recently created records by doctor
export const mockRecentlyCreatedRecords: HealthRecordDetail[] = [
  {
    id: 'dr-new-001',
    title: 'Prenatal Check - 28 weeks',
    record_type: 'DIAGNOSIS' as RecordType,
    hospital: 'National Hospital Abuja',
    recorded_at: '2026-03-25T11:00:00Z',
    is_approved: false,
    is_rejected: false,
    content: 'Routine prenatal visit content...',
    doctor_name: 'Dr. Current Doctor',
    patient_nin: '98765432109',
    created_at: '2026-03-25T11:00:00Z'
  },
  {
    id: 'dr-new-002',
    title: 'Diabetes Follow-up',
    record_type: 'PRESCRIPTION' as RecordType,
    hospital: 'National Hospital Abuja',
    recorded_at: '2026-03-24T16:20:00Z',
    is_approved: true,
    is_rejected: false,
    content: 'Diabetes medication adjustment...',
    doctor_name: 'Dr. Current Doctor',
    patient_nin: '33344455566',
    created_at: '2026-03-24T16:20:00Z'
  }
];

// Mock audit logs for doctor activity feed
export const mockDoctorAuditLogs: AuditLog[] = [
  {
    id: 'audit-dr-001',
    action: 'READ',
    actor_email: 'doctor@example.com',
    actor_type: 'PROVIDER',
    patient_email: 'adebayo.ogundimu@email.com',
    record: 'dr-rec-001',
    description: 'Viewed patient medical records',
    nin_authorized: true,
    timestamp: '2026-03-25T14:30:00Z'
  },
  {
    id: 'audit-dr-002',
    action: 'WRITE_REQUEST',
    actor_email: 'doctor@example.com',
    actor_type: 'PROVIDER',
    patient_email: 'fatima.mohammed@email.com',
    record: 'dr-new-001',
    description: 'Created new medical record',
    nin_authorized: true,
    timestamp: '2026-03-25T11:00:00Z'
  },
  {
    id: 'audit-dr-003',
    action: 'WRITE_APPROVED',
    actor_email: 'chioma.okwu@email.com',
    actor_type: 'PATIENT',
    patient_email: 'chioma.okwu@email.com',
    record: 'dr-rec-004',
    description: 'Patient approved medical record',
    nin_authorized: true,
    timestamp: '2026-03-24T17:45:00Z'
  }
];