import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { 
	Users, 
	Eye, 
	Clock, 
	FileText,
	TrendUp,
	ChartBar
} from "@phosphor-icons/react";
import { doctorService, obfuscateNIN } from "#/services/doctor.service";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import type { RecentPatient } from "#/types/api.types";

export const Route = createFileRoute("/_authenticated/doctor/patients")({
	component: DoctorPatients,
});

function DoctorPatients() {
	const navigate = useNavigate();

	// Fetch recently accessed patients
	const { data: patients = [], isLoading } = useQuery({
		queryKey: ["recentPatients"],
		queryFn: () => doctorService.getRecentlyAccessedPatients(20),
	});

	// Calculate simple stats
	const todayPatients = patients.filter(p => {
		const today = new Date().toDateString();
		return new Date(p.lastAccessed).toDateString() === today;
	}).length;

	const thisWeekPatients = patients.filter(p => {
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);
		return new Date(p.lastAccessed) > weekAgo;
	}).length;

	const handleViewRecords = (nin: string) => {
		navigate({ 
			to: '/doctor/records',
			search: { nin }
		});
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold font-plus-sans text-white mb-2">
					My Patients
				</h1>
				<p className="text-white/75 text-base">
					Patients you've recently accessed and their record history
				</p>
			</div>

			{/* Stats Row */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white rounded-lg p-6 border border-white/10">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600 mb-2">Total Patients</p>
							<p className="text-3xl font-bold text-gray-900">{patients.length}</p>
							<p className="text-sm text-gray-500">All time</p>
						</div>
						<div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
							<Users size={24} />
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg p-6 border border-white/10">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600 mb-2">This Week</p>
							<p className="text-3xl font-bold text-gray-900">{thisWeekPatients}</p>
							<p className="text-sm text-gray-500">Accessed</p>
						</div>
						<div className="p-3 bg-green-50 text-green-600 rounded-lg">
							<TrendUp size={24} />
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg p-6 border border-white/10">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600 mb-2">Today</p>
							<p className="text-3xl font-bold text-gray-900">{todayPatients}</p>
							<p className="text-sm text-gray-500">Accessed</p>
						</div>
						<div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
							<ChartBar size={24} />
						</div>
					</div>
				</div>
			</div>

			{/* Patients List */}
			<div className="bg-white rounded-lg border border-white/10">
				<div className="p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900">Recently Accessed Patients</h2>
					<p className="text-sm text-gray-600 mt-1">
						Patients you've viewed records for, sorted by most recent access
					</p>
				</div>

				{isLoading ? (
					<div className="p-6">
						<div className="space-y-4">
							{[1, 2, 3, 4, 5].map((id) => (
								<PatientSkeleton key={`patient-skeleton-${id}`} />
							))}
						</div>
					</div>
				) : patients.length === 0 ? (
					<div className="text-center py-12">
						<Users size={64} className="mx-auto mb-4 text-gray-300" />
						<p className="text-gray-900 font-medium mb-2">No patients accessed yet</p>
						<p className="text-gray-600 text-sm mb-6">
							When you view patient records, they'll appear here for quick access
						</p>
						<Button
							onClick={() => navigate({ to: '/doctor/records' })}
							className="flex items-center gap-2"
						>
							<Eye size={16} />
							Search Patient Records
						</Button>
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{patients.map((patient) => (
							<PatientListItem
								key={patient.nin}
								patient={patient}
								onViewRecords={() => handleViewRecords(patient.nin)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface PatientListItemProps {
	patient: RecentPatient;
	onViewRecords: () => void;
}

function PatientListItem({ patient, onViewRecords }: PatientListItemProps) {
	const formatRelativeTime = (dateString: string) => {
		const now = new Date();
		const date = new Date(dateString);
		const diffMs = now.getTime() - date.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffHours / 24);

		if (diffHours < 1) return 'Just now';
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	};

	// Generate initials from name
	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map(word => word[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	// Generate consistent color from name
	const getAvatarColor = (name: string) => {
		const colors = [
			'bg-blue-500',
			'bg-green-500',
			'bg-purple-500',
			'bg-pink-500',
			'bg-indigo-500',
			'bg-yellow-500',
			'bg-red-500',
			'bg-teal-500'
		];
		
		const hash = name.split('').reduce((acc, char) => {
			return acc + char.charCodeAt(0);
		}, 0);
		
		return colors[hash % colors.length];
	};

	return (
		<div className="p-6 hover:bg-gray-50 transition-colors">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					{/* Patient Avatar */}
					<div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(patient.name)}`}>
						{getInitials(patient.name)}
					</div>
					
					{/* Patient Info */}
					<div>
						<h3 className="font-semibold text-gray-900">{patient.name}</h3>
						<div className="flex items-center gap-4 text-sm text-gray-600">
							<span>NIN: {obfuscateNIN(patient.nin)}</span>
							{patient.age > 0 && <span>{patient.age} years old</span>}
							{patient.bloodGroup !== 'UNKNOWN' && (
								<Badge variant="outline" size="sm">
									{patient.bloodGroup}
								</Badge>
							)}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-6">
					{/* Stats */}
					<div className="text-right text-sm">
						<div className="flex items-center gap-2 text-gray-600 mb-1">
							<FileText size={14} />
							<span>{patient.recordCount} record{patient.recordCount !== 1 ? 's' : ''}</span>
						</div>
						<div className="flex items-center gap-2 text-gray-500">
							<Clock size={14} />
							<span>{formatRelativeTime(patient.lastAccessed)}</span>
						</div>
					</div>

					{/* Action Button */}
					<Button
						variant="outline"
						onClick={onViewRecords}
						className="flex items-center gap-2"
					>
						<Eye size={16} />
						View Records
					</Button>
				</div>
			</div>
		</div>
	);
}

function PatientSkeleton() {
	return (
		<div className="flex items-center justify-between p-6">
			<div className="flex items-center gap-4">
				<div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
				<div className="space-y-2">
					<div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
					<div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
				</div>
			</div>
			<div className="flex items-center gap-6">
				<div className="text-right space-y-2">
					<div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
					<div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
				</div>
				<div className="h-9 bg-gray-200 rounded animate-pulse w-28" />
			</div>
		</div>
	);
}
