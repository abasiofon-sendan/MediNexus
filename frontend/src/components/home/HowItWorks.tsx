import {
	DeviceMobileIcon,
	ListChecksIcon,
	StethoscopeIcon,
} from "@phosphor-icons/react";
import { Card } from "../ui/card";

const STEPS = [
	{
		step: "01",
		icon: <StethoscopeIcon size={32} weight="fill" className="text-primary" />,
		title: "Visit any hospital",
		desc: "Walk into any accredited clinic in Nigeria. The doctor searches for your record using your NIN — no card, no file.",
	},
	{
		step: "02",
		icon: <DeviceMobileIcon size={32} weight="fill" className="text-primary" />,
		title: "Grant access in one tap",
		desc: "Your phone receives a consent prompt the instant the doctor requests access. Tap once to approve — or deny.",
	},
	{
		step: "03",
		icon: <ListChecksIcon size={32} weight="fill" className="text-primary" />,
		title: "Your doctor sees everything",
		desc: "Your full verified history — diagnoses, prescriptions, lab results — appears immediately in the doctor's screen.",
	},
];
const HowItWorks = () => {
	return (
		<section className="py-18 md:py-28 mx-auto px-5 md:px-10 container">
			<div className="text-center mb-16">
				<h2 className="font-plus-sans font-bold text-[32px] md:text-[42px] text-ink tracking-tight mb-4">
					How it works
				</h2>
				<p className="text-base max-w-xl mx-auto leading-relaxed">
					Three steps. Any hospital. Your entire history — in seconds.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
				{STEPS.map((step) => (
					<Card key={step.step} className="relative md:p-8">
						<span className="absolute text-primary-800/20  right-6 md:right-8 font-extrabold text-6xl font-plus-sans">
							{step.step}
						</span>
						<div className="relative z-10">
							<div className="w-14 h-14 rounded-xl bg-primary-100/90 flex items-center justify-center mb-6">
								{step.icon}
							</div>
							<h3 className="font-plus-sans font-bold text-[18px] text-ink mb-3">
								{step.title}
							</h3>
							<p className="text-[15px] text-neutral-600  leading-relaxed">
								{step.desc}
							</p>
						</div>
					</Card>
				))}
			</div>
		</section>
	);
};

export default HowItWorks;
