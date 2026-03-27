import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
	MagnifyingGlass, 
	FunnelSimple, 
	Download,
	Eye,
	CheckCircle,
	XCircle,
	ShieldCheck,
	Lock,
	FileText,
	CalendarBlank
} from "@phosphor-icons/react";
import { auditService, formatAuditLogForDisplay, getAuditLogFilters, downloadAuditLogsCSV } from "#/services/audit.service";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import type { AuditAction, ActorType } from "#/types/api.types";

export const Route = createFileRoute("/_authenticated/audit-log")({
	component: PatientAuditLog,
});

function PatientAuditLog() {
	const [searchQuery, setSearchQuery] = useState("");
	const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");
	const [actorFilter, setActorFilter] = useState<ActorType | "all">("all");

	// Fetch audit logs
	const { data: auditLogs = [], isLoading, error } = useQuery({
		queryKey: ["auditLogs"],
		queryFn: auditService.getMyAuditLogs,
	});

	// Filter logs based on search and filters
	const filteredLogs = auditLogs.filter(log => {
		const matchesSearch = searchQuery === "" || 
			log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			log.actor_email.toLowerCase().includes(searchQuery.toLowerCase());
		
		const matchesAction = actionFilter === "all" || log.action === actionFilter;
		const matchesActor = actorFilter === "all" || log.actor_type === actorFilter;
		
		return matchesSearch && matchesAction && matchesActor;
	});

	const filters = getAuditLogFilters();

	const handleExportCSV = () => {
		downloadAuditLogsCSV(filteredLogs, `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
	};

	const clearFilters = () => {
		setSearchQuery("");
		setActionFilter("all");
		setActorFilter("all");
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold font-plus-sans text-neutral-900 mb-2">
					Audit Log
				</h1>
				<p className="text-neutral-600 text-base">
					Track who has accessed your medical records and when
				</p>
			</div>

			{/* Filters & Search */}
			<div className="bg-white border border-neutral-200 rounded-lg p-6">
				<div className="flex flex-col lg:flex-row lg:items-center gap-4">
					{/* Search */}
					<div className="flex-1">
						<div className="relative">
							<MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
							<Input
								placeholder="Search by description or actor..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>

					{/* Action Filter */}
					<div className="w-full lg:w-48">
						<select
							value={actionFilter}
							onChange={(e) => setActionFilter(e.target.value as any)}
							className="w-full h-12 px-3 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
						>
							<option value="all">All Actions</option>
							{filters.actions.map((action) => (
								<option key={action.value} value={action.value}>
									{action.label}
								</option>
							))}
						</select>
					</div>

					{/* Actor Type Filter */}
					<div className="w-full lg:w-48">
						<select
							value={actorFilter}
							onChange={(e) => setActorFilter(e.target.value as any)}
							className="w-full h-12 px-3 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
						>
							<option value="all">All Actors</option>
							{filters.actorTypes.map((actor) => (
								<option key={actor.value} value={actor.value}>
									{actor.label}
								</option>
							))}
						</select>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center gap-2">
						{(searchQuery || actionFilter !== "all" || actorFilter !== "all") && (
							<Button
								variant="outline"
								size="sm"
								onClick={clearFilters}
								className="flex items-center gap-2"
							>
								Clear Filters
							</Button>
						)}
						
						<Button
							variant="outline"
							size="sm"
							onClick={handleExportCSV}
							disabled={filteredLogs.length === 0}
							className="flex items-center gap-2"
						>
							<Download size={16} />
							Export
						</Button>
					</div>
				</div>
			</div>

			{/* Results Summary */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-neutral-600">
					{isLoading ? "Loading..." : `${filteredLogs.length} ${filteredLogs.length === 1 ? 'entry' : 'entries'} found`}
				</p>
			</div>

			{/* Audit Log List */}
			<div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
				{isLoading ? (
					<div className="p-6 space-y-4">
						{[1, 2, 3, 4, 5].map((id) => (
							<AuditLogSkeleton key={`skeleton-${id}`} />
						))}
					</div>
				) : error ? (
					<div className="p-8 text-center">
						<XCircle size={48} className="mx-auto mb-4 text-red-400" />
						<p className="text-neutral-900 font-medium mb-2">Failed to load audit logs</p>
						<p className="text-neutral-600 text-sm">Please try again later</p>
					</div>
				) : filteredLogs.length === 0 ? (
					<div className="p-8 text-center">
						<FileText size={48} className="mx-auto mb-4 text-neutral-300" />
						<p className="text-neutral-900 font-medium mb-2">No audit logs found</p>
						<p className="text-neutral-600 text-sm">
							{searchQuery || actionFilter !== "all" || actorFilter !== "all" 
								? "Try adjusting your search or filters" 
								: "Your audit activity will appear here"}
						</p>
					</div>
				) : (
					<div className="divide-y divide-neutral-100">
						{filteredLogs.map((log) => {
							const displayLog = formatAuditLogForDisplay(log);
							return <AuditLogItem key={log.id} log={displayLog} />;
						})}
					</div>
				)}
			</div>
		</div>
	);
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface AuditLogItemProps {
	log: ReturnType<typeof formatAuditLogForDisplay>;
}

function AuditLogItem({ log }: AuditLogItemProps) {
	const getActionIcon = (action: string) => {
		switch (action) {
			case 'READ':
				return <Eye size={20} className="text-blue-600" />;
			case 'WRITE_REQUEST':
				return <FileText size={20} className="text-orange-600" />;
			case 'WRITE_APPROVED':
				return <CheckCircle size={20} className="text-green-600" />;
			case 'WRITE_REJECTED':
				return <XCircle size={20} className="text-red-600" />;
			case 'CONSENT_GRANTED':
				return <ShieldCheck size={20} className="text-teal-600" />;
			case 'CONSENT_REVOKED':
				return <Lock size={20} className="text-gray-600" />;
			default:
				return <FileText size={20} className="text-neutral-600" />;
		}
	};

	const getActorTypeBadgeVariant = (actorType: string) => {
		switch (actorType) {
			case 'PATIENT':
				return 'approved';
			case 'PROVIDER':
				return 'active';
			case 'ADMIN':
				return 'error';
			default:
				return 'inactive';
		}
	};

	const formatTimestamp = (timestamp: string) => {
		return new Date(timestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	};

	return (
		<div className="p-6 hover:bg-neutral-50 transition-colors">
			<div className="flex items-start gap-4">
				{/* Action Icon */}
				<div className="flex-shrink-0 mt-1">
					{getActionIcon(log.action)}
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-4 mb-3">
						<p className="text-sm text-neutral-900 leading-relaxed">
							{log.description}
						</p>
						<time className="flex-shrink-0 text-xs text-neutral-500 font-mono">
							{formatTimestamp(log.timestamp)}
						</time>
					</div>

					<div className="flex items-center gap-3 flex-wrap">
						{/* Action Badge */}
						<Badge variant={log.actionInfo.color as any} size="sm">
							{log.actionInfo.label}
						</Badge>

						{/* Actor Type Badge */}
						<Badge variant={getActorTypeBadgeVariant(log.actor_type) as any} size="sm">
							{log.actor_type === 'PATIENT' ? 'You' : 
							 log.actor_type === 'PROVIDER' ? 'Healthcare Provider' : 
							 'Administrator'}
						</Badge>

						{/* Actor Name */}
						{!log.isPatientAction && (
							<span className="text-xs text-neutral-600 font-medium">
								{log.actorName}
							</span>
						)}

						{/* Record ID */}
						{log.record && (
							<span className="text-xs text-neutral-500 font-mono">
								Record: {log.record.slice(0, 8)}...
							</span>
						)}

						{/* Relative Time */}
						<span className="text-xs text-neutral-500">
							{log.relativeTime}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function AuditLogSkeleton() {
	return (
		<div className="p-6">
			<div className="flex items-start gap-4">
				<div className="w-5 h-5 bg-neutral-200 rounded animate-pulse flex-shrink-0 mt-1" />
				<div className="flex-1 space-y-3">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-2 flex-1">
							<div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
							<div className="h-3 bg-neutral-200 rounded animate-pulse w-1/2" />
						</div>
						<div className="h-3 bg-neutral-200 rounded animate-pulse w-16 flex-shrink-0" />
					</div>
					<div className="flex items-center gap-2">
						<div className="h-5 bg-neutral-200 rounded-full animate-pulse w-16" />
						<div className="h-5 bg-neutral-200 rounded-full animate-pulse w-20" />
						<div className="h-3 bg-neutral-200 rounded animate-pulse w-12" />
					</div>
				</div>
			</div>
		</div>
	);
}
