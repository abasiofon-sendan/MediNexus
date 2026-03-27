import {
	CheckCircleIcon,
	ShieldCheckIcon,
	StethoscopeIcon,
} from "@phosphor-icons/react";
import { DeviceMobileIcon } from "@phosphor-icons/react/dist/ssr";
import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";

const Hero = () => {
	return (
		<main className="relative min-h-screen bg-[#0D1F2D] bg-primary-950/ flex items-center justify-center overflow-hidden pt-[68px]">
			<div
				className="absolute inset-0 opacity-[0.04]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
				}}
			/>
			<div className="relative z-10 container mx-auto px-5 md:px-10 py-20">
				{" "}
				<div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
					<div>
						{/* Headline */}
						<h1 className="font-heading font-extrabold text-white leading-[1.05] tracking-[-0.03em] text-[44px] sm:text-[56px] lg:text-[64px] [animation:fade-in_600ms_ease-out_100ms_both]">
							Your medical history.
							<br />
							<span className="text-primary-700">Wherever you go.</span>
						</h1>
						{/* Subtext */}
						<p className="mt-6 text-[17px] text-white/60 leading-relaxed max-w-[480px] [animation:fade-in_600ms_ease-out_250ms_both]">
							One unified record, secured by your NIN. Grant doctors access in a
							single tap. See every view, every edit, in real time.
						</p>

						{/* CTAs */}
						<div className="mt-10 flex flex-col sm:flex-row gap-3 [animation:fade-in_600ms_ease-out_400ms_both]">
							<Link to="/register" className="w-full sm:w-auto">
								<Button
									size="lg"
									variant="secondary"
									className="w-full hover:-translate-y-0.5 transition-transform"
								>
									<ShieldCheckIcon size={20} weight="bold" />
									Enter as Patient
								</Button>
							</Link>
							<Link to="/doctor/register" className="w-full sm:w-auto">
								<Button
									size="lg"
									variant="outline"
									className="w-full border-white text-white hover:-translate-y-0.5 transition-transform"
								>
									<StethoscopeIcon size={20} weight="regular" />
									Enter as Doctor
								</Button>
							</Link>
						</div>
					</div>
					{/* Right — floating UI mockup */}
					<div className="relative [animation:fade-in_800ms_ease-out_550ms_both] hidden lg:block">
						{/* Floating card — consent confirmation */}
						<div className="absolute -top-8 -right-4 z-10 w-56 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-3 shadow-modal -rotate-3">
							<div className="flex items-center gap-2 mb-2">
								<div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
									<CheckCircleIcon
										size={14}
										weight="fill"
										className="text-primary"
									/>
								</div>
								<span className="text-[11px] font-semibold text-white/80">
									Consent Granted
								</span>
							</div>
							<p className="text-[10px] text-white/50 leading-relaxed">
								Dr. Nkechi Adekunle · Lagos General Hospital · 24h access
							</p>
						</div>

						{/* Floating card — 2FA prompt */}
						<div className="absolute -bottom-4 -left-6 z-10 w-52 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-3 shadow-modal rotate-2">
							<div className="flex items-center gap-2 mb-2">
								<div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
									<DeviceMobileIcon
										size={14}
										weight="fill"
										className="text-amber-400"
									/>
								</div>
								<span className="text-[11px] font-semibold text-white/80">
									2FA Approval
								</span>
							</div>
							<p className="text-[10px] text-white/50 leading-relaxed">
								Dr. Emeka Obi is requesting write access · Tap to approve
							</p>
						</div>

						{/* Main mockup card */}
						<div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] [animation:float_6s_ease-in-out_infinite]">
							{/* Window chrome */}
							<div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10">
								<div className="w-2.5 h-2.5 rounded-full bg-white/20" />
								<div className="w-2.5 h-2.5 rounded-full bg-white/20" />
								<div className="w-2.5 h-2.5 rounded-full bg-white/20" />
								<span className="ml-2 text-[11px] text-white/40 font-mono">
									Living Audit Log
								</span>
							</div>

							{/* Audit feed items */}
							{[
								{
									actor: "Dr. Nkechi Adekunle",
									action: "Viewed",
									resource: "Medical History",
									time: "2:32 PM",
									color: "bg-blue-500/20 text-blue-400",
								},
								{
									actor: "Pharm. Taiwo Adeyemi",
									action: "Viewed",
									resource: "Prescriptions",
									time: "11:15 AM",
									color: "bg-blue-500/20 text-blue-400",
								},
								{
									actor: "Dr. Nkechi Adekunle",
									action: "Edit Request",
									resource: "Diagnosis",
									time: "Yesterday",
									color: "bg-amber-500/20 text-amber-400",
								},
								{
									actor: "Lab Tech. Bola Okafor",
									action: "Exported",
									resource: "Lab Results",
									time: "Feb 24",
									color: "bg-purple-500/20 text-purple-400",
								},
							].map((item, i) => (
								<div
									key={i}
									className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0"
								>
									<div
										className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ${item.color.split(" ")[0]}`}
									/>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-1.5 flex-wrap">
											<span className="text-[11px] font-plus-sans font-semibold text-white/80 truncate">
												{item.actor}
											</span>
											<span
												className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${item.color}`}
											>
												{item.action}
											</span>
										</div>
										<p className="text-[10px] text-white/40 mt-0.5">
											{item.resource}
										</p>
									</div>
									<span className="text-[10px] text-white/30 whitespace-nowrap">
										{item.time}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default Hero;
