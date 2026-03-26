import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "#/stores/authStore";

export const Route = createFileRoute("/_authenticated/doctor/dashboard")({
	component: DoctorDashboard,
});

function DoctorDashboard() {
	const { user } = useAuthStore();

	return (
		<div>
			<h1 className="text-3xl font-bold font-plus-sans text-neutral-900 mb-2">
				Welcome, Dr. {user?.last_name}
			</h1>
			<p className="text-neutral-600 text-base mb-8">
				Provider portal for patient records and consent verification
			</p>

			{/* Placeholder content */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div className="bg-white rounded-lg p-6 border border-neutral-200">
					<h3 className="font-semibold text-neutral-900 mb-2">Quick Actions</h3>
					<p className="text-neutral-600 text-sm">
						Dashboard content coming soon
					</p>
				</div>
			</div>
		</div>
	);
}
