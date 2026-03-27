import { ShieldCheck } from "@phosphor-icons/react";
import { Avatar, AvatarFallback } from "#/components/ui/avatar";
import { cn, getAvatarColor, getInitials } from "#/lib/utils";
import { useAuthStore } from "#/stores/authStore";

interface MobileHeaderProps {
	role: "doctor" | "patient";
}

export function MobileHeader({ role }: MobileHeaderProps) {
	const { user } = useAuthStore();
	const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
	const initials = getInitials(fullName, role === "doctor" ? "DR" : "PT");
	const avatarColor = getAvatarColor(fullName);

	return (
		<header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white px-5 py-4">
			<div className="flex items-center justify-between">
				{/* Logo */}
				<div className="flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 shadow-sm">
						<ShieldCheck size={16} weight="bold" className="text-white" />
					</div>
					<span className="text-[17px] font-bold tracking-tight font-plus-sans text-neutral-900">
						MediNexus
					</span>
				</div>

				{/* User Avatar */}
				<Avatar size="default" className="ring-2 ring-primary-700">
					<AvatarFallback
						className={cn("text-sm font-medium font-plus-sans", avatarColor)}
					>
						{initials}
					</AvatarFallback>
				</Avatar>
			</div>
		</header>
	);
}
