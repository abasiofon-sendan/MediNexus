import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
	MagnifyingGlass, 
	Eye,
	CheckCircle,
	XCircle,
	FileText,
	Calendar,
	Hospital,
	User,
	Clock,
	Plus,
	CaretDown,
	X
} from "@phosphor-icons/react";
import { recordsService, getRecordTypeDisplay, getRecordTypeBadgeVariant, getRecordStatusBadgeVariant, getRecordStatusText } from "#/services/records.service";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import type { HealthRecordDetail } from "#/types/api.types";

type TabType = 'all' | 'approved' | 'pending' | 'rejected';

export const Route = createFileRoute("/_authenticated/records")({
	component: PatientRecords,
	validateSearch: (search: Record<string, unknown>): { tab?: TabType } => {
		return {
			tab: (search.tab as TabType) || 'all'
		};
	}
});

function PatientRecords() {
	const { tab = 'all' } = Route.useSearch();
	const navigate = Route.useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedRecord, setSelectedRecord] = useState<HealthRecordDetail | null>(null);
	const [showApproveModal, setShowApproveModal] = useState<HealthRecordDetail | null>(null);
	const [showRejectModal, setShowRejectModal] = useState<HealthRecordDetail | null>(null);
	const [otpCode, setOtpCode] = useState("");
	const [rejectReason, setRejectReason] = useState("");

	const queryClient = useQueryClient();

	// Fetch records based on active tab
	const { data: records = [], isLoading, error } = useQuery({
		queryKey: ["records", tab],
		queryFn: () => recordsService.getRecordsByStatus(tab),
	});

	// Filter records by search query
	const filteredRecords = records.filter(record =>
		searchQuery === "" || 
		record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
		record.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
		getRecordTypeDisplay(record.record_type).toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Approve record mutation
	const approveRecordMutation = useMutation({
		mutationFn: ({ recordId, otp }: { recordId: string; otp: string }) =>
			recordsService.approveRecord(recordId, otp),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["records"] });
			queryClient.invalidateQueries({ queryKey: ["recordStats"] });
			queryClient.invalidateQueries({ queryKey: ["recentActivity"] });
			setShowApproveModal(null);
			setOtpCode("");
		},
		onError: (error: any) => {
			alert(error.message || "Failed to approve record");
		}
	});

	// Reject record mutation
	const rejectRecordMutation = useMutation({
		mutationFn: ({ recordId, reason }: { recordId: string; reason?: string }) =>
			recordsService.rejectRecord(recordId, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["records"] });
			queryClient.invalidateQueries({ queryKey: ["recordStats"] });
			queryClient.invalidateQueries({ queryKey: ["recentActivity"] });
			setShowRejectModal(null);
			setRejectReason("");
		},
		onError: (error: any) => {
			alert(error.message || "Failed to reject record");
		}
	});

	const tabs = [
		{ key: 'all', label: 'All Records', count: records.length },
		{ key: 'approved', label: 'Approved', count: records.filter(r => r.is_approved && !r.is_rejected).length },
		{ key: 'pending', label: 'Pending', count: records.filter(r => !r.is_approved && !r.is_rejected).length },
		{ key: 'rejected', label: 'Rejected', count: records.filter(r => r.is_rejected).length }
	] as const;

	const handleApprove = () => {
		if (showApproveModal && otpCode.length === 6) {
			approveRecordMutation.mutate({ 
				recordId: showApproveModal.id, 
				otp: otpCode 
			});
		}
	};

	const handleReject = () => {
		if (showRejectModal) {
			rejectRecordMutation.mutate({ 
				recordId: showRejectModal.id, 
				reason: rejectReason 
			});
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold font-plus-sans text-neutral-900 mb-2">
					My Medical Records
				</h1>
				<p className="text-neutral-600 text-base">
					View, approve, and manage your health records from healthcare providers
				</p>
			</div>

			{/* Search */}
			<div className="bg-white border border-neutral-200 rounded-lg p-6">
				<div className="relative">
					<MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
					<Input
						placeholder="Search records by title, hospital, or type..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
						variant="light"
					/>
				</div>
			</div>

			{/* Tabs */}
			<div className="border-b border-neutral-200">
				<nav className="flex space-x-8">
					{tabs.map((tabItem) => (
						<button
							key={tabItem.key}
							type="button"
							onClick={() => navigate({ search: { tab: tabItem.key } })}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								tab === tabItem.key
									? 'border-primary-500 text-primary-600'
									: 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
							}`}
						>
							{tabItem.label}
							<span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
								tab === tabItem.key
									? 'bg-primary-100 text-primary-600'
									: 'bg-neutral-100 text-neutral-600'
							}`}>
								{tabItem.count}
							</span>
						</button>
					))}
				</nav>
			</div>

			{/* Results Summary */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-neutral-600">
					{isLoading ? "Loading..." : `${filteredRecords.length} ${filteredRecords.length === 1 ? 'record' : 'records'} found`}
				</p>
			</div>

			{/* Records List */}
			<div className="space-y-4">
				{isLoading ? (
					<>
						{[1, 2, 3].map((id) => (
							<RecordSkeleton key={`skeleton-${id}`} />
						))}
					</>
				) : error ? (
					<div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
						<XCircle size={48} className="mx-auto mb-4 text-red-400" />
						<p className="text-neutral-900 font-medium mb-2">Failed to load records</p>
						<p className="text-neutral-600 text-sm">Please try again later</p>
					</div>
				) : filteredRecords.length === 0 ? (
					<div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
						<FileText size={48} className="mx-auto mb-4 text-neutral-300" />
						<p className="text-neutral-900 font-medium mb-2">No records found</p>
						<p className="text-neutral-600 text-sm">
							{searchQuery 
								? "Try adjusting your search query" 
								: tab === 'pending' 
									? "No records are waiting for your approval"
									: `No ${tab === 'all' ? '' : tab} records available`}
						</p>
					</div>
				) : (
					filteredRecords.map((record) => (
						<RecordCard 
							key={record.id} 
							record={record}
							onView={() => setSelectedRecord(record)}
							onApprove={() => setShowApproveModal(record)}
							onReject={() => setShowRejectModal(record)}
						/>
					))
				)}
			</div>

			{/* Modals */}
			{selectedRecord && (
				<ViewRecordModal 
					record={selectedRecord} 
					onClose={() => setSelectedRecord(null)} 
				/>
			)}

			{showApproveModal && (
				<ApproveRecordModal
					record={showApproveModal}
					otpCode={otpCode}
					setOtpCode={setOtpCode}
					onApprove={handleApprove}
					onClose={() => {
						setShowApproveModal(null);
						setOtpCode("");
					}}
					isLoading={approveRecordMutation.isPending}
				/>
			)}

			{showRejectModal && (
				<RejectRecordModal
					record={showRejectModal}
					reason={rejectReason}
					setReason={setRejectReason}
					onReject={handleReject}
					onClose={() => {
						setShowRejectModal(null);
						setRejectReason("");
					}}
					isLoading={rejectRecordMutation.isPending}
				/>
			)}
		</div>
	);
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface RecordCardProps {
	record: HealthRecordDetail;
	onView: () => void;
	onApprove: () => void;
	onReject: () => void;
}

