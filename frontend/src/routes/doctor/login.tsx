import {
	ArrowRight,
	Clock,
	EnvelopeSimple,
	Hospital,
	Lock,
	ShieldCheck,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { authService } from "#/services/auth.service";
import { useAuthStore } from "#/stores/authStore";

export const Route = createFileRoute("/doctor/login")({
	component: DoctorLogin,
});

function DoctorLogin() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const 	loginMutation = useMutation({
		mutationFn: authService.login,
		onSuccess: (data) => {
			const user = {
				id: "",
				email: data.email,
				first_name: data.email.split("@")[0],
				last_name: "",
				role: "doctor" as const,
			};

			useAuthStore
				.getState()
				.login({ access: data.access, refresh: data.refresh }, user);

			navigate({ to: "/doctor/dashboard" });
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
						<p className="text-neutral-500 text-sm mt-1">Provider Portal</p>
					</div>

					<div className="space-y-6">
						<div>
							<h1 className="text-4xl font-bold text-neutral-900 font-plus-sans mb-2">
								Provider Sign In
							</h1>
							<p className="text-neutral-600">
								Access your dashboard and patient records
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-5">
							<Input
								label="Email Address"
								type="email"
								icon={<EnvelopeSimple size={18} />}
								placeholder="doctor@hospital.com"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								error={errors.email}
								variant="light"
							/>

							<Input
								label="Password"
								type="password"
								icon={<Lock size={18} />}
								placeholder="••••••••"
								value={formData.password}
								onChange={(e) =>
									setFormData({ ...formData, password: e.target.value })
								}
								error={errors.password}
								variant="light"
							/>

							<div className="flex items-center justify-between">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										className="w-4 h-4 rounded border-neutral-300 bg-white text-primary focus:ring-primary focus:ring-offset-0"
									/>
									<span className="text-sm text-neutral-600">Remember me</span>
								</label>
								<button
									type="button"
									className="text-sm text-primary hover:underline font-medium"
								>
									Forgot password?
								</button>
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
								Don't have a provider account?{" "}
								<button
									type="button"
									onClick={() => navigate({ to: "/doctor/register" })}
									className="text-primary hover:underline font-medium"
								>
									Register now
								</button>
							</p>
							<p className="text-sm text-neutral-600">
								Are you a patient?{" "}
								<button
									type="button"
									onClick={() => navigate({ to: "/login" })}
									className="text-primary hover:underline font-medium"
								>
									Sign in here
								</button>
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Right Side - Provider Messaging */}
			<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0D1F2D] via-[#0A3D34] to-[#0D1F2D] p-12 items-center justify-center relative overflow-hidden">
				{/* Animated Background */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
					<div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse delay-500" />
				</div>

				<div className="relative z-10 max-w-lg space-y-12">
					<div className="space-y-6">
						<h2 className="text-5xl font-bold text-white font-plus-sans leading-tight">
							Access Patient Records
							<br />
							Securely
						</h2>

						<p className="text-lg text-white/60 leading-relaxed">
							MediNexus provides healthcare providers with secure, consent-based
							access to comprehensive patient medical histories.
						</p>
					</div>

					{/* Feature Cards */}
					<div className="grid gap-4">
						{[
							{
								icon: <Clock size={28} weight="duotone" />,
								title: "Quick NIN Lookup",
								description:
									"Access patient records using their National Identification Number",
							},
							{
								icon: <ShieldCheck size={28} weight="duotone" />,
								title: "Consent-Based Access",
								description:
									"All record access requires patient approval and is fully audited",
							},
							{
								icon: <Hospital size={28} weight="duotone" />,
								title: "Cross-Facility Access",
								description:
									"View patient records from multiple healthcare facilities with authorization",
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
