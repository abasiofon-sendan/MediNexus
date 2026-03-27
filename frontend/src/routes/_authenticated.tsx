import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "#/components/layouts/DashboardLayout";
import { patientNavItems } from "#/config/navigation";
import { useAuthStore } from "#/stores/authStore";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: ({ location }) => {
		const { isAuthenticated, user } = useAuthStore.getState();

		// Check if user is authenticated
		if (!isAuthenticated) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
		}

		// Check if user has correct role (patient)
		// If doctor tries to access patient routes, redirect to doctor dashboard
		if (user?.role === "doctor") {
			throw redirect({
				to: "/doctor/dashboard",
			});
		}
	},
	component: PatientAuthLayout,
});

function PatientAuthLayout() {
	return (
		<DashboardLayout role="patient" navItems={patientNavItems}>
			<Outlet />
		</DashboardLayout>
	);
}