function RecordCard({ record, onView, onApprove, onReject }: RecordCardProps) {
	const statusBadgeVariant = getRecordStatusBadgeVariant(record);
	const typeBadgeVariant = getRecordTypeBadgeVariant(record.record_type);
	const statusText = getRecordStatusText(record);
	const isPending = !record.is_approved && !record.is_rejected;

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	return (
		<div className="bg-white border border-neutral-200 rounded-lg p-6 hover:border-neutral-300 transition-colors">
			<div className="flex items-start justify-between gap-4 mb-4">
				<div className="flex-1 min-w-0">
					<h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-1">
						{record.title}
					</h3>
					
					<div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
						<div className="flex items-center gap-2">
							<Hospital size={16} />
							<span className="truncate">{record.hospital}</span>
						</div>
						{record.doctor_name && (
							<div className="flex items-center gap-2">
								<User size={16} />
								<span className="truncate">{record.doctor_name}</span>
							</div>
						)}
						<div className="flex items-center gap-2">
							<Calendar size={16} />
							<span>{formatDate(record.recorded_at)}</span>
						</div>
					</div>

					<div className="flex items-center gap-3 flex-wrap">
						<Badge variant={typeBadgeVariant as any} size="sm">
							{getRecordTypeDisplay(record.record_type)}
						</Badge>
						<Badge variant={statusBadgeVariant as any} size="sm">
							{statusText}
						</Badge>
					</div>
				</div>

				<div className="flex items-center gap-2 flex-shrink-0">
					<Button
						variant="outline"
						size="sm"
						onClick={onView}
						className="flex items-center gap-2"
					>
						<Eye size={16} />
						View
					</Button>

					{isPending && (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={onApprove}
								className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
							>
								<CheckCircle size={16} />
								Approve
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={onReject}
								className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
							>
								<XCircle size={16} />
								Reject
							</Button>
						</>
					)}
				</div>
			</div>

			{/* Preview of content */}
			<div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
				<p className="text-sm text-neutral-700 line-clamp-3 whitespace-pre-line">
					{record.content ? record.content.substring(0, 200) + (record.content.length > 200 ? '...' : '') : 'No content available'}
				</p>
			</div>
		</div>
	);
}

