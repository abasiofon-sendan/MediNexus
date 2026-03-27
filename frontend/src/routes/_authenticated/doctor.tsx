import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "#/components/layouts/DashboardLayout";
import { doctorNavItems } from "#/config/navigation";
import { useAuthStore } from "#/stores/authStore";

export const Route = createFileRoute("/_authenticated/doctor")({
	beforeLoad: ({ location }) => {
		// Access Zustand store synchronously
		const { isAuthenticated, user } = useAuthStore.getState();

		// Check if user is authenticated
		if (!isAuthenticated) {
			throw redirect({
				to: "/doctor/login",
				search: {
					redirect: location.href,
				},
			});
		}

		// Check if user has correct role (doctor)
		// If patient tries to access doctor routes, redirect to patient dashboard
		if (user?.role === "patient") {
			throw redirect({
				to: "/dashboard",
			});
		}
	},
	component: DoctorLayoutRoute,
});

function DoctorLayoutRoute() {
	return (
		<DashboardLayout role="doctor" navItems={doctorNavItems}>
			<Outlet />
		</DashboardLayout>
	);
}
