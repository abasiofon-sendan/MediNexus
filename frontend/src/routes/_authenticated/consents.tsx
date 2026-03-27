import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
	Plus,
	ShieldCheck,
	Lock,
	Clock,
	Hospital as HospitalIcon,
	User,
	X,
	CaretDown,
	CaretRight,
	Warning,
	Trash
} from "@phosphor-icons/react";
import { 
	consentsService, 
	hospitalsService,
	calculateTimeLeft,
	isConsentExpiringSoon,
	getConsentStatusBadgeVariant,
	getConsentStatusText,
	getConsentDurationPresets
} from "#/services/consents.service";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import type { ConsentLog, Hospital, Doctor, GrantConsentRequest } from "#/types/api.types";

export const Route = createFileRoute("/_authenticated/consents")({
	component: PatientConsents,
});

function PatientConsents() {
	const [showGrantModal, setShowGrantModal] = useState(false);
	const [showRevokeModal, setShowRevokeModal] = useState<ConsentLog | null>(null);
	const [expandedSection, setExpandedSection] = useState<'expired' | null>(null);

	const queryClient = useQueryClient();

	// Fetch consents
	const { data: consents = [], isLoading: consentsLoading } = useQuery({
		queryKey: ["consents"],
		queryFn: consentsService.getMyConsents,
	});

	// Separate consents by status
	const activeConsents = consents.filter(consent => 
		!consent.is_revoked && new Date(consent.expires_at) > new Date()
	);
	const expiredConsents = consents.filter(consent => 
		!consent.is_revoked && new Date(consent.expires_at) <= new Date()
	);
	const revokedConsents = consents.filter(consent => consent.is_revoked);

	// Revoke consent mutation
	const revokeConsentMutation = useMutation({
		mutationFn: (consentId: string) => consentsService.revokeConsent(consentId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["consents"] });
			queryClient.invalidateQueries({ queryKey: ["consentStats"] });
			queryClient.invalidateQueries({ queryKey: ["recentActivity"] });
			setShowRevokeModal(null);
		},
		onError: (error: any) => {
			alert(error.message || "Failed to revoke consent");
		}
	});

	const handleRevokeConsent = () => {
		if (showRevokeModal) {
			revokeConsentMutation.mutate(showRevokeModal.id);
		}
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold font-plus-sans text-neutral-900 mb-2">
						Access Consents
					</h1>
					<p className="text-neutral-600 text-base">
						Control which hospitals and doctors can access your medical records
					</p>
				</div>
				
				<Button 
					onClick={() => setShowGrantModal(true)}
					className="flex items-center gap-2"
				>
					<Plus size={20} />
					Grant Access
				</Button>
			</div>

			{/* Active Consents */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold font-plus-sans text-neutral-900">
						Active Consents
					</h2>
					<Badge variant="approved" size="sm">
						{activeConsents.length} active
					</Badge>
				</div>

				{consentsLoading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((id) => (
							<ConsentSkeleton key={`skeleton-${id}`} />
						))}
					</div>
				) : activeConsents.length === 0 ? (
					<div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
						<ShieldCheck size={48} className="mx-auto mb-4 text-neutral-300" />
						<p className="text-neutral-900 font-medium mb-2">No active consents</p>
						<p className="text-neutral-600 text-sm mb-4">
							Grant access to hospitals so doctors can view your records
						</p>
						<Button onClick={() => setShowGrantModal(true)} className="flex items-center gap-2">
							<Plus size={16} />
							Grant Your First Consent
						</Button>
					</div>
				) : (
					<div className="space-y-4">
						{activeConsents.map((consent) => (
							<ConsentCard 
								key={consent.id} 
								consent={consent}
								onRevoke={() => setShowRevokeModal(consent)}
								showActions={true}
							/>
						))}
					</div>
				)}
			</div>

			{/* Expired & Revoked Consents */}
			{(expiredConsents.length > 0 || revokedConsents.length > 0) && (
				<div className="space-y-4">
					<button
						type="button"
						onClick={() => setExpandedSection(expandedSection === 'expired' ? null : 'expired')}
						className="flex items-center gap-2 text-lg font-semibold text-neutral-700 hover:text-neutral-900"
					>
						{expandedSection === 'expired' ? <CaretDown size={20} /> : <CaretRight size={20} />}
						Expired & Revoked Consents
						<Badge variant="inactive" size="sm">
							{expiredConsents.length + revokedConsents.length}
						</Badge>
					</button>

					{expandedSection === 'expired' && (
						<div className="space-y-4 pl-6">
							{expiredConsents.map((consent) => (
								<ConsentCard 
									key={consent.id} 
									consent={consent}
									onRevoke={() => {}}
									showActions={false}
								/>
							))}
							{revokedConsents.map((consent) => (
								<ConsentCard 
									key={consent.id} 
									consent={consent}
									onRevoke={() => {}}
									showActions={false}
								/>
							))}
						</div>
					)}
				</div>
			)}

			{/* Modals */}
			{showGrantModal && (
				<GrantConsentModal 
					onClose={() => setShowGrantModal(false)}
					onSuccess={() => {
						setShowGrantModal(false);
						queryClient.invalidateQueries({ queryKey: ["consents"] });
						queryClient.invalidateQueries({ queryKey: ["consentStats"] });
						queryClient.invalidateQueries({ queryKey: ["recentActivity"] });
					}}
				/>
			)}

			{showRevokeModal && (
				<RevokeConsentModal
					consent={showRevokeModal}
					onRevoke={handleRevokeConsent}
					onClose={() => setShowRevokeModal(null)}
					isLoading={revokeConsentMutation.isPending}
				/>
			)}
		</div>
	);
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface ConsentCardProps {
	consent: ConsentLog;
	onRevoke: () => void;
	showActions: boolean;
}

