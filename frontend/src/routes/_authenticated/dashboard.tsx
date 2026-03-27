import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { 
	ChartLineUp, 
	FileText, 
	ShieldCheck, 
	Clock,
	ArrowRight,
	Eye,
	CheckCircle,
	XCircle,
	Plus
} from "@phosphor-icons/react";
import { useAuthStore } from "#/stores/authStore";
import { recordsService } from "#/services/records.service";
import { consentsService } from "#/services/consents.service";
import { auditService, formatAuditLogForDisplay } from "#/services/audit.service";
import { Badge } from "#/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard")({
	component: PatientDashboard,
});

function PatientDashboard() {
	const { user } = useAuthStore();

	// Fetch dashboard data
	const { data: recordStats, isLoading: recordsLoading } = useQuery({
		queryKey: ["recordStats"],
		queryFn: recordsService.getRecordStats,
	});

	const { data: consentStats, isLoading: consentsLoading } = useQuery({
		queryKey: ["consentStats"],
		queryFn: consentsService.getConsentStats,
	});

	const { data: recentActivity, isLoading: activityLoading } = useQuery({
		queryKey: ["recentActivity"],
		queryFn: () => auditService.getRecentActivity(5),
	});

	const isLoading = recordsLoading || consentsLoading || activityLoading;

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold font-plus-sans text-neutral-900 mb-2">
					Welcome back, {user?.first_name}!
				</h1>
				<p className="text-neutral-600 text-base">
					Your health records and consent management dashboard
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatsCard
					title="Total Records"
					value={recordStats?.total || 0}
					icon={FileText}
					color="blue"
					isLoading={recordsLoading}
					description={`${recordStats?.approved || 0} approved`}
				/>
				<StatsCard
					title="Pending Approvals"
					value={recordStats?.pending || 0}
					icon={Clock}
					color="orange"
					isLoading={recordsLoading}
					description="Awaiting your review"
				/>
				<StatsCard
					title="Active Consents"
					value={consentStats?.active || 0}
					icon={ShieldCheck}
					color="teal"
					isLoading={consentsLoading}
					description={`${consentStats?.expiringSoon || 0} expiring soon`}
				/>
				<StatsCard
					title="Recent Activity"
					value={recentActivity?.length || 0}
					icon={ChartLineUp}
					color="green"
					isLoading={activityLoading}
					description="Last 5 activities"
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Recent Activity Feed */}
				<div className="lg:col-span-2 space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold font-plus-sans text-neutral-900">
							Recent Activity
						</h2>
						<Link 
							to="/audit-log" 
							className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
						>
							View All <ArrowRight size={14} />
						</Link>
					</div>
					
					<div className="bg-white rounded-lg border border-neutral-200">
						{isLoading ? (
							<div className="p-6 space-y-4">
								{[1, 2, 3].map((id) => (
									<ActivitySkeleton key={`skeleton-${id}`} />
								))}
							</div>
						) : recentActivity && recentActivity.length > 0 ? (
							<div className="divide-y divide-neutral-100">
								{recentActivity.map((log) => {
									const displayLog = formatAuditLogForDisplay(log);
									return (
										<ActivityItem key={log.id} log={displayLog} />
									);
								})}
							</div>
						) : (
							<div className="p-8 text-center text-neutral-500">
								<ChartLineUp size={48} className="mx-auto mb-4 text-neutral-300" />
								<p>No recent activity found</p>
							</div>
						)}
					</div>
				</div>

				{/* Quick Actions */}
				<div className="space-y-6">
					<h2 className="text-xl font-semibold font-plus-sans text-neutral-900">
						Quick Actions
					</h2>
					
					<div className="space-y-4">
						<QuickActionCard
							title="View Medical Records"
							description="Review your health records and approvals"
							icon={FileText}
							to="/records"
							color="blue"
						/>
						<QuickActionCard
							title="Manage Consents"
							description="Grant or revoke hospital access"
							icon={ShieldCheck}
							to="/consents"
							color="teal"
						/>
						<QuickActionCard
							title="View Audit Log"
							description="See who accessed your records"
							icon={Eye}
							to="/audit-log"
							color="purple"
						/>
					</div>

					{/* Pending Actions Alert */}
					{recordStats && recordStats.pending > 0 && (
						<div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<Clock size={20} className="text-orange-600 mt-0.5 flex-shrink-0" />
								<div className="flex-1">
									<h4 className="text-sm font-medium text-orange-800 mb-1">
										Pending Records
									</h4>
									<p className="text-xs text-orange-700 mb-3">
										You have {recordStats.pending} medical record{recordStats.pending !== 1 ? 's' : ''} waiting for your approval
									</p>
									<Link 
										to="/records" 
										search={{ tab: 'pending' }}
										className="inline-flex items-center gap-1 text-xs font-medium text-orange-800 hover:text-orange-900"
									>
										Review Now <ArrowRight size={12} />
									</Link>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface StatsCardProps {
	title: string;
	value: number;
	icon: React.ComponentType<any>;
	color: 'blue' | 'orange' | 'teal' | 'green';
	isLoading: boolean;
	description: string;
}

function StatsCard({ title, value, icon: Icon, color, isLoading, description }: StatsCardProps) {
	const colorClasses = {
		blue: 'bg-blue-50 text-blue-600',
		orange: 'bg-orange-50 text-orange-600',
		teal: 'bg-teal-50 text-teal-600',
		green: 'bg-green-50 text-green-600'
	};

	return (
		<div className="bg-white rounded-lg border border-neutral-200 p-6">
			<div className="flex items-center gap-4">
				<div className={`p-3 rounded-lg ${colorClasses[color]}`}>
					<Icon size={24} weight="bold" />
				</div>
				<div className="flex-1">
					<p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
					{isLoading ? (
						<div className="space-y-2">
							<div className="h-6 bg-neutral-200 rounded animate-pulse w-12" />
							<div className="h-4 bg-neutral-200 rounded animate-pulse w-20" />
						</div>
					) : (
						<>
							<p className="text-2xl font-bold text-neutral-900 mb-1">{value}</p>
							<p className="text-xs text-neutral-500">{description}</p>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

interface QuickActionCardProps {
	title: string;
	description: string;
	icon: React.ComponentType<any>;
	to: string;
	color: 'blue' | 'teal' | 'purple';
}

function QuickActionCard({ title, description, icon: Icon, to, color }: QuickActionCardProps) {
	const colorClasses = {
		blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
		teal: 'bg-teal-50 text-teal-600 group-hover:bg-teal-100',
		purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'
	};

	return (
		<Link 
			to={to} 
			className="group block bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-300 transition-colors"
		>
			<div className="flex items-center gap-3">
				<div className={`p-2 rounded-lg transition-colors ${colorClasses[color]}`}>
					<Icon size={20} weight="bold" />
				</div>
				<div className="flex-1">
					<h4 className="text-sm font-medium text-neutral-900 mb-1">{title}</h4>
					<p className="text-xs text-neutral-600">{description}</p>
				</div>
				<ArrowRight size={16} className="text-neutral-400 group-hover:text-neutral-600 transition-colors" />
			</div>
		</Link>
	);
}

interface ActivityItemProps {
	log: ReturnType<typeof formatAuditLogForDisplay>;
}

function ActivityItem({ log }: ActivityItemProps) {
	const getActionIcon = (action: string) => {
		switch (action) {
			case 'READ':
				return <Eye size={16} className="text-blue-600" />;
			case 'WRITE_APPROVED':
				return <CheckCircle size={16} className="text-green-600" />;
			case 'WRITE_REJECTED':
				return <XCircle size={16} className="text-red-600" />;
			case 'CONSENT_GRANTED':
				return <ShieldCheck size={16} className="text-teal-600" />;
			default:
				return <FileText size={16} className="text-neutral-600" />;
		}
	};

	return (
		<div className="p-4 hover:bg-neutral-50 transition-colors">
			<div className="flex items-start gap-3">
				<div className="mt-0.5 flex-shrink-0">
					{getActionIcon(log.action)}
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm text-neutral-900 mb-1 line-clamp-2">
						{log.description}
					</p>
					<div className="flex items-center gap-2 flex-wrap">
						<Badge variant={log.actionInfo.color as any} size="sm">
							{log.actionInfo.label}
						</Badge>
						<span className="text-xs text-neutral-500">
							{log.relativeTime}
						</span>
						{!log.isPatientAction && (
							<span className="text-xs text-neutral-500">
								• {log.actorName}
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function ActivitySkeleton() {
	return (
		<div className="flex items-start gap-3">
			<div className="w-4 h-4 bg-neutral-200 rounded animate-pulse mt-1 flex-shrink-0" />
			<div className="flex-1 space-y-2">
				<div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
				<div className="flex items-center gap-2">
					<div className="h-3 bg-neutral-200 rounded animate-pulse w-16" />
					<div className="h-3 bg-neutral-200 rounded animate-pulse w-12" />
				</div>
			</div>
		</div>
	);
}
