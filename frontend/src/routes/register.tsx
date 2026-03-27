import {
	ArrowLeft,
	ArrowRight,
	CalendarBlank,
	CheckCircle,
	Clock,
	Dna,
	Drop,
	EnvelopeSimple,
	Eye,
	EyeSlash,
	FirstAidKit,
	IdentificationCard,
	Lock,
	Phone,
	ShieldCheck,
	Sparkle,
	User,
	UserCircle,
	Warning,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { useNINVerification } from "#/hooks/useNINVerification";

interface RegisterSearch {
	step?: number;
}

export const Route = createFileRoute("/register")({
	validateSearch: (search: Record<string, unknown>): RegisterSearch => ({
		step: Number(search.step) || 1,
	}),
	component: PatientRegister,
});

interface NINData {
	nin: string;
	isVerified: boolean;
}

interface StepOneData {
	email: string;
	password: string;
	confirmPassword: string;
	first_name: string;
	last_name: string;
	phone_number: string;
}

interface StepTwoData {
	date_of_birth: string;
	blood_group: string;
	genotype: string;
	allergies: string;
	emergency_contact: string;
}

interface RegistrationFormData {
	step1: NINData;
	step2: StepOneData;
	step3: StepTwoData;
	step4: {
		registeredEmail: string;
		otpCode: string;
	};
	currentStep: number;
	lastUpdated: number;
}

const STORAGE_KEY = "medinexus_registration_data";
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const saveFormData = (data: Partial<RegistrationFormData>) => {
	try {
		const existing = getFormData();
		const updated: RegistrationFormData = {
			step1: { nin: "", isVerified: false },
			step2: {
				email: "",
				password: "",
				confirmPassword: "",
				first_name: "",
				last_name: "",
				phone_number: "",
			},
			step3: {
				date_of_birth: "",
				blood_group: "",
				genotype: "",
				allergies: "",
				emergency_contact: "",
			},
			step4: {
				registeredEmail: "",
				otpCode: "",
			},
			currentStep: 1,
			lastUpdated: Date.now(),
			...existing,
			...data,
		};
		updated.lastUpdated = Date.now(); // Ensure lastUpdated is always current
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
	} catch (error) {
		console.error("Failed to save form data:", error);
	}
};

const getFormData = (): RegistrationFormData | null => {
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		if (!data) return null;

		const parsed = JSON.parse(data) as RegistrationFormData;

		// Check if data is expired
		if (Date.now() - parsed.lastUpdated > STORAGE_EXPIRY) {
			clearFormData();
			return null;
		}

		return parsed;
	} catch (error) {
		console.error("Failed to get form data:", error);
		clearFormData(); // Clear corrupted data
		return null;
	}
};

const clearFormData = () => {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.error("Failed to clear form data:", error);
	}
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENOTYPES = ["AA", "AS", "SS", "AC", "SC"];

