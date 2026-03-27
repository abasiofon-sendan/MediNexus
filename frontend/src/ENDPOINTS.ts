// API Base URL - Update to production backend
export const API_BASE_URL = "https://medinexus-dad0.onrender.com/api";

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================
export const AUTH_ENDPOINTS = {
	// Patient Registration & Login
	PATIENT_REGISTER: "/accounts/patient/register/",
	DOCTOR_REGISTER: "/providers/doctors/register/",
	LOGIN: "/accounts/login/",
	
	// OTP Verification
	OTP_SEND: "/accounts/otp/send/",
	OTP_VERIFY: "/accounts/otp/verify/",
	
	// JWT Token Management
	TOKEN_REFRESH: "/accounts/token/refresh/",
	
	// NIN Verification (Interswitch)
	INTERSWITCH_AUTH: "/accounts/nin/interswitch/auth/",
	NIN_FULL_DETAILS: "/accounts/nin/full-details/",
} as const;

// ============================================================================
// PROVIDER ENDPOINTS (Hospitals & Doctors)
// ============================================================================
export const PROVIDER_ENDPOINTS = {
	// Hospitals
	HOSPITALS: "/providers/hospitals/",
	HOSPITAL_REGISTER: "/providers/hospitals/register/",
	HOSPITAL_DETAIL: (id: string) => `/providers/hospitals/${id}/`,
	
	// Doctors
	DOCTORS: "/providers/doctors/",
	DOCTOR_REGISTER: "/providers/doctors/register/",
	DOCTOR_DETAIL: (id: string) => `/providers/doctors/${id}/`,
	DOCTORS_BY_HOSPITAL: (hospitalId: string) => `/providers/doctors/?hospital_id=${hospitalId}`,
} as const;

// ============================================================================
// HEALTH RECORDS ENDPOINTS
// ============================================================================
export const RECORD_ENDPOINTS = {
	// List & Retrieve Records
	LIST: "/records/", // GET - List user's records (patient/doctor/admin view)
	DETAIL: (id: string) => `/records/${id}/`, // GET - Get single record (creates VIEW audit log)
	
	// Doctor Actions
	CREATE: "/records/create_record/", // POST - Doctor creates record (sends OTP to patient)
	
	// Patient Actions
	APPROVE: (id: string) => `/records/${id}/approve/`, // POST - Patient approves with OTP
	PENDING: "/records/pending/", // GET - Patient's pending records awaiting approval
	
	// Audit Trail
	AUDIT_TRAIL: (id: string) => `/records/${id}/audit-trail/`, // GET - Record's audit history
} as const;

// ============================================================================
// CONSENT ENDPOINTS
// ============================================================================
export const CONSENT_ENDPOINTS = {
	GRANT: "/consents/grant/", // POST - Patient grants consent to hospital/doctor
	REVOKE: "/consents/revoke/", // POST - Patient revokes consent
} as const;

// ============================================================================
// AUDIT ENDPOINTS
// ============================================================================
// Note: No direct audit endpoints exposed in current backend.
// Audit logs accessible via RECORD_ENDPOINTS.AUDIT_TRAIL for specific records.
export const AUDIT_ENDPOINTS = {
	// Placeholder for future implementation
	MY_LOGS: "/audit/my-logs/", // Not yet implemented in backend
} as const;

// ============================================================================
// CONSOLIDATED ENDPOINTS OBJECT
// ============================================================================
export const ENDPOINTS = {
	AUTH: AUTH_ENDPOINTS,
	PROVIDERS: PROVIDER_ENDPOINTS,
	RECORDS: RECORD_ENDPOINTS,
	CONSENTS: CONSENT_ENDPOINTS,
	AUDIT: AUDIT_ENDPOINTS,
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Build full URL from endpoint path
 */
export const buildUrl = (endpoint: string): string => {
	return `${API_BASE_URL}${endpoint}`;
};

/**
 * Build URL with query parameters
 */
export const buildUrlWithParams = (
	endpoint: string,
	params: Record<string, any>,
): string => {
	const url = buildUrl(endpoint);
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			searchParams.append(key, String(value));
		}
	});

	const queryString = searchParams.toString();
	return queryString ? `${url}?${queryString}` : url;
};

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
	page?: number;
	limit?: number;
	sort?: string;
	order?: "asc" | "desc";
}