function RecordSkeleton() {
	return (
		<div className="bg-white border border-neutral-200 rounded-lg p-6">
			<div className="flex items-start justify-between gap-4 mb-4">
				<div className="flex-1 space-y-3">
					<div className="h-6 bg-neutral-200 rounded animate-pulse w-2/3" />
					<div className="flex items-center gap-4">
						<div className="h-4 bg-neutral-200 rounded animate-pulse w-32" />
						<div className="h-4 bg-neutral-200 rounded animate-pulse w-24" />
						<div className="h-4 bg-neutral-200 rounded animate-pulse w-20" />
					</div>
					<div className="flex items-center gap-3">
						<div className="h-6 bg-neutral-200 rounded-full animate-pulse w-20" />
						<div className="h-6 bg-neutral-200 rounded-full animate-pulse w-16" />
					</div>
				</div>
				<div className="flex gap-2">
					<div className="h-8 bg-neutral-200 rounded animate-pulse w-16" />
					<div className="h-8 bg-neutral-200 rounded animate-pulse w-20" />
				</div>
			</div>
			<div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
				<div className="space-y-2">
					<div className="h-4 bg-neutral-200 rounded animate-pulse w-full" />
					<div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
					<div className="h-4 bg-neutral-200 rounded animate-pulse w-1/2" />
				</div>
			</div>
		</div>
	);
}

// Modal Components
interface ViewRecordModalProps {
	record: HealthRecordDetail;
	onClose: () => void;
}

function ViewRecordModal({ record, onClose }: ViewRecordModalProps) {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
				<div className="flex items-center justify-between p-6 border-b border-neutral-200">
					<h2 className="text-xl font-semibold text-neutral-900">Medical Record</h2>
					<button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
						<X size={24} />
					</button>
				</div>
				
				<div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
					<div className="space-y-4 mb-6">
						<div>
							<h3 className="text-lg font-medium text-neutral-900 mb-2">{record.title}</h3>
							<div className="flex items-center gap-4 text-sm text-neutral-600">
								<span>{record.hospital}</span>
								{record.doctor_name && <span>• {record.doctor_name}</span>}
								<span>• {new Date(record.recorded_at).toLocaleDateString()}</span>
							</div>
						</div>
						
						<div className="flex items-center gap-3">
							<Badge variant={getRecordTypeBadgeVariant(record.record_type) as any}>
								{getRecordTypeDisplay(record.record_type)}
							</Badge>
							<Badge variant={getRecordStatusBadgeVariant(record) as any}>
								{getRecordStatusText(record)}
							</Badge>
						</div>
					</div>

					<div className="bg-neutral-50 rounded-lg p-6 border border-neutral-100">
						<h4 className="text-sm font-medium text-neutral-900 mb-3">Record Content</h4>
						<div className="prose prose-sm max-w-none">
							<pre className="whitespace-pre-wrap font-sans text-sm text-neutral-700 leading-relaxed">
								{record.content || 'No content available'}
							</pre>
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-3 p-6 border-t border-neutral-200">
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</div>
			</div>
		</div>
	);
}

