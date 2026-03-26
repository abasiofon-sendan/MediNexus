import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { 
	Users, 
	FileText, 
	Clock, 
	TrendUp,
	Eye,
	Plus,
	ArrowRight,
	MagnifyingGlass,
	Shield,
	CheckCircle,
	XCircle,
	Warning
} from "@phosphor-icons/react";
import { useAuthStore } from "#/stores/authStore";
import { doctorService } from "#/services/doctor.service";
import { formatAuditLogForDisplay } from "#/services/audit.service";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import type { AuditLog } from "#/types/api.types";

export const Route = createFileRoute("/_authenticated/doctor/dashboard")({
	component: DoctorDashboard,
});

function DoctorDashboard() {
	const { user } = useAuthStore();
	const navigate = useNavigate();

	// Fetch dashboard data
	const { data: stats, isLoading: statsLoading } = useQuery({
		queryKey: ["doctorStats"],
		queryFn: doctorService.getDoctorStats,
	});

	const { data: recentActivity = [], isLoading: activityLoading } = useQuery({
		queryKey: ["doctorActivity"],
		queryFn: () => doctorService.getRecentActivity(8),
	});

	const { data: recentRecords = [], isLoading: recordsLoading } = useQuery({
		queryKey: ["recentCreatedRecords"],
		queryFn: () => doctorService.getMyCreatedRecords(3),
	});

	const isLoading = statsLoading || activityLoading;

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold font-plus-sans text-white mb-2">
					Welcome back, Dr. {user?.last_name || user?.first_name}!
				</h1>
				<p className="text-white/75 text-base">
					Provider portal for patient records and medical consultations
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
				<StatsCard
					title="Patients Accessed"
					value={stats?.patientsAccessedToday || 0}
					subtitle="Today"
					icon={<Users size={24} />}
					color="blue"
					isLoading={statsLoading}
				/>
				<StatsCard
					title="Records Created"
					value={stats?.recordsCreated || 0}
					subtitle="Total"
					icon={<FileText size={24} />}
					color="green"
					isLoading={statsLoading}
				/>
				<StatsCard
					title="Pending Approvals"
					value={stats?.pendingApprovals || 0}
					subtitle="Awaiting Patient"
					icon={<Clock size={24} />}
					color="orange"
					isLoading={statsLoading}
				/>
				<StatsCard
					title="Recent Activities"
					value={stats?.recentActivities || 0}
					subtitle="This Week"
					icon={<TrendUp size={24} />}
					color="teal"
					isLoading={statsLoading}
				/>
			</div>

			{/* Quick Actions */}
			<div className="bg-white rounded-lg p-6 border border-white/10">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
				
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<QuickActionCard
						title="Search Patient Records"
						description="Search and view patient medical records by NIN"
						icon={<MagnifyingGlass size={20} />}
						onClick={() => navigate({ to: '/doctor/records' })}
						color="blue"
					/>
					
					<QuickActionCard
						title="Create New Record"
						description="Create a new medical record for patient approval"
						icon={<Plus size={20} />}
						onClick={() => navigate({ to: '/doctor/create' })}
						color="green"
					/>
					
					<QuickActionCard
						title="View My Patients"
						description="See recently accessed patients and history"
						icon={<Users size={20} />}
						onClick={() => navigate({ to: '/doctor/patients' })}
						color="teal"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
				{/* Recent Activity */}
				<div className="xl:col-span-2">
					<div className="bg-white rounded-lg p-6 border border-white/10">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
							<Link
								to="/doctor/patients"
								className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
							>
								View All
								<ArrowRight size={14} />
							</Link>
						</div>

						{activityLoading ? (
							<div className="space-y-4">
								{[1, 2, 3, 4].map((id) => (
									<ActivitySkeleton key={`activity-skeleton-${id}`} />
								))}
							</div>
						) : recentActivity.length === 0 ? (
							<div className="text-center py-8">
								<Shield size={48} className="mx-auto mb-4 text-gray-300" />
								<p className="text-gray-900 font-medium mb-2">No recent activity</p>
								<p className="text-gray-600 text-sm">
									Your patient interactions will appear here
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{recentActivity.map((activity) => (
									<ActivityItem key={activity.id} activity={activity} />
								))}
							</div>
						)}
					</div>
				</div>

				{/* Pending Approvals & Recent Records */}
				<div className="space-y-6">
					{/* Pending Approvals Alert */}
					{stats && stats.pendingApprovals > 0 && (
						<div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<Warning size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
								<div>
									<h4 className="font-medium text-orange-900 mb-1">
										Pending Patient Approvals
									</h4>
									<p className="text-sm text-orange-700 mb-3">
										{stats.pendingApprovals} record{stats.pendingApprovals > 1 ? 's' : ''} awaiting patient approval
									</p>
									<Button
										size="sm"
										onClick={() => navigate({ to: '/doctor/records' })}
										className="bg-orange-600 hover:bg-orange-700"
									>
										Check Status
									</Button>
								</div>
							</div>
						</div>
					)}

					{/* Recently Created Records */}
					<div className="bg-white rounded-lg p-6 border border-white/10">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900">Recent Records</h3>
							<Link
								to="/doctor/create"
								className="text-sm text-teal-600 hover:text-teal-700"
							>
								Create New
							</Link>
						</div>

						{recordsLoading ? (
							<div className="space-y-3">
								{[1, 2, 3].map((id) => (
									<RecordSkeleton key={`record-skeleton-${id}`} />
								))}
							</div>
						) : recentRecords.length === 0 ? (
							<div className="text-center py-6">
								<FileText size={32} className="mx-auto mb-3 text-gray-300" />
								<p className="text-gray-600 text-sm mb-3">No records created yet</p>
								<Button
									size="sm"
									onClick={() => navigate({ to: '/doctor/create' })}
								>
									Create First Record
								</Button>
							</div>
						) : (
							<div className="space-y-3">
								{recentRecords.map((record) => (
									<RecentRecordCard key={record.id} record={record} />
								))}
							</div>
						)}
					</div>
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
	subtitle: string;
	icon: React.ReactNode;
	color: 'blue' | 'green' | 'orange' | 'teal';
	isLoading: boolean;
}

