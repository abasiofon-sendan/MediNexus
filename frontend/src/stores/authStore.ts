import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	role: "patient" | "doctor";
	phone_number?: string;
}

interface Tokens {
	access: string;
	refresh: string;
}

interface AuthState {
	user: User | null;
	tokens: Tokens | null;
	isAuthenticated: boolean;

	// Actions
	login: (tokens: Tokens, user: User) => void;
	logout: () => void;
	setUser: (user: User) => void;
	setTokens: (tokens: Tokens) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			tokens: null,
			isAuthenticated: false,

			login: (tokens, user) => {
				// Store tokens in localStorage for axios interceptor
				localStorage.setItem("access_token", tokens.access);
				localStorage.setItem("refresh_token", tokens.refresh);

				set({
					user,
					tokens,
					isAuthenticated: true,
				});
			},

			logout: () => {
				// Clear localStorage
				localStorage.removeItem("access_token");
				localStorage.removeItem("refresh_token");

				set({
					user: null,
					tokens: null,
					isAuthenticated: false,
				});
			},

			setUser: (user) => {
				set({ user });
			},

			setTokens: (tokens) => {
				// Update localStorage
				localStorage.setItem("access_token", tokens.access);
				localStorage.setItem("refresh_token", tokens.refresh);

				set({ tokens });
			},
		}),
		{
			name: "medinexus-auth",
			partialize: (state) => ({
				user: state.user,
				tokens: state.tokens,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);
