import {
	ArrowRight,
	Certificate,
	EnvelopeSimple,
	Eye,
	EyeSlash,
	Hospital,
	IdentificationBadge,
	Lock,
	Phone,
	Sparkle,
	Stethoscope,
	User,
	UserCircleCheck,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { authService } from "#/services/auth.service";
import { useAuthStore } from "#/stores/authStore";

export const Route = createFileRoute("/doctor/register")({
	component: DoctorRegister,
});

const SPECIALTIES = [
	{ value: "GENERAL_PRACTICE", label: "General Practice" },
	{ value: "CARDIOLOGY", label: "Cardiology" },
	{ value: "DERMATOLOGY", label: "Dermatology" },
	{ value: "ENDOCRINOLOGY", label: "Endocrinology" },
	{ value: "GASTROENTEROLOGY", label: "Gastroenterology" },
	{ value: "NEUROLOGY", label: "Neurology" },
	{ value: "OBSTETRICS", label: "Obstetrics & Gynaecology" },
	{ value: "ONCOLOGY", label: "Oncology" },
	{ value: "OPHTHALMOLOGY", label: "Ophthalmology" },
	{ value: "ORTHOPAEDICS", label: "Orthopaedics" },
	{ value: "PAEDIATRICS", label: "Paediatrics" },
	{ value: "PSYCHIATRY", label: "Psychiatry" },
	{ value: "RADIOLOGY", label: "Radiology" },
	{ value: "SURGERY", label: "Surgery" },
	{ value: "UROLOGY", label: "Urology" },
	{ value: "OTHER", label: "Other" },
];

function DoctorRegister() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		first_name: "",
		last_name: "",
		phone_number: "",
		hospital_id: "",
		license_number: "",
		specialty: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Fetch hospitals
	const { data: hospitals, isLoading: hospitalsLoading } = useQuery({
		queryKey: ["hospitals"],
		queryFn: authService.getHospitals,
	});

	// Registration mutation
	const registerMutation = useMutation({
		mutationFn: authService.doctorRegister,
		onSuccess: (data) => {
			const user = {
				id: "",
				email: formData.email,
				first_name: formData.first_name,
				last_name: formData.last_name,
				role: "doctor" as const,
				phone_number: formData.phone_number,
			};

			useAuthStore
				.getState()
				.login({ access: data.access, refresh: data.refresh }, user);

			navigate({ to: "/doctor/dashboard" });
		},
		onError: (error: any) => {
			const errorMsg =
				error.response?.data?.message ||
				error.response?.data?.email?.[0] ||
				"Registration failed. Please try again.";
			setErrors({ submit: errorMsg });
		},
	});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.email) newErrors.email = "Email is required";
		else if (!/\S+@\S+\.\S+/.test(formData.email))
			newErrors.email = "Invalid email format";

		if (!formData.password) newErrors.password = "Password is required";
		else if (formData.password.length < 8)
			newErrors.password = "Password must be at least 8 characters";

		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		if (!formData.first_name) newErrors.first_name = "First name is required";
		if (!formData.last_name) newErrors.last_name = "Last name is required";
		if (!formData.phone_number)
			newErrors.phone_number = "Phone number is required";
		if (!formData.hospital_id)
			newErrors.hospital_id = "Please select a hospital";
		if (!formData.license_number)
			newErrors.license_number = "License number is required";
		if (!formData.specialty) newErrors.specialty = "Please select a specialty";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (validateForm()) {
			const { confirmPassword, ...dataToSend } = formData;
			registerMutation.mutate(dataToSend);
		}
	};

	return (
		<div className="min-h-screen bg-white flex">
			{/* Left Side - Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto bg-white">
				<div className="w-full max-w-md py-8">
					{/* Logo */}
					<div className="mb-8">
						<h2 className="text-neutral-900 font-plus-sans text-2xl font-bold">
							MediNexus
						</h2>
						<p className="text-neutral-500 text-sm mt-1">Provider Portal</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<h1 className="text-3xl font-bold text-neutral-900 font-plus-sans mb-2">
								Join as a Provider
							</h1>
							<p className="text-neutral-600">
								Register to access patient records securely
							</p>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<Input
								label="First Name"
								icon={<User size={18} />}
								placeholder="Dr. John"
								value={formData.first_name}
								onChange={(e) =>
									setFormData({ ...formData, first_name: e.target.value })
								}
								error={errors.first_name}
								variant="light"
							/>
							<Input
								label="Last Name"
								icon={<User size={18} />}
								placeholder="Doe"
								value={formData.last_name}
								onChange={(e) =>
									setFormData({ ...formData, last_name: e.target.value })
								}
								error={errors.last_name}
								variant="light"
							/>
						</div>

						<Input
							label="Email Address"
							type="email"
							icon={<EnvelopeSimple size={18} />}
							placeholder="john.doe@hospital.com"
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							error={errors.email}
							variant="light"
						/>

						<Input
							label="Phone Number"
							type="tel"
							icon={<Phone size={18} />}
							placeholder="+234 801 234 5678"
							value={formData.phone_number}
							onChange={(e) =>
								setFormData({ ...formData, phone_number: e.target.value })
							}
							error={errors.phone_number}
							variant="light"
						/>

						<div>
							<label
								htmlFor="hospital"
								className="block text-sm font-medium text-neutral-700 mb-2 font-plus-sans"
							>
								Hospital / Practice
							</label>
							<Select
								value={formData.hospital_id}
								onValueChange={(value) =>
									setFormData({ ...formData, hospital_id: value })
								}
							>
								<SelectTrigger
									id="hospital"
									icon={<Hospital size={18} />}
									variant="light"
								>
									<SelectValue
										placeholder={
											hospitalsLoading
												? "Loading hospitals..."
												: "Select Hospital"
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{hospitals?.map((hospital) => (
										<SelectItem key={hospital.id} value={hospital.id}>
											{hospital.name} - {hospital.city}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.hospital_id && (
								<p className="mt-1.5 text-sm text-red-400 font-medium">
									{errors.hospital_id}
								</p>
							)}
						</div>

						<Input
							label="Medical License Number"
							icon={<Certificate size={18} />}
							placeholder="MDCN/R/12345"
							value={formData.license_number}
							onChange={(e) =>
								setFormData({ ...formData, license_number: e.target.value })
							}
							error={errors.license_number}
							variant="light"
						/>

						<div>
							<label
								htmlFor="specialty"
								className="block text-sm font-medium text-neutral-700 mb-2 font-plus-sans"
							>
								Specialty
							</label>
							<Select
								value={formData.specialty}
								onValueChange={(value) =>
									setFormData({ ...formData, specialty: value })
								}
							>
								<SelectTrigger
									id="specialty"
									icon={<Stethoscope size={18} />}
									variant="light"
								>
									<SelectValue placeholder="Select Specialty" />
								</SelectTrigger>
								<SelectContent>
									{SPECIALTIES.map((specialty) => (
										<SelectItem key={specialty.value} value={specialty.value}>
											{specialty.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.specialty && (
								<p className="mt-1.5 text-sm text-red-400 font-medium">
									{errors.specialty}
								</p>
							)}
						</div>

						<div className="relative">
							<Input
								label="Password"
								type={showPassword ? "text" : "password"}
								icon={<Lock size={18} />}
								placeholder="••••••••"
								value={formData.password}
								onChange={(e) =>
									setFormData({ ...formData, password: e.target.value })
								}
								error={errors.password}
								variant="light"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-[42px] text-neutral-400 hover:text-neutral-600"
							>
								{showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
							</button>
						</div>

						<div className="relative">
							<Input
								label="Confirm Password"
								type={showConfirmPassword ? "text" : "password"}
								icon={<Lock size={18} />}
								placeholder="••••••••"
								value={formData.confirmPassword}
								onChange={(e) =>
									setFormData({ ...formData, confirmPassword: e.target.value })
								}
								error={errors.confirmPassword}
								variant="light"
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute right-3 top-[42px] text-neutral-400 hover:text-neutral-600"
							>
								{showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
							</button>
						</div>

						{errors.submit && (
							<div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
								<p className="text-sm text-red-400">{errors.submit}</p>
							</div>
						)}

						<Button
							type="submit"
							disabled={registerMutation.isPending}
							className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
							size="lg"
						>
							{registerMutation.isPending
								? "Creating Account..."
								: "Create Provider Account"}
							<ArrowRight size={20} weight="bold" />
						</Button>

						<div className="text-center space-y-2">
							<p className="text-sm text-neutral-600">
								Already have an account?{" "}
								<button
									type="button"
									onClick={() => navigate({ to: "/doctor/login" })}
									className="text-primary hover:underline font-medium"
								>
									Sign in
								</button>
							</p>
							<p className="text-sm text-neutral-600">
								Not a healthcare provider?{" "}
								<button
									type="button"
									onClick={() => navigate({ to: "/register" })}
									className="text-primary hover:underline font-medium"
								>
									Register as Patient
								</button>
							</p>
						</div>
					</form>
				</div>
			</div>

			{/* Right Side - Provider Messaging */}
			<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0D1F2D] via-[#0A3D34] to-[#0D1F2D] p-12 items-center justify-center relative overflow-hidden">
				{/* Background Pattern */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
					<div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse delay-1000" />
				</div>

				<div className="relative z-10 max-w-lg space-y-8">
					<div className="space-y-4">
						<UserCircleCheck
							size={48}
							weight="duotone"
							className="text-primary"
						/>
						<h2 className="text-4xl lg:text-5xl font-bold text-white font-plus-sans leading-tight">
							Secure Patient
							<br />
							Record Access
						</h2>
						<p className="text-xl text-white/60 leading-relaxed">
							Access verified patient records with consent-based permissions.
							MediNexus helps healthcare providers deliver better care through
							secure information sharing.
						</p>
					</div>

					<div className="space-y-4 pt-8">
						{[
							{
								icon: <IdentificationBadge size={24} weight="duotone" />,
								title: "Credential Verification",
								description:
									"Your medical license and credentials are verified for platform access.",
							},
							{
								icon: <Hospital size={24} weight="duotone" />,
								title: "Cross-Facility Records",
								description:
									"Request access to patient records across different healthcare facilities.",
							},
							{
								icon: <Sparkle size={24} weight="duotone" />,
								title: "Consent-Based Access",
								description:
									"All record access requires patient consent and is logged for transparency.",
							},
						].map((feature) => (
							<div
								key={feature.title}
								className="flex gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-colors"
							>
								<div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-white">
									{feature.icon}
								</div>
								<div>
									<h3 className="text-white font-plus-sans font-semibold mb-1">
										{feature.title}
									</h3>
									<p className="text-sm text-white/60">{feature.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
