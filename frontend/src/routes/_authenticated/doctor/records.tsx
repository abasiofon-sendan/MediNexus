import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
	MagnifyingGlass,
	ShieldCheck,
	Warning,
	FileText,
	Eye,
	Clock,
	User,
	Hospital as HospitalIcon,
	X,
	Plus,
	CaretDown,
	Funnel,
} from "@phosphor-icons/react";
import {
	doctorService,
	validateEmail,
	obfuscateEmail,
} from "#/services/doctor.service";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import type {
	HealthRecordDetail,
	PatientSearchResult,
	RecordType,
} from "#/types/api.types";

export const Route = createFileRoute("/_authenticated/doctor/records")({
	component: DoctorRecords,
	validateSearch: (search: Record<string, unknown>) => ({
		email: search.email as string | undefined,
	}),
});

function DoctorRecords() {
	const navigate = useNavigate();
	const { email: emailFromParams } = Route.useSearch();

	const [searchEmail, setSearchEmail] = useState(emailFromParams || "");
	const [searchResult, setSearchResult] = useState<PatientSearchResult | null>(
		null,
	);
	const [recentSearches, setRecentSearches] = useState<string[]>([]);
	const [selectedRecord, setSelectedRecord] =
		useState<HealthRecordDetail | null>(null);
	const [filterType, setFilterType] = useState<RecordType | "ALL">("ALL");
	const [showFilters, setShowFilters] = useState(false);

	// Search patient records mutation
	const searchMutation = useMutation({
		mutationFn: (email: string) => doctorService.searchPatientRecordsByEmail(email),
		onSuccess: (result) => {
			setSearchResult(result);
			// Add to recent searches (avoid duplicates)
			setRecentSearches((prev) => {
				const filtered = prev.filter((e) => e !== result.email);
				return [result.email, ...filtered].slice(0, 5);
			});
		},
		onError: (error: any) => {
			alert(error.message || "Failed to search patient records");
		},
	});

	// Auto-search if email provided in URL params
	useEffect(() => {
		if (emailFromParams && validateEmail(emailFromParams)) {
			searchMutation.mutate(emailFromParams);
		}
	}, [emailFromParams, searchMutation]);

	const handleSearch = () => {
		const cleanEmail = searchEmail.trim();

		if (!validateEmail(cleanEmail)) {
			alert("Please enter a valid email address");
			return;
		}

		searchMutation.mutate(cleanEmail);
	};

	const handleEmailInputChange = (value: string) => {
		setSearchEmail(value.trim());
	};

	const handleRecentSearch = (email: string) => {
		setSearchEmail(email);
		searchMutation.mutate(email);
	};

	const clearSearch = () => {
		setSearchResult(null);
		setSearchEmail("");
		setFilterType("ALL");
	};

	// Filter records by type
	const filteredRecords =
		searchResult?.records.filter(
			(record) => filterType === "ALL" || record.record_type === filterType,
		) || [];

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold font-plus-sans text-black mb-2">
						Patient Records
					</h1>
					<p className="text-black/75 text-base">
						Search and view patient medical records with active consent
					</p>
				</div>

				<Button
					onClick={() => navigate({ to: "/doctor/create" })}
					className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
				>
					<Plus size={20} />
					Create Record
				</Button>
			</div>

			{/* Search Section */}
			<div className="bg-white rounded-lg p-6 border border-white/10">
				<div className="flex flex-col md:flex-row gap-4 mb-4">
					<div className="flex-1">
						<label
							htmlFor="email-search"
							className="block text-sm font-medium text-gray-900 mb-2"
						>
							Patient Email Address
						</label>
						<div className="relative">
							<Input
								id="email-search"
								type="email"
								value={searchEmail}
								onChange={(e) => handleEmailInputChange(e.target.value)}
								placeholder="Enter patient email (e.g., patient@example.com)"
								className="pl-10 pr-4"
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleSearch();
									}
								}}
							/>
							<MagnifyingGlass
								size={20}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
							/>
						</div>

						{/* Validation hint */}
						{searchEmail && !validateEmail(searchEmail) && (
							<p className="text-sm text-red-600 mt-1">
								Please enter a valid email address
							</p>
						)}
					</div>

					<div className="flex items-end gap-2">
						<Button
							onClick={handleSearch}
							disabled={!validateEmail(searchEmail) || searchMutation.isPending}
							className="flex items-center gap-2"
						>
							<MagnifyingGlass size={16} />
							{searchMutation.isPending ? "Searching..." : "Search"}
						</Button>

						{searchResult && (
							<Button
								variant="outline"
								onClick={clearSearch}
								className="flex items-center gap-2"
							>
								<X size={16} />
								Clear
							</Button>
						)}
					</div>
				</div>

				{/* Recent Searches */}
				{recentSearches.length > 0 && !searchResult && (
					<div>
						<p className="text-sm font-medium text-gray-700 mb-2">
							Recent Searches:
						</p>
						<div className="flex flex-wrap gap-2">
							{recentSearches.map((email) => (
								<button
									key={email}
									type="button"
									onClick={() => handleRecentSearch(email)}
									className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
								>
									{obfuscateEmail(email)}
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Loading State */}
			{searchMutation.isPending && (
				<div className="bg-white rounded-lg p-8 border border-white/10">
					<div className="text-center">
						<div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
						<p className="text-gray-600">Searching patient records...</p>
					</div>
				</div>
			)}

			{/* Search Results */}
			{searchResult && !searchMutation.isPending && (
				<div className="space-y-6">
					{/* Consent Verification Banner */}
					<ConsentBanner
						consent={searchResult.consent}
						patientInfo={searchResult.patientInfo}
					/>

					{/* Records Section */}
					{searchResult.consent.hasConsent && (
						<>
							{/* Filters and Stats */}
							<div className="bg-white rounded-lg p-4 border border-white/10">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-semibold text-gray-900">
										Patient Records ({filteredRecords.length})
									</h3>

									<button
										type="button"
										onClick={() => setShowFilters(!showFilters)}
										className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
									>
										<Funnel size={16} />
										Filters
										<CaretDown
											size={14}
											className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
										/>
									</button>
								</div>

								{/* Filter Options */}
								{showFilters && (
									<div className="border-t border-gray-200 pt-4">
										<p className="text-sm font-medium text-gray-700 mb-2">
											Record Type:
										</p>
										<div className="flex flex-wrap gap-2">
											{[
												"ALL",
												"LAB_TEST",
												"VACCINATION",
												"CONSULTATION",
											].map((type) => (
												<button
													key={type}
													type="button"
													onClick={() =>
														setFilterType(type as RecordType | "ALL")
													}
													className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
														filterType === type
															? "bg-teal-50 border-teal-200 text-teal-800"
															: "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
													}`}
												>
													{type.replace("_", " ")}
												</button>
											))}
										</div>
									</div>
								)}
							</div>

							{/* Records List */}
							{filteredRecords.length === 0 ? (
								<div className="bg-white rounded-lg p-8 border border-white/10 text-center">
									<FileText size={48} className="mx-auto mb-4 text-gray-300" />
									<p className="text-gray-900 font-medium mb-2">
										No records found
									</p>
									<p className="text-gray-600 text-sm">
										{searchResult.records.length === 0
											? "This patient doesn't have any medical records yet."
											: "No records match the selected filter."}
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{filteredRecords.map((record) => (
										<RecordCard
											key={record.id}
											record={record}
											onClick={() => setSelectedRecord(record)}
										/>
									))}
								</div>
							)}
						</>
					)}
				</div>
			)}

			{/* No Search State */}
			{!searchResult && !searchMutation.isPending && (
				<div className="bg-white rounded-lg p-8 border border-white/10 text-center">
					<MagnifyingGlass size={48} className="mx-auto mb-4 text-gray-300" />
					<p className="text-gray-900 font-medium mb-2">
						Search Patient Records
					</p>
					<p className="text-gray-600 text-sm mb-4">
						Enter a patient's 11-digit NIN to view their medical records
					</p>
					<p className="text-xs text-gray-500">
						Note: You can only view records for patients who have granted you
						active consent
					</p>
				</div>
			)}

			{/* Record Viewer Modal */}
			{selectedRecord && (
				<RecordViewerModal
					record={selectedRecord}
					onClose={() => setSelectedRecord(null)}
				/>
			)}
		</div>
	);
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface ConsentBannerProps {
	consent: PatientSearchResult["consent"];
	patientInfo?: PatientSearchResult["patientInfo"];
}

function ConsentBanner({ consent, patientInfo }: ConsentBannerProps) {
	if (consent.hasConsent) {
		return (
			<div className="bg-green-50 border border-green-200 rounded-lg p-4">
				<div className="flex items-start gap-3">
					<ShieldCheck
						size={20}
						className="text-green-600 flex-shrink-0 mt-0.5"
					/>
					<div className="flex-1">
						<div className="flex items-center justify-between">
							<h4 className="font-medium text-green-900">
								Active Consent Verified
							</h4>
							{patientInfo && (
								<Badge variant="approved" size="sm">
									{patientInfo.name}
								</Badge>
							)}
						</div>
						<p className="text-sm text-green-700 mt-1">
							You have permission to view this patient's medical records
							{consent.expiresAt && (
								<span>
									{" "}
									until {new Date(consent.expiresAt).toLocaleDateString()}
								</span>
							)}
						</p>
						{consent.isExpiringSoon && (
							<p className="text-sm text-orange-600 mt-1 font-medium">
								⚠️ Consent expires soon - patient may need to renew access
							</p>
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-red-50 border border-red-200 rounded-lg p-4">
			<div className="flex items-start gap-3">
				<Warning size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
				<div>
					<h4 className="font-medium text-red-900 mb-1">
						No Active Consent Found
					</h4>
					<p className="text-sm text-red-700 mb-3">
						This patient has not granted you permission to view their medical
						records.
					</p>
					<div className="text-sm text-red-600">
						<p className="font-medium mb-1">What you can do:</p>
						<ul className="list-disc list-inside space-y-1 text-red-600">
							<li>
								Ask the patient to grant consent through their MediNexus app
							</li>
							<li>Verify you're using the correct patient NIN</li>
							<li>Contact hospital administration if this seems incorrect</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

interface RecordCardProps {
	record: HealthRecordDetail;
	onClick: () => void;
}

function RecordCard({ record, onClick }: RecordCardProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getRecordIcon = (type: RecordType) => {
		switch (type) {
			case "LAB_TEST":
				return <FileText size={18} />;
			case "VACCINATION":
				return <User size={18} />;
			case "CONSULTATION":
				return <FileText size={18} />;
			default:
				return <FileText size={18} />;
		}
	};

	const getRecordBadge = (record: HealthRecordDetail) => {
		if (record.is_approved) return "approved";
		if (record.is_rejected) return "rejected";
		return "pending";
	};

	return (
		<button
			type="button"
			className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer text-left"
			onClick={onClick}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-3 flex-1 min-w-0">
					<div className="flex-shrink-0 mt-1">
						<div className="p-2 bg-teal-50 rounded-lg text-teal-600">
							{getRecordIcon(record.record_type)}
						</div>
					</div>

					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-2 mb-2">
							<h3 className="font-semibold text-gray-900 truncate">
								{record.title}
							</h3>
							<Badge variant={getRecordBadge(record) as any} size="sm">
								{getRecordBadge(record)}
							</Badge>
						</div>

						<div className="flex items-center gap-4 text-sm text-gray-600 mb-2 flex-wrap">
							<div className="flex items-center gap-1">
								<HospitalIcon size={14} />
								<span className="truncate">{record.hospital}</span>
							</div>
							<div className="flex items-center gap-1">
								<Clock size={14} />
								<span>{formatDate(record.recorded_at)}</span>
							</div>
							{record.doctor_name && (
								<div className="flex items-center gap-1">
									<User size={14} />
									<span className="truncate">{record.doctor_name}</span>
								</div>
							)}
						</div>

						<p className="text-sm text-gray-600 line-clamp-2">
							{record.content.substring(0, 120)}
							{record.content.length > 120 ? "..." : ""}
						</p>
					</div>
				</div>

				<Button
					variant="outline"
					size="sm"
					className="flex items-center gap-2 flex-shrink-0"
				>
					<Eye size={16} />
					View
				</Button>
			</div>
		</button>
	);
}

interface RecordViewerModalProps {
	record: HealthRecordDetail;
	onClose: () => void;
}

function RecordViewerModal({ record, onClose }: RecordViewerModalProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getRecordBadge = (record: HealthRecordDetail) => {
		if (record.is_approved) return "approved";
		if (record.is_rejected) return "rejected";
		return "pending";
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<div className="flex items-center gap-3">
						<h2 className="text-xl font-semibold text-gray-900">
							Medical Record
						</h2>
						<Badge variant={getRecordBadge(record) as any}>
							{getRecordBadge(record)}
						</Badge>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<X size={24} />
					</button>
				</div>

				<div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
					{/* Record Metadata */}
					<div className="bg-gray-50 rounded-lg p-4 mb-6">
						<h3 className="font-semibold text-gray-900 mb-3">{record.title}</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							<div>
								<span className="font-medium text-gray-700">Type:</span>
								<span className="ml-2 text-gray-900">
									{record.record_type.replace("_", " ")}
								</span>
							</div>
							<div>
								<span className="font-medium text-gray-700">Hospital:</span>
								<span className="ml-2 text-gray-900">{record.hospital}</span>
							</div>
							<div>
								<span className="font-medium text-gray-700">Recorded:</span>
								<span className="ml-2 text-gray-900">
									{formatDate(record.recorded_at)}
								</span>
							</div>
							{record.doctor_name && (
								<div>
									<span className="font-medium text-gray-700">Doctor:</span>
									<span className="ml-2 text-gray-900">
										{record.doctor_name}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Record Content */}
					<div>
						<h4 className="font-medium text-gray-900 mb-3">Record Details</h4>
						<div className="bg-white border border-gray-200 rounded-lg p-4">
							<pre className="whitespace-pre-wrap font-sans text-sm text-gray-900 leading-relaxed">
								{record.content}
							</pre>
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-3 p-6 border-t border-gray-200">
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</div>
			</div>
		</div>
	);
}
