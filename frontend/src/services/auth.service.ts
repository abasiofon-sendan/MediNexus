import { client } from "../configs/axios";
import { ENDPOINTS } from "../ENDPOINTS";
import type { InterswitchAuthResponse, NINDetailsRequest, NINDetailsResponse } from "#/types/api.types";

// Types
interface LoginRequest {
	email: string;
	password: string;
}

interface LoginResponse {
	access: string;
	refresh: string;
	user_type: "PATIENT" | "PROVIDER" | "ADMIN";
	email: string;
	email_verified?: boolean;
}

interface PatientRegisterRequest {
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	phone_number: string;
	nin: string;
	date_of_birth: string;
	blood_group?: string;
	genotype?: string;
	allergies?: string;
	emergency_contact?: string;
}

interface DoctorRegisterRequest {
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	phone_number: string;
	hospital_id: string;
	license_number: string;
	specialty: string;
}

interface OTPVerifyRequest {
	email: string;
	otp_code: string;
}

interface Hospital {
	id: string;
	name: string;
	address: string;
	city: string;
	state: string;
}

// Auth Service Functions
export const authService = {
	login: async (data: LoginRequest): Promise<LoginResponse> => {
		const response = await client.post(ENDPOINTS.AUTH.LOGIN, data);
		return response.data;
	},

	patientRegister: async (
		data: PatientRegisterRequest,
	): Promise<{ message: string }> => {
		const response = await client.post(ENDPOINTS.AUTH.PATIENT_REGISTER, data);
		return response.data;
	},

	doctorRegister: async (
		data: DoctorRegisterRequest,
	): Promise<LoginResponse> => {
		const response = await client.post(ENDPOINTS.AUTH.DOCTOR_REGISTER, data);
		return response.data;
	},

	verifyOTP: async (data: OTPVerifyRequest): Promise<LoginResponse> => {
		const response = await client.post(ENDPOINTS.AUTH.OTP_VERIFY, data);
		return response.data;
	},

	resendOTP: async (email: string): Promise<{ message: string }> => {
		const response = await client.post(ENDPOINTS.AUTH.OTP_RESEND, { email });
		return response.data;
	},

	logout: async (): Promise<void> => {
		await client.post(ENDPOINTS.AUTH.LOGOUT);
		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
	},

	refreshToken: async (): Promise<{ access: string }> => {
		const refreshToken = localStorage.getItem("refresh_token");
		const response = await client.post(ENDPOINTS.AUTH.REFRESH_TOKEN, {
			refresh: refreshToken,
		});
		return response.data;
	},

	getHospitals: async (): Promise<Hospital[]> => {
		const response = await client.get(ENDPOINTS.PROVIDERS.HOSPITALS);
		return response.data;
	},

	/**
	 * Get Interswitch access token for NIN verification
	 */
	getInterswitchToken: async (): Promise<string> => {
		const response = await client.post<InterswitchAuthResponse>(ENDPOINTS.AUTH.INTERSWITCH_AUTH);
		return response.data.access_token;
	},

	/**
	 * Verify NIN and get identity details from Interswitch
	 */
	verifyNINAndGetDetails: async (nin: string, accessToken: string): Promise<NINDetailsResponse['data']> => {
		const requestData: NINDetailsRequest = { nin, access_token: accessToken };
		const response = await client.post<NINDetailsResponse>(ENDPOINTS.AUTH.NIN_FULL_DETAILS, requestData);
		return response.data.data;
	},

	/**
	 * Request password reset OTP
	 */
	passwordResetRequest: async (email: string): Promise<{ message: string }> => {
		const response = await client.post<{ message: string }>(ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST, { email });
		return response.data;
	},

	/**
	 * Verify OTP and set new password
	 */
	passwordResetConfirm: async (email: string, otpCode: string, newPassword: string): Promise<{ message: string }> => {
		const response = await client.post<{ message: string }>(ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM, {
			email,
			otp_code: otpCode,
			new_password: newPassword,
		});
		return response.data;
	},
};