function StatsCard({ title, value, subtitle, icon, color, isLoading }: StatsCardProps) {
	const colorClasses = {
		blue: 'bg-blue-50 text-blue-600',
		green: 'bg-green-50 text-green-600',
		orange: 'bg-orange-50 text-orange-600',
		teal: 'bg-teal-50 text-teal-600'
	};

	if (isLoading) {
		return (
			<div className="bg-white rounded-lg p-6 border border-white/10">
				<div className="flex items-center justify-between">
					<div className="space-y-3 flex-1">
						<div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
						<div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
						<div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
					</div>
					<div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg p-6 border border-white/10 hover:border-white/20 transition-colors">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
					<p className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</p>
					<p className="text-sm text-gray-500">{subtitle}</p>
				</div>
				<div className={`p-3 rounded-lg ${colorClasses[color]}`}>
					{icon}
				</div>
			</div>
		</div>
	);
}

interface QuickActionCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	onClick: () => void;
	color: 'blue' | 'green' | 'teal';
}

function QuickActionCard({ title, description, icon, onClick, color }: QuickActionCardProps) {
	const colorClasses = {
		blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
		green: 'bg-green-50 text-green-600 group-hover:bg-green-100',
		teal: 'bg-teal-50 text-teal-600 group-hover:bg-teal-100'
	};

	return (
		<button
			type="button"
			onClick={onClick}
			className="group text-left p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
		>
			<div className="flex items-start gap-3">
				<div className={`p-2 rounded-lg ${colorClasses[color]} transition-colors`}>
					{icon}
				</div>
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-gray-900 mb-1">{title}</h4>
					<p className="text-sm text-gray-600">{description}</p>
				</div>
			</div>
		</button>
	);
}

interface ActivityItemProps {
	activity: AuditLog;
}

function ActivityItem({ activity }: ActivityItemProps) {
	const formatted = formatAuditLogForDisplay(activity);
	
	const getActivityIcon = (action: string) => {
		switch (action) {
			case 'READ': return <Eye size={16} className="text-blue-600" />;
			case 'WRITE_REQUEST': return <Plus size={16} className="text-green-600" />;
			case 'WRITE_APPROVED': return <CheckCircle size={16} className="text-green-600" />;
			case 'WRITE_REJECTED': return <XCircle size={16} className="text-red-600" />;
			default: return <Shield size={16} className="text-gray-600" />;
		}
	};

	return (
		<div className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
			<div className="flex-shrink-0 mt-1">
				{getActivityIcon(activity.action)}
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm text-gray-900">{formatted.message}</p>
				<div className="flex items-center gap-3 mt-1">
					<span className="text-xs text-gray-500">{formatted.relativeTime}</span>
					{formatted.badge && (
						<Badge variant={formatted.badge.variant as any} size="sm">
							{formatted.badge.text}
						</Badge>
					)}
				</div>
			</div>
		</div>
	);
}

interface RecentRecordCardProps {
	record: any; // HealthRecordDetail but simplified for display
}

function RecentRecordCard({ record }: RecentRecordCardProps) {
	const getStatusBadge = () => {
		if (record.is_approved) return { variant: 'approved' as const, text: 'Approved' };
		if (record.is_rejected) return { variant: 'rejected' as const, text: 'Rejected' };
		return { variant: 'pending' as const, text: 'Pending' };
	};

	const status = getStatusBadge();

	return (
		<div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
			<div className="flex items-start justify-between gap-2 mb-2">
				<h4 className="font-medium text-gray-900 text-sm truncate">
					{record.title}
				</h4>
				<Badge variant={status.variant} size="sm">
					{status.text}
				</Badge>
			</div>
			
			<p className="text-xs text-gray-600 mb-2">
				{record.record_type.replace('_', ' ')}
			</p>
			
			<p className="text-xs text-gray-500">
				{new Date(record.created_at || record.recorded_at).toLocaleDateString()}
			</p>
		</div>
	);
}

function ActivitySkeleton() {
	return (
		<div className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
			<div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse mt-1" />
			<div className="flex-1 space-y-2">
				<div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
				<div className="flex gap-3">
					<div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
					<div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
				</div>
			</div>
		</div>
	);
}

function RecordSkeleton() {
	return (
		<div className="p-3 border border-gray-200 rounded-lg">
			<div className="flex justify-between items-start gap-2 mb-2">
				<div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
				<div className="h-5 bg-gray-200 rounded-full animate-pulse w-16" />
			</div>
			<div className="h-3 bg-gray-200 rounded animate-pulse w-20 mb-2" />
			<div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
		</div>
	);
}
