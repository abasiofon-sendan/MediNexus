import { ShieldCheckIcon } from "@phosphor-icons/react";

const Logo = () => {
	return (
		<div className="flex items-center gap-2.5">
			<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
				<ShieldCheckIcon size={18} weight="bold" />
			</div>
			<span className="text-[19px] font-bold tracking-tight text-white font-plus-sans">
				MediNexus
			</span>
		</div>
	);
};

export default Logo;
