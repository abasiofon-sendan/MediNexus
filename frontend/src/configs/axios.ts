import axios from "axios";
import { API_BASE_URL } from "../ENDPOINTS";

// Create axios instance
const client = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to add auth token
client.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("access_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor for error handling
client.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response?.status === 401) {
			// Clear token and redirect to login if unauthorized
			localStorage.removeItem("access_token");
			localStorage.removeItem("refresh_token");
			window.location.href = "/login";
		}
		return Promise.reject(error);
	},
);

export { client };
