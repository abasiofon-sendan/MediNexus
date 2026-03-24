import { ENV } from "./configs/env";

// Environment-based base URLs
const BASE_URLS = {
	development: "http://localhost:3001/api",
	production: "https://example.com/api",
} as const;

// Get the current environment's base URL
export const API_BASE_URL =
	BASE_URLS[ENV.app.env as keyof typeof BASE_URLS] || BASE_URLS.development;

export const AUTH_ENDPOINTS = {
	LOGIN: "/auth/login",
	REGISTER: "/auth/register",
	LOGOUT: "/auth/logout",
	REFRESH_TOKEN: "/auth/refresh",
} as const;

export const ENDPOINTS = {
	AUTH: AUTH_ENDPOINTS,
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
