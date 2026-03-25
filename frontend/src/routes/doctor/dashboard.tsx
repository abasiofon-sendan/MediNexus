import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "#/stores/authStore";

export const Route = createFileRoute("/doctor/dashboard")({
	component: DoctorDashboard,
});

function DoctorDashboard() {
	const { user } = useAuthStore();

	return (
		<div className="min-h-screen bg-[#0D1F2D] p-8">
			<div className="max-w-7xl mx-auto">
				<h1 className="text-4xl font-bold text-white font-plus-sans mb-4">
					Welcome, Dr. {user?.last_name}!
				</h1>
				<p className="text-white/60 text-lg">
					Provider Dashboard - Coming Soon
				</p>
			</div>
		</div>
	);
}
