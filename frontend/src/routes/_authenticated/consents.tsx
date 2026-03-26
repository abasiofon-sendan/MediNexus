import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/consents")({
	component: PatientConsents,
});

function PatientConsents() {
	return (
		<div>
			<h1 className="text-3xl font-bold font-plus-sans text-neutral-900 mb-2">
				Access Consents
			</h1>
			<p className="text-neutral-600 text-base mb-8">
				Manage who can access your medical records
			</p>

			<div className="bg-white rounded-lg p-8 border border-neutral-200 text-center">
				<p className="text-neutral-500">Coming soon...</p>
			</div>
		</div>
	);
}
