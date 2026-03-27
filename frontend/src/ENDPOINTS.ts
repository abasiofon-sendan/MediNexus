// API Base URL - using production endpoint
export const API_BASE_URL = "https://medinexus-backend-59tf.onrender.com/api";

export const AUTH_ENDPOINTS = {
	LOGIN: "/auth/login/",
	PATIENT_REGISTER: "/auth/patient/register/",
	DOCTOR_REGISTER: "/providers/doctors/register/",
	OTP_VERIFY: "/auth/otp/verify/",
	OTP_RESEND: "/auth/otp/resend/",
	LOGOUT: "/auth/logout/",
	REFRESH_TOKEN: "/auth/refresh/",
} as const;

export const PROVIDER_ENDPOINTS = {
	HOSPITALS: "/providers/hospitals/",
	DOCTORS: "/providers/doctors/",
	DOCTOR_BY_HOSPITAL: (hospitalId: string) => `/providers/doctors/?hospital_id=${hospitalId}`,
} as const;

export const RECORD_ENDPOINTS = {
	// Patient endpoints (to be added by backend)
	MY_RECORDS: "/records/my-records/",
	MY_PENDING_RECORDS: "/records/my-pending-records/",
	
	// Existing endpoints
	LIST_BY_NIN: (nin: string) => `/records/list/${nin}/`,
	CREATE: "/records/create/",
	APPROVE: (id: string) => `/records/${id}/approve/`,
	REJECT: (id: string) => `/records/${id}/reject/`,
} as const;

export const CONSENT_ENDPOINTS = {
	// Patient endpoints (to be added by backend)
	MY_CONSENTS: "/consents/my-consents/",
	
	// Existing endpoints
	GRANT: "/consents/grant/",
	REVOKE: "/consents/revoke/",
} as const;

export const AUDIT_ENDPOINTS = {
	MY_LOGS: "/audit/my-logs/",
} as const;

export const ENDPOINTS = {
	AUTH: AUTH_ENDPOINTS,
	PROVIDERS: PROVIDER_ENDPOINTS,
	RECORDS: RECORD_ENDPOINTS,
	CONSENTS: CONSENT_ENDPOINTS,
	AUDIT: AUDIT_ENDPOINTS,
} as const;

// Utility function to build full URL
export const buildUrl = (endpoint: string): string => {
	return `${API_BASE_URL}${endpoint}`;
};

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

export interface PaginationParams {
	page?: number;
	limit?: number;
	sort?: string;
	order?: "asc" | "desc";
}

export interface SearchParams extends PaginationParams {
	q?: string;
	filter?: string;
}
