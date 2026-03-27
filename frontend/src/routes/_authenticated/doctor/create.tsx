import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
	ArrowLeft, 
	FileText, 
	User, 
	Hospital as HospitalIcon, 
	Info,
	CheckCircle,
	Clock,
	Warning
} from "@phosphor-icons/react";
import { doctorService, validateNIN, formatNIN } from "#/services/doctor.service";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Badge } from "#/components/ui/badge";
import type { 
	HealthRecordCreateRequest, 
	RecordType,
	HealthRecordDetail 
} from "#/types/api.types";
import { useAuthStore } from "#/stores/authStore";

export const Route = createFileRoute("/_authenticated/doctor/create")({
	component: CreateRecord,
});

function CreateRecord() {
	const navigate = useNavigate();
	const { user } = useAuthStore();

	const [formData, setFormData] = useState<HealthRecordCreateRequest>({
		patient_nin: '',
		hospital_id: 'current-hospital-id', // TODO: Get from user's hospital
		record_type: 'DIAGNOSIS',
		title: '',
		content: ''
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	// Get recently created records
	const { data: recentRecords = [] } = useQuery({
		queryKey: ["recentCreatedRecords"],
		queryFn: () => doctorService.getMyCreatedRecords(5),
	});

	// Create record mutation
	const createMutation = useMutation({
		mutationFn: (data: HealthRecordCreateRequest) => doctorService.createPatientRecord(data),
		onSuccess: (newRecord) => {
			// Clear form
			setFormData({
				patient_nin: '',
				hospital_id: 'current-hospital-id',
				record_type: 'DIAGNOSIS',
				title: '',
				content: ''
			});
			setErrors({});
			
			// Show success and navigate
			alert(`Record created successfully! The patient will receive an OTP to approve this record.`);
			navigate({ to: '/doctor/records' });
		},
		onError: (error: any) => {
			alert(error.message || "Failed to create record");
		}
	});

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		// Validate NIN
		if (!formData.patient_nin) {
			newErrors.patient_nin = "Patient NIN is required";
		} else if (!validateNIN(formData.patient_nin)) {
			newErrors.patient_nin = "NIN must be exactly 11 digits";
		}

		// Validate title
		if (!formData.title.trim()) {
			newErrors.title = "Record title is required";
		} else if (formData.title.trim().length < 3) {
			newErrors.title = "Title must be at least 3 characters";
		} else if (formData.title.trim().length > 100) {
			newErrors.title = "Title must be less than 100 characters";
		}

		// Validate content
		if (!formData.content.trim()) {
			newErrors.content = "Record content is required";
		} else if (formData.content.trim().length < 10) {
			newErrors.content = "Content must be at least 10 characters";
		} else if (formData.content.trim().length > 5000) {
			newErrors.content = "Content must be less than 5000 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		if (validateForm()) {
			// Clean the NIN before submitting
			const cleanedData = {
				...formData,
				patient_nin: formData.patient_nin.replace(/\D/g, ''),
				title: formData.title.trim(),
				content: formData.content.trim()
			};
			
			createMutation.mutate(cleanedData);
		}
	};

	const handleNinChange = (value: string) => {
		const cleanValue = value.replace(/\D/g, '');
		if (cleanValue.length <= 11) {
			setFormData(prev => ({ ...prev, patient_nin: cleanValue }));
			// Clear error when user starts typing
			if (errors.patient_nin) {
				setErrors(prev => ({ ...prev, patient_nin: '' }));
			}
		}
	};

	const handleFieldChange = (field: keyof HealthRecordCreateRequest, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	const recordTypeOptions: { value: RecordType; label: string }[] = [
		{ value: 'DIAGNOSIS', label: 'Diagnosis' },
		{ value: 'PRESCRIPTION', label: 'Prescription' },
		{ value: 'LAB_RESULT', label: 'Lab Result' },
		{ value: 'IMAGING', label: 'Imaging' },
		{ value: 'SURGERY', label: 'Surgery' },
		{ value: 'OTHER', label: 'Other' }
	];

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button 
					variant="outline" 
					onClick={() => navigate({ to: '/doctor/records' })}
					className="flex items-center gap-2"
				>
					<ArrowLeft size={16} />
					Back to Records
				</Button>
				
				<div>
					<h1 className="text-3xl font-bold font-plus-sans text-white">
						Create Patient Record
					</h1>
					<p className="text-white/75 text-base">
						Create a new medical record for patient approval
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Form Section */}
				<div className="lg:col-span-2">
					<form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-white/10 space-y-6">
						{/* Patient NIN */}
						<div>
							<label htmlFor="patient_nin" className="block text-sm font-medium text-gray-900 mb-2">
								Patient NIN <span className="text-red-500">*</span>
							</label>
							<Input
								id="patient_nin"
								type="text"
								value={formatNIN(formData.patient_nin)}
								onChange={(e) => handleNinChange(e.target.value)}
								placeholder="Enter patient NIN (e.g., 12345-678-901)"
								className={errors.patient_nin ? 'border-red-300' : ''}
							/>
							{errors.patient_nin && (
								<p className="text-sm text-red-600 mt-1">{errors.patient_nin}</p>
							)}
							<p className="text-xs text-gray-500 mt-1">
								11-digit National Identification Number
							</p>
						</div>

						{/* Hospital (Auto-filled) */}
						<div>
							<label htmlFor="hospital" className="block text-sm font-medium text-gray-900 mb-2">
								Hospital
							</label>
							<div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
								<HospitalIcon size={20} className="text-gray-500" />
								<div>
									<p className="font-medium text-gray-900">
										{/* TODO: Get actual hospital name from user profile */}
										Lagos University Teaching Hospital
									</p>
									<p className="text-sm text-gray-600">Your current hospital</p>
								</div>
							</div>
						</div>

						{/* Record Type */}
						<div>
							<label htmlFor="record_type" className="block text-sm font-medium text-gray-900 mb-2">
								Record Type <span className="text-red-500">*</span>
							</label>
							<select
								id="record_type"
								value={formData.record_type}
								onChange={(e) => handleFieldChange('record_type', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
							>
								{recordTypeOptions.map(option => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>

						{/* Title */}
						<div>
							<label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
								Record Title <span className="text-red-500">*</span>
							</label>
							<Input
								id="title"
								type="text"
								value={formData.title}
								onChange={(e) => handleFieldChange('title', e.target.value)}
								placeholder="e.g., Hypertension Follow-up, Blood Test Results"
								className={errors.title ? 'border-red-300' : ''}
								maxLength={100}
							/>
							{errors.title && (
								<p className="text-sm text-red-600 mt-1">{errors.title}</p>
							)}
							<p className="text-xs text-gray-500 mt-1">
								{formData.title.length}/100 characters
							</p>
						</div>

						{/* Content */}
						<div>
							<label htmlFor="content" className="block text-sm font-medium text-gray-900 mb-2">
								Record Content <span className="text-red-500">*</span>
							</label>
							<textarea
								id="content"
								value={formData.content}
								onChange={(e) => handleFieldChange('content', e.target.value)}
								placeholder="Enter detailed medical record content including symptoms, diagnosis, treatment plan, medications, etc."
								rows={8}
								className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-y ${
									errors.content ? 'border-red-300' : ''
								}`}
								maxLength={5000}
							/>
							{errors.content && (
								<p className="text-sm text-red-600 mt-1">{errors.content}</p>
							)}
							<p className="text-xs text-gray-500 mt-1">
								{formData.content.length}/5000 characters
							</p>
						</div>

						{/* Form Actions */}
						<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
							<Button
								type="submit"
								disabled={createMutation.isPending}
								className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
							>
								<FileText size={16} />
								{createMutation.isPending ? 'Creating Record...' : 'Create Record'}
							</Button>
							
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate({ to: '/doctor/records' })}
								disabled={createMutation.isPending}
							>
								Cancel
							</Button>
						</div>
					</form>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* OTP Notice */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div className="flex items-start gap-3">
							<Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
							<div>
								<h4 className="font-medium text-blue-900 mb-2">Patient Approval Required</h4>
								<p className="text-sm text-blue-700">
									After creating this record, the patient will receive a 6-digit OTP 
									via email to approve the entry. The record will remain "Pending" 
									until patient approval.
								</p>
							</div>
						</div>
					</div>

					{/* Recently Created Records */}
					<div className="bg-white rounded-lg p-4 border border-white/10">
						<h3 className="font-semibold text-gray-900 mb-4">Recently Created Records</h3>
						
						{recentRecords.length === 0 ? (
							<p className="text-sm text-gray-600">No recent records</p>
						) : (
							<div className="space-y-3">
								{recentRecords.map((record) => (
									<RecentRecordItem key={record.id} record={record} />
								))}
							</div>
						)}
					</div>

					{/* Tips */}
					<div className="bg-gray-50 rounded-lg p-4">
						<h4 className="font-medium text-gray-900 mb-3">Best Practices</h4>
						<ul className="text-sm text-gray-600 space-y-2">
							<li className="flex items-start gap-2">
								<CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
								<span>Use clear, descriptive titles</span>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
								<span>Include relevant symptoms and observations</span>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
								<span>Specify treatment plans and medications</span>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
								<span>Double-check patient NIN accuracy</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface RecentRecordItemProps {
	record: HealthRecordDetail;
}

function RecentRecordItem({ record }: RecentRecordItemProps) {
	const getStatusBadge = (record: HealthRecordDetail) => {
		if (record.is_approved) return { variant: 'approved' as const, text: 'Approved' };
		if (record.is_rejected) return { variant: 'rejected' as const, text: 'Rejected' };
		return { variant: 'pending' as const, text: 'Pending' };
	};

	const formatRelativeTime = (dateString: string) => {
		const now = new Date();
		const date = new Date(dateString);
		const diffMs = now.getTime() - date.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffHours / 24);

		if (diffHours < 1) return 'Just now';
		if (diffHours < 24) return `${diffHours}h ago`;
		return `${diffDays}d ago`;
	};

	const status = getStatusBadge(record);

	return (
		<div className="border border-gray-200 rounded-lg p-3">
			<div className="flex items-start justify-between gap-2 mb-2">
				<h4 className="font-medium text-gray-900 text-sm truncate">
					{record.title}
				</h4>
				<Badge variant={status.variant} size="sm">
					{status.text}
				</Badge>
			</div>
			
			<div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
				<User size={12} />
				<span>NIN ending in {record.patient_nin?.slice(-4) || '****'}</span>
			</div>
			
			<div className="flex items-center justify-between text-xs text-gray-500">
				<span>{record.record_type.replace('_', ' ')}</span>
				<span>{formatRelativeTime(record.created_at || record.recorded_at)}</span>
			</div>
		</div>
	);
}