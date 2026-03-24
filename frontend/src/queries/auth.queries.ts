import { queryOptions } from "@tanstack/react-query";

export const queryKeys = {
	auth: {
		user: ["auth", "user"] as const,
	},
} as const;

export const authQueries = {
	user: (options = {}) =>
		queryOptions({
			queryKey: queryKeys.auth.user,
			queryFn: () => {
				// return authService.getCurrentUser();
			},
			...options,
		}),
};