function PatientRegister() {
	const navigate = useNavigate();
	const { step: urlStep = 1 } = Route.useSearch();

	// NIN verification hook
	const {
		interswitchToken,
		isTokenLoading,
		tokenError,
		isVerifying,
		verificationError,
		verifiedNINDetails,
		autoFillData,
		verifyNIN,
		clearVerification,
		isValidNIN,
	} = useNINVerification();

	// Initialize step from URL parameter
	const [step, setStep] = useState(urlStep);
	const [ninData, setNinData] = useState<NINData>({
		nin: "",
		isVerified: false,
	});
	const [stepOneData, setStepOneData] = useState<StepOneData>({
		email: "",
		password: "",
		confirmPassword: "",
		first_name: "",
		last_name: "",
		phone_number: "",
	});
	const [stepTwoData, setStepTwoData] = useState<StepTwoData>({
		date_of_birth: "",
		blood_group: "",
		genotype: "",
		allergies: "",
		emergency_contact: "",
	});
	const [otpCode, setOtpCode] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [registeredEmail, setRegisteredEmail] = useState("");
	const [showResumeMessage, setShowResumeMessage] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Load data from localStorage on component mount and URL changes
	useEffect(() => {
		const storedData = getFormData();
		if (storedData) {
			setShowResumeMessage(true);
			setNinData(storedData.step1 || { nin: "", isVerified: false });
			setStepOneData(
				storedData.step2 || {
					email: "",
					password: "",
					confirmPassword: "",
					first_name: "",
					last_name: "",
					phone_number: "",
				},
			);
			setStepTwoData(
				storedData.step3 || {
					date_of_birth: "",
					blood_group: "",
					genotype: "",
					allergies: "",
					emergency_contact: "",
				},
			);
			setOtpCode(storedData.step4?.otpCode || "");
			setRegisteredEmail(storedData.step4?.registeredEmail || "");
		}

		// Validate and set step from URL
		const validStep = Math.max(1, Math.min(4, urlStep));
		if (validStep !== step) {
			setStep(validStep);
		}
	}, [urlStep, step]);

	// Auto-fill form when NIN is verified
	useEffect(() => {
		if (autoFillData && ninData.isVerified) {
			setStepOneData(prev => {
				const newStepOneData = {
					...prev,
					first_name: autoFillData.first_name,
					last_name: autoFillData.last_name,
					phone_number: autoFillData.phone_number,
				};
				saveFormData({ step2: newStepOneData });
				return newStepOneData;
			});
			
			setStepTwoData(prev => {
				const newStepTwoData = {
					...prev,
					date_of_birth: autoFillData.date_of_birth,
				};
				saveFormData({ step3: newStepTwoData });
				return newStepTwoData;
			});
		}
	}, [autoFillData, ninData.isVerified]);

	// Helper function to navigate to a specific step
	const goToStep = (newStep: number) => {
		setStep(newStep);
		window.history.replaceState(null, "", `/register?step=${newStep}`);
		saveFormData({ currentStep: newStep });
	};

	// Form field change handlers with localStorage persistence
	const handleNINChange = (field: string, value: string) => {
		const newData = { 
			...ninData, 
			[field]: value,
			// Reset verification status when NIN changes
			isVerified: field === 'nin' ? false : ninData.isVerified
		};
		setNinData(newData);
		saveFormData({ step1: newData });
		
		// Clear verification state when NIN changes
		if (field === 'nin') {
			clearVerification();
		}
	};

	const handleVerifyNIN = async () => {
		if (!isValidNIN(ninData.nin)) {
			setErrors({ nin: "Please enter a valid 11-digit NIN" });
			return;
		}

		try {
			await verifyNIN(ninData.nin);
			// Update NIN data to mark as verified
			const newNinData = { ...ninData, isVerified: true };
			setNinData(newNinData);
			saveFormData({ step1: newNinData });
			setErrors({});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "NIN verification failed";
			setErrors({ nin: errorMessage });
		}
	};

	const handleStepOneChange = (field: string, value: string) => {
		const newData = { ...stepOneData, [field]: value };
		setStepOneData(newData);
		// Don't save passwords to localStorage for security
		if (field !== "password" && field !== "confirmPassword") {
			saveFormData({ step2: newData });
		}
	};

	const handleStepTwoChange = (field: string, value: string) => {
		const newData = { ...stepTwoData, [field]: value };
		setStepTwoData(newData);
		saveFormData({ step3: newData });
	};

	const handleOTPChange = (value: string) => {
		setOtpCode(value);
		saveFormData({
			step4: {
				registeredEmail,
				otpCode: value,
			},
		});
	};

	// Registration mutation
	const registerMutation = useMutation({
		mutationFn: authService.patientRegister,
		onSuccess: () => {
			setRegisteredEmail(stepOneData.email);
			saveFormData({
				step4: {
					registeredEmail: stepOneData.email,
					otpCode: "",
				},
			});
			goToStep(4);
			setErrors({});
		},
		onError: (error: any) => {
			const responseData = error.response?.data;
			const newErrors: Record<string, string> = {};

			// Handle field-specific errors from backend
			if (responseData && typeof responseData === "object") {
				// Check for NIN-specific error
				if (responseData.nin) {
					const ninError = Array.isArray(responseData.nin)
						? responseData.nin[0]
						: responseData.nin;
					newErrors.submit = ninError;
				}
				// Check for non-field errors (general errors)
				else if (responseData.non_field_errors) {
					const generalError = Array.isArray(responseData.non_field_errors)
						? responseData.non_field_errors[0]
						: responseData.non_field_errors;
					newErrors.submit = generalError;
				}
				// Check for detail field (common Django error format)
				else if (responseData.detail) {
					newErrors.submit = responseData.detail;
				}
				// Check for message field
				else if (responseData.message) {
					newErrors.submit = responseData.message;
				}
				// Check for email-specific error
				else if (responseData.email) {
					const emailError = Array.isArray(responseData.email)
						? responseData.email[0]
						: responseData.email;
					newErrors.submit = emailError;
				}
				// Generic 400 error - likely NIN verification issue
				else if (error.response?.status === 400) {
					newErrors.submit =
						"NIN verification failed. Please try again.";
				} else {
					newErrors.submit = "Registration failed. Please try again.";
				}
			} else {
				newErrors.submit = "Registration failed. Please try again.";
			}

			setErrors(newErrors);
		},
	});

	// OTP verification mutation
	const verifyOTPMutation = useMutation({
		mutationFn: authService.verifyOTP,
		onSuccess: (data) => {
			// Clear localStorage after successful registration
			clearFormData();

			// Extract user info from JWT or response
			const user = {
				id: data.user?.id || "",
				email: registeredEmail,
				first_name: stepOneData.first_name,
				last_name: stepOneData.last_name,
				role: "patient" as const,
				phone_number: stepOneData.phone_number,
			};

			useAuthStore
				.getState()
				.login({ access: data.access, refresh: data.refresh }, user);

			navigate({
				to: "/login",
				search: { success: "Registration successful! Please login." },
			});
		},
		onError: (error: any) => {
			setErrors({ otp: error.response?.data?.message || "Invalid OTP code" });
		},
	});

	// Resend OTP mutation
	const resendOTPMutation = useMutation({
		mutationFn: () => authService.resendOTP(registeredEmail),
		onSuccess: () => {
			setErrors({ otp: "" });
		},
	});

	const validateNIN = () => {
		const newErrors: Record<string, string> = {};

		if (!ninData.nin) {
			newErrors.nin = "NIN is required";
		} else if (!isValidNIN(ninData.nin)) {
			newErrors.nin = "NIN must be exactly 11 digits";
		}
		// NIN verification is optional - patients can register without verification

		// Show token or verification errors
		if (tokenError) {
			newErrors.nin = tokenError;
		}
		if (verificationError) {
			newErrors.nin = verificationError;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validateStepOne = () => {
		const newErrors: Record<string, string> = {};

		if (!stepOneData.first_name)
			newErrors.first_name = "First name is required";
		if (!stepOneData.last_name) newErrors.last_name = "Last name is required";

		if (!stepOneData.email) newErrors.email = "Email is required";
		else if (!/\S+@\S+\.\S+/.test(stepOneData.email))
			newErrors.email = "Invalid email format";

		if (!stepOneData.password) newErrors.password = "Password is required";
		else if (stepOneData.password.length < 8)
			newErrors.password = "Password must be at least 8 characters";

		if (stepOneData.password !== stepOneData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		if (!stepOneData.phone_number)
			newErrors.phone_number = "Phone number is required";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validateStepTwo = () => {
		const newErrors: Record<string, string> = {};

		// Date of birth is optional since NIN verification is optional
		// Users can manually enter DOB or skip it

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNINNext = () => {
		if (validateNIN()) {
			goToStep(2);
		}
	};

	const handleStepOneNext = () => {
		if (validateStepOne()) {
			goToStep(3);
		}
	};

	const handleStepTwoSubmit = () => {
		if (validateStepTwo()) {
			const registrationData = {
				...stepOneData,
				...stepTwoData,
				nin: ninData.nin,
			};
			// Remove confirmPassword before sending
			const { confirmPassword, ...dataToSend } = registrationData;
			registerMutation.mutate(dataToSend);
		}
	};

	const handleOTPSubmit = () => {
		if (otpCode.length === 6) {
			verifyOTPMutation.mutate({ email: registeredEmail, otp_code: otpCode });
		} else {
			setErrors({ otp: "Please enter a 6-digit code" });
		}
	};

	return (
		<div className="min-h-screen bg-white flex">
			{/* Left Side - Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto bg-white">
				<div className="w-full max-w-md">
					{/* Logo */}
					<div className="mb-8">
						<h2 className="text-neutral-900 font-plus-sans text-2xl font-bold">
							MediNexus
						</h2>
					</div>

					{/* Progress Indicator */}
					<div className="mb-8">
						<div className="flex items-center gap-2">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="flex items-center flex-1">
									<div
										className={`h-1.5 w-full rounded-full transition-all duration-500 ${
											i <= step ? "bg-primary" : "bg-neutral-200"
										}`}
									/>
								</div>
							))}
						</div>
						<div className="flex justify-between mt-2">
							<span className="text-xs text-neutral-500">NIN</span>
							<span className="text-xs text-neutral-500">Personal</span>
							<span className="text-xs text-neutral-500">Medical</span>
							<span className="text-xs text-neutral-500">Verify</span>
						</div>
					</div>

					{/* Step 1: NIN Verification */}
					{step === 1 && (
						<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
							<div className="text-center">
								<div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
									<ShieldCheck
										size={32}
										weight="duotone"
										className="text-primary"
									/>
								</div>
								<h1 className="text-3xl font-bold text-neutral-900 font-plus-sans mb-2">
									Verify Your Identity
								</h1>
								<p className="text-neutral-600">
									Enter your NIN to get started.
								</p>
							</div>

							<div className="space-y-4">
								<div>
									<label
										htmlFor="nin-input"
										className="block text-sm font-medium text-neutral-700 mb-2 font-plus-sans"
									>
										National Identification Number (NIN)
									</label>
									<div className="relative">
										<IdentificationCard
											size={18}
											className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
										/>
										<input
											id="nin-input"
											type="text"
											maxLength={11}
											className="h-14 w-full rounded-lg border border-neutral-200 bg-white pl-11 pr-12 py-3 text-lg font-mono text-neutral-900 tracking-wider transition-all outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary/10 placeholder:text-neutral-400 placeholder:font-sans placeholder:tracking-normal"
											placeholder="12345678901"
											value={ninData.nin}
											onChange={(e) => {
												const value = e.target.value.replace(/\D/g, "");
												handleNINChange("nin", value);
												if (errors.nin) setErrors({ ...errors, nin: "" });
											}}
										/>
										{ninData.isVerified && (
											<CheckCircle
												size={20}
												weight="bold"
												className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400"
											/>
										)}
									</div>

									{/* Verify NIN Button */}
									{ninData.nin.length === 11 && !ninData.isVerified && (
										<div className="mt-3">
											<Button
												onClick={handleVerifyNIN}
												disabled={isVerifying || isTokenLoading || !interswitchToken}
												variant="outline"
												size="sm"
												className="w-full"
											>
												{isTokenLoading ? "Loading..." : 
												 isVerifying ? "Verifying..." : 
												 "Verify NIN"}
												<ShieldCheck size={16} weight="bold" />
											</Button>
										</div>
									)}

									{/* Token Loading State */}
									{isTokenLoading && (
										<div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
											<p className="text-sm text-blue-700 flex items-center gap-2">
												<Clock size={16} weight="bold" className="animate-spin" />
												Preparing verification system...
											</p>
										</div>
									)}

									{/* Verification Success */}
									{ninData.isVerified && verifiedNINDetails && (
										<div className="mt-3 p-4 rounded-lg bg-green-50 border border-green-200">
											<div className="flex items-start gap-3">
												<CheckCircle size={20} weight="bold" className="text-green-600 mt-0.5" />
												<div>
													<h4 className="text-sm font-medium text-green-900 mb-1">
														NIN Verified Successfully
													</h4>
													<p className="text-sm text-green-700">
														Identity confirmed for <strong>{verifiedNINDetails.firstName} {verifiedNINDetails.lastName}</strong>
														<br />
														Your personal details will be auto-filled in the next step.
													</p>
												</div>
											</div>
										</div>
									)}

									{/* Token Error */}
									{tokenError && (
										<div className="mt-3 p-4 rounded-lg bg-red-50 border border-red-200">
											<div className="flex items-start gap-3">
												<Warning size={20} weight="bold" className="text-red-600 mt-0.5" />
												<div>
													<h4 className="text-sm font-medium text-red-900 mb-1">
														Verification System Unavailable
													</h4>
													<p className="text-sm text-red-700">
														{tokenError}
													</p>
												</div>
											</div>
										</div>
									)}

									{/* Resume Registration Message */}
									{showResumeMessage && (
										<div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
											<div className="flex items-start gap-3">
												<div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
													<Clock
														size={12}
														weight="bold"
														className="text-white"
													/>
												</div>
												<div>
													<h4 className="text-sm font-medium text-blue-900 mb-1">
														Resuming Registration
													</h4>
													<p className="text-sm text-blue-700">
														Your previous registration data has been restored.
														Continue where you left off or{" "}
														<button
															type="button"
															onClick={() => {
																clearFormData();
																setShowResumeMessage(false);
																goToStep(1);
																// Reset all form data
																setNinData({ nin: "", isVerified: false });
																setStepOneData({
																	email: "",
																	password: "",
																	confirmPassword: "",
																	first_name: "",
																	last_name: "",
																	phone_number: "",
																});
																setStepTwoData({
																	date_of_birth: "",
																	blood_group: "",
																	genotype: "",
																	allergies: "",
																	emergency_contact: "",
																});
																setOtpCode("");
																setRegisteredEmail("");
															}}
															className="text-blue-800 underline hover:no-underline font-medium"
														>
															start over
														</button>
														.
													</p>
												</div>
											</div>
										</div>
									)}
									{errors.nin && (
										<p className="mt-2 text-sm text-red-400">{errors.nin}</p>
									)}
								</div>

								<div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
									<p className="text-sm text-blue-700 flex items-start gap-2">
										<ShieldCheck
											size={16}
											weight="bold"
											className="mt-0.5 flex-shrink-0"
										/>
										<span>
											Your NIN will be securely verified with Interswitch
											Identity API when you submit your registration. This
											ensures only you can access your medical records.
										</span>
									</p>
								</div>
							</div>

							<Button
								onClick={handleNINNext}
								disabled={ninData.nin.length !== 11}
								className="w-full h-12 bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
								size="lg"
							>
								Continue (Skip Verification)
								<ArrowRight size={20} weight="bold" />
							</Button>

							<p className="text-center text-sm text-neutral-600">
								Already have an account?{" "}
								<button
									type="button"
									onClick={() => navigate({ to: "/login" })}
									className="text-primary hover:underline font-medium"
								>
									Sign in
								</button>
							</p>
						</div>
					)}

					{/* Step 2: Personal Info */}
					{step === 2 && (
						<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
							<div>
								<h1 className="text-3xl font-bold text-neutral-900 font-plus-sans mb-2">
									Personal Details
								</h1>
								<p className="text-neutral-600">
									{ninData.isVerified ? 
										"We've auto-filled your verified details from your NIN" :
										"We'll verify your details via Interswitch when you submit"
									}
								</p>
							</div>

							{ninData.isVerified && verifiedNINDetails && (
								<div className="p-4 rounded-lg bg-green-50 border border-green-200">
									<div className="flex items-start gap-3">
										<CheckCircle size={20} weight="bold" className="text-green-600 mt-0.5" />
										<div>
											<h4 className="text-sm font-medium text-green-900 mb-1">
												Auto-filled from NIN Verification
											</h4>
											<p className="text-sm text-green-700">
												Your name, phone number, and date of birth have been automatically filled from your verified NIN details.
											</p>
										</div>
									</div>
								</div>
							)}

							<div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
								<p className="text-sm text-amber-800 flex items-start gap-2">
									<ShieldCheck
										size={16}
										weight="bold"
										className="mt-0.5 flex-shrink-0"
									/>
									<span>
										<strong>Important:</strong> Enter your first and last name
										exactly as they appear on your National ID card. Your
										details will be verified via Interswitch.
									</span>
								</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<Input
									label="First Name"
									icon={<User size={18} />}
									placeholder="John"
									value={stepOneData.first_name}
									onChange={(e) =>
										handleStepOneChange("first_name", e.target.value)
									}
									error={errors.first_name}
									variant="light"
								/>
								<Input
									label="Last Name"
									icon={<User size={18} />}
									placeholder="Doe"
									value={stepOneData.last_name}
									onChange={(e) =>
										handleStepOneChange("last_name", e.target.value)
									}
									error={errors.last_name}
									variant="light"
								/>
							</div>

							<Input
								label="Email Address"
								type="email"
								icon={<EnvelopeSimple size={18} />}
								placeholder="john.doe@example.com"
								value={stepOneData.email}
								onChange={(e) => handleStepOneChange("email", e.target.value)}
								error={errors.email}
								variant="light"
							/>

							<Input
								label="Phone Number"
								type="tel"
								icon={<Phone size={18} />}
								placeholder="+234 801 234 5678"
								value={stepOneData.phone_number}
								onChange={(e) =>
									handleStepOneChange("phone_number", e.target.value)
								}
								error={errors.phone_number}
								variant="light"
							/>

							<div className="relative">
								<Input
									label="Password"
									type={showPassword ? "text" : "password"}
									icon={<Lock size={18} />}
									placeholder="••••••••"
									value={stepOneData.password}
									onChange={(e) =>
										handleStepOneChange("password", e.target.value)
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
									value={stepOneData.confirmPassword}
									onChange={(e) =>
										handleStepOneChange("confirmPassword", e.target.value)
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

							<div className="flex gap-3">
								<Button
									onClick={() => goToStep(1)}
									variant="outline"
									className="flex-1 h-12"
									size="lg"
									type="button"
								>
									<ArrowLeft size={20} weight="bold" />
									Back
								</Button>
								<Button
									onClick={handleStepOneNext}
									className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white"
									size="lg"
								>
									Continue
									<ArrowRight size={20} weight="bold" />
								</Button>
							</div>
						</div>
					)}

					{/* Step 3: Medical Info */}
					{step === 3 && (
						<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
							<div>
								<h1 className="text-3xl font-bold text-neutral-900 font-plus-sans mb-2">
									Medical Information
								</h1>
								<p className="text-neutral-600">
									Help us keep your records accurate and secure
								</p>
							</div>



							<div>
								<Input
									label="Date of Birth"
									type="date"
									icon={<CalendarBlank size={18} />}
									value={stepTwoData.date_of_birth}
									onChange={(e) =>
										handleStepTwoChange("date_of_birth", e.target.value)
									}
									error={errors.date_of_birth}
									variant="light"
								/>
								<p className="mt-1 text-xs text-amber-700 flex items-center gap-1">
									<ShieldCheck size={12} weight="bold" />
									Will be verified via Interswitch
								</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="blood-group"
										className="block text-sm font-medium text-neutral-700 mb-2 font-plus-sans"
									>
										Blood Group
									</label>
									<Select
										value={stepTwoData.blood_group}
										onValueChange={(value) =>
											handleStepTwoChange("blood_group", value)
										}
									>
										<SelectTrigger
											id="blood-group"
											icon={<Drop size={18} />}
											variant="light"
										>
											<SelectValue placeholder="Select" />
										</SelectTrigger>
										<SelectContent>
											{BLOOD_GROUPS.map((bg) => (
												<SelectItem key={bg} value={bg}>
													{bg}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<label
										htmlFor="genotype"
										className="block text-sm font-medium text-neutral-700 mb-2 font-plus-sans"
									>
										Genotype
									</label>
									<Select
										value={stepTwoData.genotype}
										onValueChange={(value) =>
											handleStepTwoChange("genotype", value)
										}
									>
										<SelectTrigger
											id="genotype"
											icon={<Dna size={18} />}
											variant="light"
										>
											<SelectValue placeholder="Select" />
										</SelectTrigger>
										<SelectContent>
											{GENOTYPES.map((gt) => (
												<SelectItem key={gt} value={gt}>
													{gt}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div>
								<label
									htmlFor="allergies-textarea"
									className="block text-sm font-medium text-neutral-700 mb-2 font-plus-sans"
								>
									Known Allergies (Optional)
								</label>
								<div className="relative">
									<FirstAidKit
										size={18}
										className="absolute left-3 top-3 text-neutral-400"
									/>
									<textarea
										id="allergies-textarea"
										className="min-h-24 w-full rounded-lg border border-neutral-200 bg-white pl-11 pr-4 py-3 text-base text-neutral-900 transition-all outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary/10 placeholder:text-neutral-400 resize-none"
										placeholder="e.g., Penicillin, Peanuts..."
										value={stepTwoData.allergies}
										onChange={(e) =>
											handleStepTwoChange("allergies", e.target.value)
										}
									/>
								</div>
							</div>

							<Input
								label="Emergency Contact (Optional)"
								type="tel"
								icon={<UserCircle size={18} />}
								placeholder="+234 801 234 5678"
								value={stepTwoData.emergency_contact}
								onChange={(e) =>
									handleStepTwoChange("emergency_contact", e.target.value)
								}
								variant="light"
							/>

							{errors.submit && (
								<div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
									<p className="text-sm text-red-400 mb-2 font-medium">
										{errors.submit}
									</p>
									{errors.submit.toLowerCase().includes("nin") && (
										<p className="text-xs text-red-300/80">
											Please use the "Back" button to correct your name or date
											of birth, then try again.
										</p>
									)}
								</div>
							)}

							<div className="flex gap-3">
								<Button
									onClick={() => goToStep(2)}
									variant="outline"
									className="flex-1 h-12"
									size="lg"
									type="button"
								>
									<ArrowLeft size={20} weight="bold" />
									Back
								</Button>
								<Button
									onClick={handleStepTwoSubmit}
									disabled={registerMutation.isPending}
									className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white"
									size="lg"
								>
									{registerMutation.isPending
										? "Creating Account..."
										: "Create Account"}
									<ArrowRight size={20} weight="bold" />
								</Button>
							</div>
						</div>
					)}

					{/* Step 4: OTP Verification */}
					{step === 4 && (
						<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
							<div className="text-center">
								<div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
									<ShieldCheck
										size={32}
										weight="bold"
										className="text-primary"
									/>
								</div>
								<h1 className="text-3xl font-bold text-neutral-900 font-plus-sans mb-2">
									Verify Your Email
								</h1>
								<p className="text-neutral-600">
									We've sent a 6-digit code to
									<br />
									<span className="text-primary font-medium">
										{registeredEmail}
									</span>
								</p>
							</div>

							<div>
								<label
									htmlFor="otp-input"
									className="block text-sm font-medium text-neutral-700 mb-2 font-plus-sans text-center"
								>
									Enter Verification Code
								</label>
								<input
									id="otp-input"
									type="text"
									maxLength={6}
									className="h-16 w-full rounded-lg border border-neutral-200 bg-white px-4 text-center text-2xl font-bold text-neutral-900 tracking-[0.5em] transition-all outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary/10"
									placeholder="000000"
									value={otpCode}
									onChange={(e) =>
										handleOTPChange(e.target.value.replace(/\D/g, ""))
									}
								/>
								{errors.otp && (
									<p className="mt-2 text-sm text-red-400 text-center">
										{errors.otp}
									</p>
								)}
							</div>

							<Button
								onClick={handleOTPSubmit}
								disabled={verifyOTPMutation.isPending || otpCode.length !== 6}
								className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
								size="lg"
							>
								{verifyOTPMutation.isPending
									? "Verifying..."
									: "Verify & Continue"}
								<CheckCircle size={20} weight="bold" />
							</Button>

							<div className="text-center">
								<p className="text-sm text-neutral-600 mb-2">
									Didn't receive the code?
								</p>
								<button
									type="button"
									onClick={() => resendOTPMutation.mutate()}
									disabled={resendOTPMutation.isPending}
									className="text-primary hover:underline font-medium text-sm disabled:opacity-50"
								>
									{resendOTPMutation.isPending ? "Sending..." : "Resend Code"}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Right Side - Trust Messaging */}
			<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0D1F2D] via-[#0A3D34] to-[#0D1F2D] p-12 items-center justify-center relative overflow-hidden">
				{/* Teal radial glow */}
				<div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />

				{/* Background Pattern */}
				<div
					className="absolute inset-0 opacity-[0.03]"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					}}
				/>

				<div className="relative z-10 max-w-lg space-y-8">
					<div className="space-y-4">
						<Sparkle size={48} weight="duotone" className="text-primary" />
						<h2 className="text-4xl lg:text-5xl font-bold text-white font-plus-sans leading-tight">
							Your Health Records,
							<br />
							Secure & Accessible
						</h2>
						<p className="text-xl text-white/60 leading-relaxed">
							MediNexus provides a secure platform for managing your medical
							records with NIN-based verification and consent controls.
						</p>
					</div>

					<div className="space-y-4 pt-8">
						{[
							{
								icon: <ShieldCheck size={24} weight="duotone" />,
								title: "NIN-Verified Security",
								description:
									"Your identity is verified through your National ID, ensuring only you can access your records.",
							},
							{
								icon: <Clock size={24} weight="duotone" />,
								title: "Access Audit Trail",
								description:
									"Track who accessed your records and when, with detailed activity logs.",
							},
							{
								icon: <CheckCircle size={24} weight="duotone" />,
								title: "Consent Management",
								description:
									"Approve or deny access requests from healthcare providers on your terms.",
							},
						].map((feature) => (
							<div
								key={feature.title}
								className="flex gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-colors"
							>
								<div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
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
