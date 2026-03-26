import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/doctor/records")({
	component: DoctorRecords,
});

function DoctorRecords() {
	return (
		<div>
			<h1 className="text-3xl font-bold font-plus-sans text-neutral-900 mb-2">
				Patient Records
			</h1>
			<p className="text-neutral-600 text-base mb-8">
				Search and view patient medical records
			</p>

			<div className="bg-white rounded-lg p-8 border border-neutral-200 text-center">
				<p className="text-neutral-500">Coming soon...</p>
			</div>
		</div>
	);
}
