import type { 
  HealthRecord, 
  HealthRecordDetail, 
  RecordType 
} from '#/types/api.types';

// ============================================================================
// MOCK HEALTH RECORDS DATA
// ============================================================================

export const mockHealthRecords: HealthRecordDetail[] = [
  // Approved Records
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Complete Blood Count (CBC)',
    record_type: 'LAB_RESULT',
    hospital: 'Lagos University Teaching Hospital',
    recorded_at: '2026-03-20T10:30:00Z',
    is_approved: true,
    is_rejected: false,
    content: `Complete Blood Count Analysis

Hemoglobin: 14.2 g/dL (Normal: 12.0-16.0)
Hematocrit: 42.1% (Normal: 36-46%)
White Blood Cell Count: 6,800/μL (Normal: 4,000-11,000)
Red Blood Cell Count: 4.8 million/μL (Normal: 4.2-5.4)
Platelet Count: 285,000/μL (Normal: 150,000-450,000)

Differential Count:
- Neutrophils: 58% (Normal: 50-70%)
- Lymphocytes: 32% (Normal: 20-40%)
- Monocytes: 8% (Normal: 2-10%)
- Eosinophils: 2% (Normal: 1-4%)

Clinical Notes:
All values are within normal limits. No signs of anemia or infection. Patient advised to maintain current diet and exercise routine.

Dr. Adebayo Ogundimu, MD
Hematology Department`,
    doctor_name: 'Dr. Adebayo Ogundimu',
    created_at: '2026-03-20T10:30:00Z'
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Hypertension Management',
    record_type: 'PRESCRIPTION',
    hospital: 'National Hospital Abuja',
    recorded_at: '2026-03-18T14:15:00Z',
    is_approved: true,
    is_rejected: false,
    content: `Prescription for Hypertension Management

Medication: Lisinopril 10mg
Dosage: One tablet once daily in the morning
Duration: 30 days (with 2 refills)
Quantity: 30 tablets

Instructions:
- Take on an empty stomach, preferably 1 hour before breakfast
- Monitor blood pressure daily and record readings
- Avoid potassium supplements unless specifically prescribed
- Return for follow-up in 4 weeks

Dietary Recommendations:
- Reduce sodium intake to less than 2,300mg daily
- Increase potassium-rich foods (bananas, oranges, spinach)
- Maintain DASH diet principles
- Limit alcohol consumption

Next Appointment: April 15, 2026

Dr. Fatima Ibrahim, MD
Cardiology Department
License: MDCN-45678`,
    doctor_name: 'Dr. Fatima Ibrahim',
    created_at: '2026-03-18T14:15:00Z'
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Acute Upper Respiratory Infection',
    record_type: 'DIAGNOSIS',
    hospital: 'Eko Hospital',
    recorded_at: '2026-03-15T09:45:00Z',
    is_approved: true,
    is_rejected: false,
    content: `Primary Diagnosis: Acute Upper Respiratory Infection (Common Cold)

Presenting Symptoms:
- Nasal congestion and rhinorrhea (3 days)
- Sore throat with mild difficulty swallowing
- Dry cough, worse at night
- Low-grade fever (37.8°C)
- General malaise and fatigue

Physical Examination:
- Temperature: 37.8°C
- Blood Pressure: 118/76 mmHg
- Pulse: 82 bpm, regular
- Respiratory Rate: 18/min
- Throat: Mild erythema, no exudate
- Lymph nodes: Slightly enlarged, non-tender
- Chest: Clear to auscultation bilaterally

Assessment:
Viral upper respiratory tract infection. No signs of bacterial complications or pneumonia.

Treatment Plan:
- Supportive care with rest and increased fluid intake
- Paracetamol 500mg every 6 hours for fever and discomfort
- Saline nasal spray for congestion
- Honey and lemon for cough relief
- Return if symptoms worsen or persist beyond 10 days

Expected Recovery: 7-10 days

Dr. Chinedu Okoro, MD
Family Medicine`,
    doctor_name: 'Dr. Chinedu Okoro',
    created_at: '2026-03-15T09:45:00Z'
  },

  // Pending Records (awaiting approval)
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'Chest X-Ray Report',
    record_type: 'IMAGING',
    hospital: 'St. Nicholas Hospital',
    recorded_at: '2026-03-25T16:20:00Z',
    is_approved: false,
    is_rejected: false,
    content: `CHEST X-RAY REPORT
Study Date: March 25, 2026
Indication: Chronic cough, rule out pneumonia

Technique: PA and lateral chest radiographs

Findings:
- Heart size is normal
- Mediastinal contours are within normal limits
- Lungs are clear bilaterally with no evidence of consolidation
- No pleural effusion or pneumothorax
- Bony structures appear intact
- No acute cardiopulmonary abnormalities

Impression: Normal chest X-ray

Recommendation: 
Clinical correlation suggested. If symptoms persist, consider CT chest for further evaluation.

Dr. Amina Hassan, MD
Department of Radiology
Read and approved: March 25, 2026 4:45 PM`,
    doctor_name: 'Dr. Amina Hassan',
    created_at: '2026-03-25T16:20:00Z'
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    title: 'Diabetes Follow-up Visit',
    record_type: 'DIAGNOSIS',
    hospital: 'University College Hospital Ibadan',
    recorded_at: '2026-03-24T11:30:00Z',
    is_approved: false,
    is_rejected: false,
    content: `DIABETES MELLITUS TYPE 2 - FOLLOW-UP VISIT

Current Medications:
- Metformin 500mg twice daily
- Glimepiride 2mg once daily

Vital Signs:
- Weight: 78 kg (decreased from 82 kg)
- BMI: 27.2 (improved)
- Blood Pressure: 130/84 mmHg
- HbA1c: 7.2% (target <7%)

Laboratory Results:
- Fasting Glucose: 145 mg/dL
- Random Glucose: 180 mg/dL
- Creatinine: 1.1 mg/dL (normal)
- Lipid Panel: Total cholesterol 195 mg/dL

Assessment:
Diabetes control improving but not yet at target. Weight loss efforts showing positive results.

Plan:
1. Continue current medications
2. Increase Metformin to 850mg twice daily
3. Dietary counseling reinforcement
4. Return in 3 months for HbA1c recheck
5. Annual eye exam scheduled

Dr. Kemi Adeniran, MD
Endocrinology Department`,
    doctor_name: 'Dr. Kemi Adeniran',
    created_at: '2026-03-24T11:30:00Z'
  },

  // Rejected Record
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    title: 'Incorrect Patient Information',
    record_type: 'OTHER',
    hospital: 'Lagos State University Teaching Hospital',
    recorded_at: '2026-03-22T13:15:00Z',
    is_approved: false,
    is_rejected: true,
    content: `This record was created with incorrect patient information and has been rejected by the patient.

Original Content:
The patient reported to have undergone appendectomy surgery on March 20, 2026. However, this information does not match the patient's medical history.

Reason for Rejection:
Patient has never undergone appendectomy. This appears to be a case of mistaken identity or data entry error.

Action Required:
Hospital to verify patient identity and create corrected record if applicable.`,
    doctor_name: 'Dr. Tunde Adeyemi',
    created_at: '2026-03-22T13:15:00Z'
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getMockRecordsByStatus(status: 'all' | 'approved' | 'pending' | 'rejected'): HealthRecordDetail[] {
  switch (status) {
    case 'approved':
      return mockHealthRecords.filter(record => record.is_approved && !record.is_rejected);
    case 'pending':
      return mockHealthRecords.filter(record => !record.is_approved && !record.is_rejected);
    case 'rejected':
      return mockHealthRecords.filter(record => record.is_rejected);
    default:
      return mockHealthRecords;
  }
}

export function getMockRecordById(id: string): HealthRecordDetail | undefined {
  return mockHealthRecords.find(record => record.id === id);
}

export function getMockPendingRecords(): HealthRecordDetail[] {
  return getMockRecordsByStatus('pending');
}

export function getMockRecordStats() {
  return {
    total: mockHealthRecords.length,
    approved: getMockRecordsByStatus('approved').length,
    pending: getMockRecordsByStatus('pending').length,
    rejected: getMockRecordsByStatus('rejected').length
  };
}