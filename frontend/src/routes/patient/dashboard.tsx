import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "#/stores/authStore";

export const Route = createFileRoute("/patient/dashboard")({
	component: PatientDashboard,
});

function PatientDashboard() {
	const { user } = useAuthStore();

	return (
		<div className="min-h-screen bg-[#0D1F2D] p-8">
			<div className="max-w-7xl mx-auto">
				<h1 className="text-4xl font-bold text-white font-plus-sans mb-4">
					Welcome, {user?.first_name}!
				</h1>
				<p className="text-white/60 text-lg">Patient Dashboard - Coming Soon</p>
			</div>
		</div>
	);
}
