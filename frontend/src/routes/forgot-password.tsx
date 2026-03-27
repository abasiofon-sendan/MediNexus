import {
	ArrowLeft,
	CheckCircle,
	EnvelopeSimple,
	Eye,
	EyeSlash,
	Lock,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { authService } from "#/services/auth.service";

export const Route = createFileRoute("/forgot-password")({
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	const navigate = useNavigate();
	const [step, setStep] = useState<1 | 2>(1);
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [successMessage, setSuccessMessage] = useState("");

	const requestOtpMutation = useMutation({
		mutationFn: (email: string) => authService.passwordResetRequest(email),
		onSuccess: () => {
			setSuccessMessage("OTP sent to your email address");
			setStep(2);
		},
		onError: (error: any) => {
			const errorMsg =
				error.response?.data?.detail ||
				error.response?.data?.message ||
				"Failed to send OTP. Please try again.";
			setErrors({ submit: errorMsg });
		},
	});

	const resetPasswordMutation = useMutation({
		mutationFn: () =>
			authService.passwordResetConfirm(email, otp, newPassword),
		onSuccess: () => {
			setSuccessMessage("Password reset successfully!");
			setTimeout(() => {
				navigate({ to: "/login" });
			}, 2000);
		},
		onError: (error: any) => {
			const errorMsg =
				error.response?.data?.detail ||
				error.response?.data?.message ||
				"Failed to reset password. Please try again.";
			setErrors({ submit: errorMsg });
		},
	});

	const handleRequestOtp = (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Record<string, string> = {};

		if (!email) newErrors.email = "Email is required";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			newErrors.email = "Please enter a valid email";

		setErrors(newErrors);
		setSuccessMessage("");

		if (Object.keys(newErrors).length === 0) {
			requestOtpMutation.mutate(email);
		}
	};

	const handleResetPassword = (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Record<string, string> = {};

		if (!otp) newErrors.otp = "OTP is required";
		if (!newPassword) newErrors.newPassword = "New password is required";
		else if (newPassword.length < 8)
			newErrors.newPassword = "Password must be at least 8 characters";
		if (!confirmPassword)
			newErrors.confirmPassword = "Please confirm your password";
		else if (newPassword !== confirmPassword)
			newErrors.confirmPassword = "Passwords do not match";

		setErrors(newErrors);
		setSuccessMessage("");

		if (Object.keys(newErrors).length === 0) {
			resetPasswordMutation.mutate();
		}
	};

	const isPending =
		requestOtpMutation.isPending || resetPasswordMutation.isPending;

	return (
		<div className="min-h-screen bg-white flex">
			<div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
				<div className="w-full max-w-md">
					<div className="mb-8">
						<h2 className="text-neutral-900 font-plus-sans text-2xl font-bold">
							MediNexus
						</h2>
						<p className="text-neutral-500 text-sm mt-1">Patient Portal</p>
					</div>

					<div className="space-y-6">
						<div>
							<button
								type="button"
								onClick={() => {
									if (step === 2) {
										setStep(1);
										setOtp("");
										setNewPassword("");
										setConfirmPassword("");
										setErrors({});
										setSuccessMessage("");
									} else {
										navigate({ to: "/login" });
									}
								}}
								className="flex items-center gap-2 text-neutral-600 hover:text-primary mb-4 transition-colors"
							>
								<ArrowLeft size={20} />
								<span className="text-sm">Back to Login</span>
							</button>
							<h1 className="text-4xl font-bold text-neutral-900 font-plus-sans mb-2">
								{step === 1 ? "Forgot Password?" : "Reset Password"}
							</h1>
							<p className="text-neutral-600">
								{step === 1
									? "Enter your email to receive a verification code"
									: "Enter the OTP sent to your email and create a new password"}
							</p>
						</div>

						{successMessage && !errors.submit && (
							<div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
								<CheckCircle size={20} className="text-green-500" />
								<p className="text-sm text-green-400">{successMessage}</p>
							</div>
						)}

						{errors.submit && (
							<div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
								<p className="text-sm text-red-400">{errors.submit}</p>
							</div>
						)}

						{step === 1 ? (
							<form onSubmit={handleRequestOtp} className="space-y-5">
								<Input
									label="Email Address"
									type="email"
									icon={<EnvelopeSimple size={18} />}
									placeholder="john.doe@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									error={errors.email}
									variant="light"
								/>

								<Button
									type="submit"
									disabled={isPending}
									className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
									size="lg"
								>
									{isPending ? "Sending OTP..." : "Send Verification Code"}
								</Button>
							</form>
						) : (
							<form onSubmit={handleResetPassword} className="space-y-5">
								<p className="text-sm text-neutral-600">
									Resetting password for: <span className="font-medium text-neutral-900">{email}</span>
								</p>

								<Input
									label="OTP Code"
									type="text"
									icon={<CheckCircle size={18} />}
									placeholder="Enter 6-digit code"
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									error={errors.otp}
									variant="light"
									maxLength={6}
								/>

								<div className="relative">
									<Input
										label="New Password"
										type={showPassword ? "text" : "password"}
										icon={<Lock size={18} />}
										placeholder="Min. 8 characters"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										error={errors.newPassword}
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

								<Input
									label="Confirm Password"
									type={showPassword ? "text" : "password"}
									icon={<Lock size={18} />}
									placeholder="Re-enter new password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									error={errors.confirmPassword}
									variant="light"
								/>

								<Button
									type="submit"
									disabled={isPending}
									className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
									size="lg"
								>
									{isPending ? "Resetting Password..." : "Reset Password"}
								</Button>
							</form>
						)}

						<div className="text-center">
							<p className="text-sm text-neutral-600">
								Remember your password?{" "}
								<button
									type="button"
									onClick={() => navigate({ to: "/login" })}
									className="text-primary hover:underline font-medium"
								>
									Sign in
								</button>
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0D1F2D] via-[#0A3D34] to-[#0D1F2D] p-12 items-center justify-center relative overflow-hidden">
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
					<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700" />
				</div>

				<div className="relative z-10 max-w-lg space-y-12">
					<div className="space-y-6">
						<h2 className="text-5xl font-bold text-white font-plus-sans leading-tight">
							Secure Password
							<br />
							Recovery
						</h2>

						<p className="text-lg text-white/60 leading-relaxed">
							We'll help you recover your account safely. Follow the steps
							to create a new password and regain access to your medical
							records.
						</p>
					</div>

					<div className="grid gap-4">
						{[
							{
								icon: <EnvelopeSimple size={28} weight="duotone" />,
								title: "Email Verification",
								description:
									"We'll send a secure code to your registered email address",
							},
							{
								icon: <Lock size={28} weight="duotone" />,
								title: "Create New Password",
								description:
									"Set a strong password that meets our security requirements",
							},
							{
								icon: <CheckCircle size={28} weight="duotone" />,
								title: "Account Secured",
								description:
									"Your account is now protected with your new password",
							},
						].map((feature) => (
							<div
								key={feature.title}
								className="p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 duration-300"
							>
								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 text-white">{feature.icon}</div>
									<div>
										<h3 className="text-white font-plus-sans font-semibold text-lg mb-1">
											{feature.title}
										</h3>
										<p className="text-sm text-white/60 leading-relaxed">
											{feature.description}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