function ConsentCard({ consent, onRevoke, showActions }: ConsentCardProps) {
	const statusBadgeVariant = getConsentStatusBadgeVariant(consent);
	const statusText = getConsentStatusText(consent);
	const timeLeft = calculateTimeLeft(consent.expires_at);
	const isExpiringSoon = isConsentExpiringSoon(consent.expires_at);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	return (
		<div className="bg-white border border-neutral-200 rounded-lg p-6 hover:border-neutral-300 transition-colors">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1 min-w-0">
					<div className="flex items-start gap-3 mb-3">
						<div className="flex-shrink-0 mt-1">
							<div className="p-2 bg-teal-50 rounded-lg">
								<ShieldCheck size={20} className="text-teal-600" />
							</div>
						</div>
						
						<div className="flex-1 min-w-0">
							<h3 className="text-lg font-semibold text-neutral-900 mb-1 truncate">
								{consent.hospital_name}
							</h3>
							
							<div className="flex items-center gap-4 text-sm text-neutral-600 mb-2">
								{consent.doctor_email ? (
									<div className="flex items-center gap-2">
										<User size={16} />
										<span className="truncate">Dr. {consent.doctor_email.split('@')[0].replace('.', ' ')}</span>
									</div>
								) : (
									<div className="flex items-center gap-2">
										<HospitalIcon size={16} />
										<span>Hospital-wide access</span>
									</div>
								)}
								<div className="flex items-center gap-2">
									<Clock size={16} />
									<span>Granted {formatDate(consent.granted_at)}</span>
								</div>
							</div>

							<div className="flex items-center gap-3 flex-wrap">
								<Badge variant={statusBadgeVariant as any} size="sm">
									{statusText}
								</Badge>

								{!consent.is_revoked && (
									<span className={`text-xs font-medium ${
										isExpiringSoon ? 'text-orange-600' : 'text-neutral-500'
									}`}>
										{timeLeft === 'Expired' ? 'Expired' : `Expires in ${timeLeft}`}
									</span>
								)}

								{consent.is_revoked && (
									<span className="text-xs text-neutral-500">
										Revoked {formatDate(consent.granted_at)}
									</span>
								)}
							</div>

							{/* Warning for expiring soon */}
							{showActions && isExpiringSoon && timeLeft !== 'Expired' && (
								<div className="mt-3 flex items-center gap-2 text-xs text-orange-700 bg-orange-50 px-3 py-2 rounded-lg">
									<Warning size={16} />
									<span>This consent will expire soon. Consider renewing if needed.</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{showActions && !consent.is_revoked && timeLeft !== 'Expired' && (
					<Button
						variant="outline"
						size="sm"
						onClick={onRevoke}
						className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
					>
						<Trash size={16} />
						Revoke
					</Button>
				)}
			</div>
		</div>
	);
}

function ConsentSkeleton() {
	return (
		<div className="bg-white border border-neutral-200 rounded-lg p-6">
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-3 flex-1">
					<div className="w-11 h-11 bg-neutral-200 rounded-lg animate-pulse flex-shrink-0" />
					<div className="flex-1 space-y-3">
						<div className="h-6 bg-neutral-200 rounded animate-pulse w-2/3" />
						<div className="flex items-center gap-4">
							<div className="h-4 bg-neutral-200 rounded animate-pulse w-32" />
							<div className="h-4 bg-neutral-200 rounded animate-pulse w-24" />
						</div>
						<div className="flex items-center gap-3">
							<div className="h-6 bg-neutral-200 rounded-full animate-pulse w-16" />
							<div className="h-4 bg-neutral-200 rounded animate-pulse w-20" />
						</div>
					</div>
				</div>
				<div className="h-8 bg-neutral-200 rounded animate-pulse w-20 flex-shrink-0" />
			</div>
		</div>
	);
}

// Modal Components
interface GrantConsentModalProps {
	onClose: () => void;
	onSuccess: () => void;
}

function GrantConsentModal({ onClose, onSuccess }: GrantConsentModalProps) {
	const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
	const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
	const [expiresInHours, setExpiresInHours] = useState(168); // 1 week default
	const [showDoctorSelect, setShowDoctorSelect] = useState(false);

	// Fetch hospitals
	const { data: hospitals = [], isLoading: hospitalsLoading } = useQuery({
		queryKey: ["hospitals"],
		queryFn: hospitalsService.getHospitals,
	});

	// Fetch doctors for selected hospital
	const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
		queryKey: ["doctors", selectedHospital?.id],
		queryFn: () => hospitalsService.getDoctorsByHospital(selectedHospital!.id),
		enabled: !!selectedHospital && showDoctorSelect,
	});

	// Grant consent mutation
	const grantConsentMutation = useMutation({
		mutationFn: (request: GrantConsentRequest) => consentsService.grantConsent(request),
		onSuccess: onSuccess,
		onError: (error: any) => {
			alert(error.message || "Failed to grant consent");
		}
	});

	const durationPresets = getConsentDurationPresets();

	const handleGrantConsent = () => {
		if (selectedHospital) {
			const request: GrantConsentRequest = {
				hospital_id: selectedHospital.id,
				doctor_id: selectedDoctor?.id || null,
				expires_in_hours: expiresInHours
			};
			grantConsentMutation.mutate(request);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden">
				<div className="flex items-center justify-between p-6 border-b border-neutral-200">
					<h2 className="text-xl font-semibold text-neutral-900">Grant Hospital Access</h2>
					<button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
						<X size={24} />
					</button>
				</div>
				
				<div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
					{/* Hospital Selection */}
					<div>
						<label htmlFor="hospital-select" className="block text-sm font-medium text-neutral-900 mb-3">
							Select Hospital
						</label>
						
						{hospitalsLoading ? (
							<div className="space-y-2">
								{[1, 2, 3].map((id) => (
									<div key={id} className="h-12 bg-neutral-200 rounded-lg animate-pulse" />
								))}
							</div>
						) : (
							<div className="space-y-2 max-h-48 overflow-y-auto">
								{hospitals.map((hospital) => (
									<button
										key={hospital.id}
										type="button"
										onClick={() => {
											setSelectedHospital(hospital);
											setSelectedDoctor(null);
										}}
										className={`w-full text-left p-3 border rounded-lg transition-colors ${
											selectedHospital?.id === hospital.id
												? 'border-primary-300 bg-primary-50 text-primary-900'
												: 'border-neutral-300 bg-white hover:border-neutral-400'
										}`}
									>
										<div className="font-medium text-sm">{hospital.name}</div>
										<div className="text-xs text-neutral-600 truncate">{hospital.address}</div>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Doctor Selection (Optional) */}
					{selectedHospital && (
						<div>
							<div className="flex items-center justify-between mb-3">
								<div className="block text-sm font-medium text-neutral-900">
									Specific Doctor (Optional)
								</div>
								<button
									type="button"
									onClick={() => {
										setShowDoctorSelect(!showDoctorSelect);
										setSelectedDoctor(null);
									}}
									className="text-sm text-primary-600 hover:text-primary-700"
								>
									{showDoctorSelect ? 'Hospital-wide access' : 'Select specific doctor'}
								</button>
							</div>

							{showDoctorSelect && (
								<div className="space-y-2 max-h-32 overflow-y-auto">
									{doctorsLoading ? (
										<div className="h-8 bg-neutral-200 rounded animate-pulse" />
									) : doctors.length === 0 ? (
										<p className="text-sm text-neutral-500 py-2">No doctors found</p>
									) : (
										doctors.map((doctor) => (
											<button
												key={doctor.id}
												type="button"
												onClick={() => setSelectedDoctor(doctor)}
												className={`w-full text-left p-2 border rounded text-sm transition-colors ${
													selectedDoctor?.id === doctor.id
														? 'border-primary-300 bg-primary-50 text-primary-900'
														: 'border-neutral-200 hover:border-neutral-300'
												}`}
											>
												{doctor.full_name} - {doctor.specialty.replace('_', ' ')}
											</button>
										))
									)}
								</div>
							)}
						</div>
					)}

					{/* Duration Selection */}
					<div>
						<div className="block text-sm font-medium text-neutral-900 mb-3">
							Access Duration
						</div>
						<div className="grid grid-cols-2 gap-2">
							{durationPresets.map((preset) => (
								<button
									key={preset.value}
									type="button"
									onClick={() => setExpiresInHours(preset.value)}
									className={`p-3 text-sm border rounded-lg transition-colors ${
										expiresInHours === preset.value
											? 'border-primary-300 bg-primary-50 text-primary-900'
											: 'border-neutral-300 hover:border-neutral-400'
									}`}
								>
									{preset.label}
								</button>
							))}
						</div>
					</div>

					{/* Summary */}
					{selectedHospital && (
						<div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
							<h4 className="text-sm font-medium text-neutral-900 mb-2">Consent Summary</h4>
							<div className="space-y-1 text-sm text-neutral-700">
								<p><strong>Hospital:</strong> {selectedHospital.name}</p>
								<p><strong>Access:</strong> {selectedDoctor ? `Dr. ${selectedDoctor.full_name}` : 'All doctors'}</p>
								<p><strong>Duration:</strong> {durationPresets.find(p => p.value === expiresInHours)?.label}</p>
							</div>
						</div>
					)}
				</div>

				<div className="flex justify-end gap-3 p-6 border-t border-neutral-200">
					<Button variant="outline" onClick={onClose} disabled={grantConsentMutation.isPending}>
						Cancel
					</Button>
					<Button 
						onClick={handleGrantConsent}
						disabled={!selectedHospital || grantConsentMutation.isPending}
						className="bg-teal-600 hover:bg-teal-700"
					>
						{grantConsentMutation.isPending ? 'Granting...' : 'Grant Access'}
					</Button>
				</div>
			</div>
		</div>
	);
}

interface RevokeConsentModalProps {
	consent: ConsentLog;
	onRevoke: () => void;
	onClose: () => void;
	isLoading: boolean;
}

function RevokeConsentModal({ consent, onRevoke, onClose, isLoading }: RevokeConsentModalProps) {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-lg max-w-md w-full">
				<div className="flex items-center justify-between p-6 border-b border-neutral-200">
					<h2 className="text-xl font-semibold text-neutral-900">Revoke Consent</h2>
					<button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
						<X size={24} />
					</button>
				</div>
				
				<div className="p-6">
					<div className="flex items-start gap-3 mb-6">
						<div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
							<Lock size={20} className="text-red-600" />
						</div>
						<div>
							<h3 className="font-medium text-neutral-900 mb-2">
								{consent.hospital_name}
							</h3>
							<p className="text-sm text-neutral-600 mb-4">
								{consent.doctor_email 
									? `Dr. ${consent.doctor_email.split('@')[0].replace('.', ' ')} will lose access to your records immediately.`
									: 'All doctors at this hospital will lose access to your records immediately.'
								}
							</p>
							<p className="text-sm text-red-600 font-medium">
								This action cannot be undone. You'll need to grant a new consent for future access.
							</p>
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-3 p-6 border-t border-neutral-200">
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button 
						onClick={onRevoke}
						disabled={isLoading}
						className="bg-red-600 hover:bg-red-700"
					>
						{isLoading ? 'Revoking...' : 'Revoke Access'}
					</Button>
				</div>
			</div>
		</div>
	);
}
