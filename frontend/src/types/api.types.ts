// ============================================================================
// API Response Types for MediNexus
// Generated from OpenAPI schema: https://medinexus-backend-59tf.onrender.com/api/schema/
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export type RecordType = 
  | 'DIAGNOSIS' 
  | 'PRESCRIPTION' 
  | 'LAB_RESULT' 
  | 'IMAGING' 
  | 'SURGERY' 
  | 'OTHER';

export type AuditAction = 
  | 'READ' 
  | 'WRITE_REQUEST' 
  | 'WRITE_APPROVED' 
  | 'WRITE_REJECTED' 
  | 'CONSENT_GRANTED' 
  | 'CONSENT_REVOKED';

export type ActorType = 'PATIENT' | 'PROVIDER' | 'ADMIN';

export type BloodGroup = 
  | 'A+' | 'A-' | 'B+' | 'B-' 
  | 'O+' | 'O-' | 'AB+' | 'AB-' 
  | 'UNKNOWN';

export type Genotype = 'AA' | 'AS' | 'SS' | 'AC' | 'SC' | 'UNKNOWN';

export type Specialty = 
  | 'GENERAL_PRACTICE' | 'CARDIOLOGY' | 'DERMATOLOGY' 
  | 'ENDOCRINOLOGY' | 'GASTROENTEROLOGY' | 'NEUROLOGY' 
  | 'OBSTETRICS' | 'ONCOLOGY' | 'OPHTHALMOLOGY' 
  | 'ORTHOPAEDICS' | 'PAEDIATRICS' | 'PSYCHIATRY' 
  | 'RADIOLOGY' | 'SURGERY' | 'UROLOGY' | 'OTHER';

// ============================================================================
// HEALTH RECORDS
// ============================================================================

export interface HealthRecord {
  id: string; // UUID
  title: string;
  record_type: RecordType;
  hospital: string; // Hospital name
  recorded_at: string; // ISO date string
  is_approved: boolean;
  is_rejected: boolean;
}

export interface HealthRecordDetail extends HealthRecord {
  content: string; // Free-form text content
  patient_nin?: string;
  doctor_name?: string;
  created_at?: string;
  updated_at?: string;
}

// Request types for record actions
export interface HealthRecordApproveRequest {
  otp_code: string; // 6-digit OTP
}

export interface HealthRecordCreateRequest {
  patient_nin: string; // 11 digits
  hospital_id: string; // UUID
  record_type: RecordType;
  title: string;
  content: string; // Free-form text
}

// ============================================================================
// CONSENTS
// ============================================================================

export interface ConsentLog {
  id: string; // UUID
  hospital_name: string;
  doctor_email: string | null;
  granted_at: string; // ISO date string
  expires_at: string; // ISO date string
  is_revoked: boolean;
  is_active: boolean; // Computed: not revoked and not expired
}

export interface GrantConsentRequest {
  hospital_id: string; // UUID
  doctor_id?: string | null; // UUID, optional
  expires_in_hours: number; // 1-720 hours
}

export interface RevokeConsentRequest {
  consent_id: string; // UUID
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export interface AuditLog {
  id: string; // UUID
  action: AuditAction;
  actor_email: string;
  actor_type: ActorType;
  patient_email: string;
  record: string | null; // UUID of related record
  description: string;
  nin_authorized: boolean;
  timestamp: string; // ISO date string
}

// ============================================================================
// HOSPITALS & DOCTORS
// ============================================================================

export interface Hospital {
  id: string; // UUID
  name: string;
  hospital_code: string;
  address: string;
  contact_phone: string;
  email: string;
  is_active?: boolean;
  created_at?: string;
}

export interface HospitalWithDoctorCount extends Hospital {
  doctor_count: number;
}

export interface Doctor {
  id: string; // UUID
  full_name: string;
  email: string;
  hospital: Hospital;
  license_number: string;
  specialty: Specialty;
  is_verified: boolean;
  created_at: string;
}

// ============================================================================
// AUTHENTICATION (from existing auth.service.ts)
// ============================================================================

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number?: string;
}

export interface Tokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

// ============================================================================
// DASHBOARD STATS (derived from audit logs)
// ============================================================================

export interface DashboardStats {
  totalRecords: number;
  pendingApprovals: number;
  activeConsents: number;
  recentActivities: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type RecordStatus = 'approved' | 'pending' | 'rejected';

export interface RecordWithStatus extends HealthRecord {
  status: RecordStatus;
}

export interface ConsentWithTimeLeft extends ConsentLog {
  timeLeft: string; // Human readable: "2 days", "5 hours", "Expired"
  isExpiringSoon: boolean; // < 24 hours
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, string[]>;
}