interface ApproveRecordModalProps {
	record: HealthRecordDetail;
	otpCode: string;
	setOtpCode: (code: string) => void;
	onApprove: () => void;
	onClose: () => void;
	isLoading: boolean;
}

function ApproveRecordModal({ record, otpCode, setOtpCode, onApprove, onClose, isLoading }: ApproveRecordModalProps) {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-lg max-w-md w-full">
				<div className="flex items-center justify-between p-6 border-b border-neutral-200">
					<h2 className="text-xl font-semibold text-neutral-900">Approve Record</h2>
					<button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
						<X size={24} />
					</button>
				</div>
				
				<div className="p-6">
					<div className="mb-6">
						<h3 className="font-medium text-neutral-900 mb-2">{record.title}</h3>
						<p className="text-sm text-neutral-600">
							From {record.hospital} • {new Date(record.recorded_at).toLocaleDateString()}
						</p>
					</div>

					<div className="mb-6">
						<label htmlFor="otp-input" className="block text-sm font-medium text-neutral-900 mb-2">
							Enter 6-digit OTP code from your email
						</label>
						<Input
							id="otp-input"
							type="text"
							placeholder="000000"
							value={otpCode}
							onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
							className="text-center text-lg font-mono tracking-widest"
							maxLength={6}
						/>
						<p className="text-xs text-neutral-500 mt-2">
							Check your email for the verification code
						</p>
					</div>
				</div>

				<div className="flex justify-end gap-3 p-6 border-t border-neutral-200">
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button 
						onClick={onApprove}
						disabled={otpCode.length !== 6 || isLoading}
						className="bg-green-600 hover:bg-green-700"
					>
						{isLoading ? 'Approving...' : 'Approve Record'}
					</Button>
				</div>
			</div>
		</div>
	);
}

interface RejectRecordModalProps {
	record: HealthRecordDetail;
	reason: string;
	setReason: (reason: string) => void;
	onReject: () => void;
	onClose: () => void;
	isLoading: boolean;
}

function RejectRecordModal({ record, reason, setReason, onReject, onClose, isLoading }: RejectRecordModalProps) {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-lg max-w-md w-full">
				<div className="flex items-center justify-between p-6 border-b border-neutral-200">
					<h2 className="text-xl font-semibold text-neutral-900">Reject Record</h2>
					<button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
						<X size={24} />
					</button>
				</div>
				
				<div className="p-6">
					<div className="mb-6">
						<h3 className="font-medium text-neutral-900 mb-2">{record.title}</h3>
						<p className="text-sm text-neutral-600">
							From {record.hospital} • {new Date(record.recorded_at).toLocaleDateString()}
						</p>
					</div>

					<div className="mb-6">
						<label htmlFor="reject-reason" className="block text-sm font-medium text-neutral-900 mb-2">
							Reason for rejection (optional)
						</label>
						<textarea
							id="reject-reason"
							placeholder="Why are you rejecting this record?"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							className="w-full h-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
						/>
					</div>
				</div>

				<div className="flex justify-end gap-3 p-6 border-t border-neutral-200">
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button 
						onClick={onReject}
						disabled={isLoading}
						className="bg-red-600 hover:bg-red-700"
					>
						{isLoading ? 'Rejecting...' : 'Reject Record'}
					</Button>
				</div>
			</div>
		</div>
	);
}