/**
 * Search parameters interface
 */
export interface SearchParams extends PaginationParams {
	q?: string;
	filter?: string;
}

// ============================================================================
// REQUEST/RESPONSE TYPE DEFINITIONS
// ============================================================================

/**
 * Standard error response format
 */
export interface ApiError {
	error: string;
	details?: string;
}

/**
 * JWT token response
 */
export interface TokenResponse {
	access: string;
	refresh: string;
	user_type: "PATIENT" | "PROVIDER" | "ADMIN";
	email: string;
	email_verified?: boolean;
}

/**
 * Patient registration request
 */
export interface PatientRegisterRequest {
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	phone_number: string;
	nin: string;
	date_of_birth?: string; // YYYY-MM-DD
	blood_group?: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-" | "UNKNOWN";
	genotype?: "AA" | "AS" | "SS" | "AC" | "SC" | "UNKNOWN";
	allergies?: string;
	emergency_contact?: string;
}

/**
 * Doctor registration request
 */
export interface DoctorRegisterRequest {
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	phone_number: string;
	hospital_id: string; // UUID
	license_number: string;
	specialty: string;
}

/**
 * Health record creation request (doctor)
 */
export interface HealthRecordCreateRequest {
	patient_email: string; // Backend finds patient by email
	record_type: "DIAGNOSIS" | "PRESCRIPTION" | "LAB_TEST" | "VACCINATION" | "CONSULTATION" | "OTHER";
	title: string;
	description: string;
}

/**
 * Health record approval request (patient)
 */
export interface HealthRecordApproveRequest {
	otp_code: string; // 6-digit OTP
}

/**
 * Grant consent request
 */
export interface GrantConsentRequest {
	hospital_id: string; // UUID
	doctor_id?: string; // UUID (optional)
	expires_in_hours: number; // 1-720 (max 30 days)
}

/**
 * Revoke consent request
 */
export interface RevokeConsentRequest {
	consent_id: string; // UUID
}

// ============================================================================
// NOTES FOR FRONTEND DEVELOPERS
// ============================================================================

/**
 * IMPORTANT DIFFERENCES FROM MOCK DATA:
 * 
 * 1. Record Types:
 *    - Backend: DIAGNOSIS, PRESCRIPTION, LAB_TEST, VACCINATION, CONSULTATION, OTHER
 *    - Mock had: LAB_RESULT, IMAGING, SURGERY (use LAB_TEST and OTHER instead)
 * 
 * 2. Patient Identification:
 *    - Backend uses patient_email in HealthRecordCreateRequest
 *    - Mock data used patient_nin - update service layer accordingly
 * 
 * 3. Missing Endpoints (Not Yet Implemented in Backend):
 *    - GET /records/my-records/ (use /records/ instead - filters by user)
 *    - GET /records/my-pending-records/ (use /records/pending/ instead)
 *    - GET /consents/my-consents/ (not implemented - consents must be tracked client-side)
 *    - GET /audit/my-logs/ (use /records/{id}/audit-trail/ for record-specific logs)
 *    - GET /records/list/{nin}/ (not in current backend)
 * 
 * 4. Authentication Flow:
 *    Step 1: POST /accounts/nin/interswitch/auth/ → get access_token
 *    Step 2: POST /accounts/nin/full-details/ with {nin, access_token} → get user details
 *    Step 3: POST /accounts/patient/register/ → OTP sent to email
 *    Step 4: POST /accounts/otp/verify/ with {email, otp_code} → get JWT tokens
 * 
 * 5. Doctor Record Creation Flow:
 *    Step 1: POST /records/create_record/ → OTP sent to patient
 *    Step 2: Patient receives email with OTP
 *    Step 3: Patient calls POST /records/{id}/approve/ with OTP
 * 
 * 6. Consent Management:
 *    - Consents are hospital-scoped (optional doctor-specific)
 *    - Backend automatically checks consent when accessing records
 *    - No endpoint to list patient's consents yet
 */
