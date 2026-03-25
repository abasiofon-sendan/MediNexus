import Logo from "./Logo";

export default function Footer() {
	const year = new Date().getFullYear();

	const FOOTER_LINKS = {
		Product: [
			{ label: "Audit Log", link: "#" },
			{ label: "Access Consents", link: "#" },
			{ label: "Record Management", link: "#" },
			{ label: "2FA Security", link: "#" },
		],
		Legal: [
			{ label: "Terms of Service", link: "#" },
			{ label: "Privacy Policy", link: "#" },
		],
		Contact: [
			{ label: "Support", link: "#" },
			{ label: "Partnership", link: "#" },
		],
	};

	return (
		<footer className="bg-[#0D1F2D] py-10 p-5 md:py-14 flex flex-col">
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 container mx-auto ">
				<div className="flex flex-col gap-3">
					<Logo />
					<p className="text-sm text-white/60 leading-relaxed max-w-[200px]">
						Nigeria&apos;s patient-first health data infrastructure.
					</p>
				</div>
				{Object.entries(FOOTER_LINKS).map(([heading, links]) => (
					<div key={heading}>
						<p className="text-base font-semibold uppercase tracking-widest text-white/30 mb-4">
							{heading}
						</p>
						<ul className="space-y-2.5">
							{links.map((link) => (
								<li key={link.label}>
									<a
										href={link.link}
										className="text-sm text-white/50 hover:text-white transition-colors"
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>
				))}
				<div className=""></div>
			</div>
			<div className="mt-12 pt-6 border-t border-white/8 text-center">
				<p className="text-sm text-white/60">
					&copy; {year} MediNexus. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
