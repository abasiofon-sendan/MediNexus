import {
	ArrowRightIcon,
	DeviceMobileIcon,
	LockKeyIcon,
	ScrollIcon,
	ShieldCheckIcon,
} from "@phosphor-icons/react";
import { useAOS } from "#/hooks/useAOS";

const FEATURES = [
	{
		icon: (
			<DeviceMobileIcon size={28} weight="duotone" className="text-primary" />
		),
		title: "2FA Write Authorization",
		desc: "No doctor can add or edit a record without your explicit OTP approval. Every write operation requires your sign-off from your mobile phone — giving you final authority over your own data.",
		flip: false,
		ui: (
			<div className="rounded-xl border border-slate-100 bg-bg p-5 shadow-card">
				<div className="flex items-center gap-3 mb-4">
					<div className="w-10 h-10 rounded-full bg-primary-100/50 flex items-center justify-center">
						<ShieldCheckIcon size={20} weight="bold" className="text-primary" />
					</div>
					<div>
						<p className="text-[13px] font-semibold text-ink">Approve Record</p>
						<p className="text-[12px] text-secondary">Security Verification</p>
					</div>
				</div>
				<p className="text-[12px] text-secondary mb-4">
					Dr. Nkechi Adekunle is requesting to save a Diagnosis record to your
					file.
				</p>
				<div className="flex gap-1.5 mb-4">
					{[...Array(6)].map((_, i) => (
						<div
							key={_}
							className="flex-1 h-16 rounded-md bg-primary-300/40 border border-primary/20 flex items-center justify-center font-mono font-bold text-primary-900 text-[16px]"
						>
							{["3", "8", "4", "•", "•", "•"][i]}
						</div>
					))}
				</div>
				<div className="flex gap-2 font-plus-sans">
					<div className="flex-1 h-13 rounded-md bg-primary flex items-center justify-center">
						<span className="text-[12px] font-semibold text-white">
							Approve
						</span>
					</div>
					<div className="flex-1 h-13 rounded-md border border-red-200 flex items-center justify-center">
						<span className="text-[12px] font-semibold text-red-600">
							Reject
						</span>
					</div>
				</div>
			</div>
		),
	},
	{
		icon: <ScrollIcon size={28} weight="duotone" className="text-primary" />,
		title: "Living Audit Log",
		desc: "See every access, every view, every edit attempt — in real time, from your phone. Every event is timestamped, actor-labeled, and geographically tagged. Nothing is hidden.",
		flip: true,
		ui: (
			<div className="rounded-xl border border-slate-100 bg-primary-100/60 p-5 shadow-card space-y-2">
				{[
					{
						color: "bg-blue-100",
						tcolor: "text-blue-600",
						action: "Viewed",
						name: "Dr. Nkechi Adekunle",
						res: "Medical History",
						time: "2:32 PM",
					},
					{
						color: "bg-amber-100",
						tcolor: "text-amber-600",
						action: "Edit Request",
						name: "Dr. Emeka Obi",
						res: "Diagnosis",
						time: "10:15 AM",
					},
					{
						color: "bg-green-100",
						tcolor: "text-green-600",
						action: "Approved",
						name: "You",
						res: "Diagnosis Record",
						time: "10:16 AM",
					},
					{
						color: "bg-purple-100",
						tcolor: "text-purple-600",
						action: "Exported",
						name: "Lab Tech. Bola",
						res: "CBC Results",
						time: "Yesterday",
					},
				].map((item) => (
					<div
						key={item.name}
						className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-100"
					>
						<div className={`w-2 h-8 rounded-full ${item.color}`} />
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<span className="text-[12px] font-semibold text-ink truncate">
									{item.name}
								</span>
								<span
									className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${item.color} ${item.tcolor}`}
								>
									{item.action}
								</span>
							</div>
							<p className="text-[11px] text-neutral-500">{item.res}</p>
						</div>
						<span className="text-[11px] text-primary-700 whitespace-nowrap">
							{item.time}
						</span>
					</div>
				))}
			</div>
		),
	},
	{
		icon: <LockKeyIcon size={28} weight="duotone" className="text-primary" />,
		title: "Consent Management",
		desc: "Grant time-bound access to any hospital or doctor. Set it to expire in 1 hour, 24 hours, or 1 week. Revoke it at any time from your phone — even mid-consultation.",
		flip: false,
		ui: (
			<div className="rounded-xl border border-slate-100 bg-bg p-5 shadow-card space-y-3">
				<div className="flex items-center justify-between p-3 bg-white rounded-lg border-l-4 border-primary border border-slate-100">
					<div>
						<p className="text-[12px] font-semibold text-ink">
							Lagos General Hospital
						</p>
						<p className="text-[11px] text-secondary">
							Dr. Nkechi Adekunle · Expires in 18h
						</p>
					</div>
					<span className="text-[10px] font-semibold bg-primary-light text-primary rounded px-2 py-0.5 uppercase">
						Active
					</span>
				</div>
				<div className="flex items-center justify-between p-3 bg-white rounded-lg border-dashed border border-slate-200 opacity-60">
					<div>
						<p className="text-[12px] font-semibold text-ink">
							St. Nicholas Hospital
						</p>
						<p className="text-[11px] text-secondary">
							Any Doctor · Expired Feb 21
						</p>
					</div>
					<span className="text-[10px] font-semibold bg-slate-100 text-slate-500 rounded px-2 py-0.5 uppercase">
						Expired
					</span>
				</div>
				<button className="w-full h-13 font-plus-sans rounded-md border border-primary text-primary text-[12px] font-semibold hover:bg-primary-light transition-colors">
					+ Grant New Consent
				</button>
			</div>
		),
	},
];

export function Features() {
	const { getAOSProps } = useAOS();

	return (
		<section className="py-16 bg-white" {...getAOSProps("fade-up")}>
			<div className="container mx-auto px-5 md:px-10 space-y-0">
				{FEATURES.map((feature, i) => (
					<div
						key={feature.title}
						className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-16 md:py-20 ${i > 0 ? "border-t border-slate-100" : ""}`}
						{...getAOSProps("fade-up", i * 100)}
					>
						<div
							className={feature.flip ? "md:order-2" : ""}
							{...getAOSProps("fade-up", i * 100 + 50)}
						>
							<div className="w-14 h-14 rounded-xl bg-primary-300/30 flex items-center justify-center mb-6">
								{feature.icon}
							</div>
							<h3 className="font-heading font-bold text-[24px] md:text-[28px] text-ink mb-4 tracking-tight">
								{feature.title}
							</h3>
							<p className="text-[15px] text leading-relaxed mb-6">
								{feature.desc}
							</p>
							<a
								href="#"
								className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary hover:text-primary-dark transition-colors"
							>
								Learn more <ArrowRightIcon size={14} weight="bold" />
							</a>
						</div>
						<div
							className={feature.flip ? "md:order-1" : ""}
							{...getAOSProps("fade-up", i * 100 + 100)}
						>
							{feature.ui}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
