const ENV = {
	app: {
		env: process.env.NODE_ENV || "development",
		baseUrl: process.env.VITE_API_BASE_URL || "http://localhost:3001/api",
		name: process.env.VITE_APP_NAME || "MediNexus",
		version: process.env.VITE_APP_VERSION || "1.0.0",
	},
	auth: {
		tokenKey: "access_token",
		refreshTokenKey: "refresh_token",
		sessionTimeout: 30 * 60 * 1000, // 30 minutes
	},
	api: {
		timeout: 10000,
		retries: 3,
	},
	features: {
		enableLogging: process.env.NODE_ENV === "development",
		enableAnalytics: process.env.NODE_ENV === "production",
	},
} as const;

export { ENV };
