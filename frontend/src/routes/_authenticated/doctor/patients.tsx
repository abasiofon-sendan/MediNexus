import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/doctor/patients")({
	component: DoctorPatients,
});

function DoctorPatients() {
	return (
		<div>
			<h1 className="text-3xl font-bold font-plus-sans text-neutral-900 mb-2">
				My Patients
			</h1>
			<p className="text-neutral-600 text-base mb-8">
				Manage your patient list and access history
			</p>

			<div className="bg-white rounded-lg p-8 border border-neutral-200 text-center">
				<p className="text-neutral-500">Coming soon...</p>
			</div>
		</div>
	);
}
