import { client } from "../configs/axios";
import { ENDPOINTS } from "../ENDPOINTS";

// Types
interface LoginRequest {
	email: string;
	password: string;
}

interface LoginResponse {
	user: {
		id: string;
		email: string;
		name: string;
		role: "patient" | "doctor";
	};
	tokens: {
		access_token: string;
		refresh_token: string;
	};
}

interface RegisterRequest {
	name: string;
	email: string;
	password: string;
	nin: string;
	role: "patient" | "doctor";
}

// Auth Service Functions
export const authService = {
	login: async (data: LoginRequest): Promise<LoginResponse> => {
		const response = await client.post(ENDPOINTS.AUTH.LOGIN, data);
		return response.data;
	},

	register: async (data: RegisterRequest): Promise<LoginResponse> => {
		const response = await client.post(ENDPOINTS.AUTH.REGISTER, data);
		return response.data;
	},

	logout: async (): Promise<void> => {
		await client.post(ENDPOINTS.AUTH.LOGOUT);
		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
	},

	refreshToken: async (): Promise<{ access_token: string }> => {
		const refreshToken = localStorage.getItem("refresh_token");
		const response = await client.post(ENDPOINTS.AUTH.REFRESH_TOKEN, {
			refresh_token: refreshToken,
		});
		return response.data;
	},
};

// Example usage:
// const loginResult = await authService.login({ email: 'user@example.com', password: 'password' });
// const registerResult = await authService.register({ name: 'John', email: 'john@example.com', password: 'password', nin: '12345678901', role: 'patient' });
