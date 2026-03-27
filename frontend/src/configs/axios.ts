import axios from "axios";
import { API_BASE_URL, ENDPOINTS } from "../ENDPOINTS";

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown | null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(undefined);
		}
	});
	failedQueue = [];
};

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
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then(() => client(originalRequest))
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const refreshToken = localStorage.getItem("refresh_token");

			if (!refreshToken) {
				localStorage.removeItem("access_token");
				localStorage.removeItem("refresh_token");
				window.location.href = "/login";
				return Promise.reject(error);
			}

			try {
				const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.AUTH.TOKEN_REFRESH}`, {
					refresh: refreshToken,
				});

				const { access } = response.data;
				localStorage.setItem("access_token", access);

				processQueue(null);
				isRefreshing = false;

				originalRequest.headers.Authorization = `Bearer ${access}`;
				return client(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError);
				isRefreshing = false;

				localStorage.removeItem("access_token");
				localStorage.removeItem("refresh_token");
				window.location.href = "/login";
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	},
);

export { client };
