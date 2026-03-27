import {
	ArrowRight,
	CheckCircle,
	EnvelopeSimple,
	Eye,
	EyeSlash,
	Heart,
	Lock,
	ShieldCheck,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { authService } from "#/services/auth.service";
import { useAuthStore } from "#/stores/authStore";

export const Route = createFileRoute("/login")({
	component: PatientLogin,
});

function PatientLogin() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const loginMutation = useMutation({
		mutationKey: ["patient-login"],
		mutationFn: authService.login,
		onSuccess: (data) => {
			const role = data.user_type === "PROVIDER" ? "doctor" : "patient";
			const user = {
				id: "",
				email: data.email,
				first_name: data.first_name || data.email.split("@")[0],
				last_name: data.last_name || "",
				role: role,
			};

			useAuthStore
				.getState()
				.login({ access: data.access, refresh: data.refresh }, user);

			if (role === "doctor") {
				navigate({ to: "/doctor/dashboard" });
			} else {
				navigate({ to: "/dashboard" });
			}
		},
		onError: (error: any) => {
			const errorMsg =
				error.response?.data?.detail ||
				error.response?.data?.message ||
				"Invalid email or password";
			setErrors({ submit: errorMsg });
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Record<string, string> = {};

		if (!formData.email) newErrors.email = "Email is required";
		if (!formData.password) newErrors.password = "Password is required";

		setErrors(newErrors);

		if (Object.keys(newErrors).length === 0) {
			loginMutation.mutate(formData);
		}
	};

	return (
		<div className="min-h-screen bg-white flex">
			{/* Left Side - Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
				<div className="w-full max-w-md">
					{/* Logo */}
					<div className="mb-8">
						<h2 className="text-neutral-900 font-plus-sans text-2xl font-bold">
							MediNexus
						</h2>
						<p className="text-neutral-500 text-sm mt-1">Patient Portal</p>
					</div>

					<div className="space-y-6">
						<div>
							<h1 className="text-4xl font-bold text-neutral-900 font-plus-sans mb-2">
								Welcome Back
							</h1>
							<p className="text-neutral-600">
								Sign in to access your medical records
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-5">
							<Input
								label="Email Address"
								type="email"
								icon={<EnvelopeSimple size={18} />}
								placeholder="john.doe@example.com"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								error={errors.email}
								variant="light"
							/>

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

							<div className="flex items-center justify-between">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										className="w-4 h-4 rounded border-neutral-300 bg-white text-primary focus:ring-primary focus:ring-offset-0"
									/>
									<span className="text-sm text-neutral-600">Remember me</span>
								</label>
								<Link
									to="/forgot-password"
									className="text-sm text-primary hover:underline font-medium"
								>
									Forgot password?
								</Link>

							</div>

							{errors.submit && (
								<div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
									<p className="text-sm text-red-400">{errors.submit}</p>
								</div>
							)}

							<Button
								type="submit"
								disabled={loginMutation.isPending}
								className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
								size="lg"
							>
								{loginMutation.isPending ? "Signing in..." : "Sign In"}
								<ArrowRight size={20} weight="bold" />
							</Button>
						</form>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-neutral-200" />
							</div>
							<div className="relative flex justify-center text-xs">
								<span className="bg-white px-4 text-neutral-400">OR</span>
							</div>
						</div>

						<div className="text-center space-y-3">
							<p className="text-sm text-neutral-600">
								Don't have an account?{" "}
								<button
									type="button"
									onClick={() => navigate({ to: "/register" })}
									className="text-primary hover:underline font-medium"
								>
									Create one
								</button>
							</p>
							<p className="text-sm text-neutral-600">
								Are you a healthcare provider?{" "}
								<button
									type="button"
									onClick={() => navigate({ to: "/doctor/login" })}
									className="text-primary hover:underline font-medium"
								>
									Sign in as Doctor
								</button>
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Right Side - Trust Messaging */}
			<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0D1F2D] via-[#0A3D34] to-[#0D1F2D] p-12 items-center justify-center relative overflow-hidden">
				{/* Animated Background Elements */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
					<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700" />
				</div>

				<div className="relative z-10 max-w-lg space-y-12">
					<div className="space-y-6">
						<h2 className="text-5xl font-bold text-white font-plus-sans leading-tight">
							Your Medical Records,
							<br />
							Accessible & Secure
						</h2>

						<p className="text-lg text-white/60 leading-relaxed">
							Access your medical history securely from anywhere. MediNexus
							provides NIN-verified access to your health records with full
							consent controls.
						</p>
					</div>

					{/* Feature Cards */}
					<div className="grid gap-4">
						{[
							{
								icon: <ShieldCheck size={28} weight="duotone" />,
								title: "NIN-Verified Access",
								description:
									"Your records are secured and verified with your National ID",
							},
							{
								icon: <Heart size={28} weight="duotone" />,
								title: "Emergency Access",
								description:
									"Authorized emergency responders can access critical information when needed",
							},
							{
								icon: <CheckCircle size={28} weight="duotone" />,
								title: "Consent-Based Sharing",
								description:
									"You control who accesses your records through consent approvals",
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
