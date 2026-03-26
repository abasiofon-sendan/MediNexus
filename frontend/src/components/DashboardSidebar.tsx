import { ShieldCheck, SignOut } from "@phosphor-icons/react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { NavItem } from "#/config/navigation";
import { cn, getAvatarColor, getInitials } from "#/lib/utils";
import { useAuthStore } from "#/stores/authStore";

interface DashboardSidebarProps {
	role: "doctor" | "patient";
	items: NavItem[];
}

export function DashboardSidebar({ role, items }: DashboardSidebarProps) {
	const isDark = role === "doctor";

	// Theme classes
	const bgClass = isDark ? "bg-[#0D1F2D]" : "bg-white";
	const borderClass = isDark ? "border-white/[0.08]" : "border-neutral-200";

	return (
		<aside
			className={cn(
				"hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40",
				"w-[68px] lg:w-[260px] border-r transition-all duration-300",
				bgClass,
				borderClass,
			)}
		>
			{/* Logo Section - 68px tall */}
			<Link
				to="/"
				className={cn(
					"flex items-center border-b",
					"px-4 lg:px-5",
					borderClass,
				)}
				style={{ height: "68px", minHeight: "68px" }}
			>
				{/* Desktop: Full logo with icon + text */}
				<div className="hidden lg:flex items-center gap-2.5">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 shadow-sm">
						<ShieldCheck size={18} weight="bold" className="text-white" />
					</div>
					<span
						className={cn(
							"text-[17px] font-bold tracking-tight font-plus-sans",
							isDark ? "text-white" : "text-neutral-900",
						)}
					>
						MediNexus
					</span>
				</div>

				{/* Tablet icon-rail: Compact logo (icon only) */}
				<div className="flex lg:hidden items-center justify-center w-full">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 shadow-sm">
						<ShieldCheck size={18} weight="bold" className="text-white" />
					</div>
				</div>
			</Link>

			{/* Navigation Section - Scrollable */}
			<nav className="flex-1 overflow-y-auto hide-scrollbar px-2 py-4">
				{items.map((item) => (
					<SidebarNavItem key={item.href} item={item} isDark={isDark} />
				))}
			</nav>

			{/* User Profile Section */}
			<div className={cn("px-2 lg:px-3 pb-4 pt-3 border-t", borderClass)}>
				<UserProfileSection role={role} isDark={isDark} />
				<SignOutButton isDark={isDark} />
			</div>
		</aside>
	);
}

function SidebarNavItem({ item, isDark }: { item: NavItem; isDark: boolean }) {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const isActive = pathname === item.href;
	const Icon = item.icon;

	return (
		<button
			type="button"
			onClick={() => navigate({ to: item.href })}
			className={cn(
				"flex items-center gap-3 w-full px-3 py-2.5 mb-0.5",
				"transition-colors relative group",
				isActive && "font-semibold",
				isActive &&
					(isDark
						? "bg-white/[0.12] text-white"
						: "bg-primary-500/8 text-primary-700"),
				!isActive &&
					(isDark
						? "text-white/75 hover:bg-white/[0.04] hover:text-white/90"
						: "text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-800"),
			)}
		>
			<Icon
				size={20}
				weight={isActive ? "fill" : "regular"}
				className="shrink-0"
			/>
			<span className="hidden lg:block text-[14px] text-left">
				{item.title}
			</span>

			{/* Tooltip for icon-rail mode (tablet) */}
			<span
				className={cn(
					"hidden md:block lg:hidden",
					"absolute left-[68px] px-3 py-1.5 rounded-md",
					"bg-neutral-900 text-white text-[13px] font-medium",
					"whitespace-nowrap shadow-lg pointer-events-none",
					"opacity-0 group-hover:opacity-100 transition-opacity z-50",
				)}
			>
				{item.title}
			</span>
		</button>
	);
}

function UserProfileSection({
	role,
	isDark,
}: {
	role: string;
	isDark: boolean;
}) {
	const { user } = useAuthStore();
	const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
	const initials = getInitials(fullName, role === "doctor" ? "DR" : "PT");
	const avatarColor = getAvatarColor(fullName);

	return (
		<>
			{/* Desktop: Full profile with name */}
			<div className="hidden lg:flex items-center gap-2.5 px-3 py-2 mb-2">
				<div
					className={cn(
						"flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
						"text-[13px] font-bold font-plus-sans",
						avatarColor,
					)}
				>
					{initials}
				</div>
				<div className="flex flex-col overflow-hidden min-w-0">
					<span
						className={cn(
							"truncate text-[14px] font-semibold",
							isDark ? "text-white" : "text-neutral-900",
						)}
					>
						{role === "doctor" ? "Dr. " : ""}
						{user?.first_name || "User"}
					</span>
				</div>
			</div>

			{/* Tablet icon-rail: Avatar only */}
			<div className="flex lg:hidden items-center justify-center py-2 mb-2">
				<div
					className={cn(
						"flex h-8 w-8 items-center justify-center rounded-full",
						"text-[11px] font-bold",
						avatarColor,
					)}
				>
					{initials}
				</div>
			</div>
		</>
	);
}

function SignOutButton({ isDark }: { isDark: boolean }) {
	const { logout } = useAuthStore();
	const navigate = useNavigate();

	const handleSignOut = () => {
		logout();
		navigate({ to: "/" });
	};

	return (
		<button
			type="button"
			onClick={handleSignOut}
			className={cn(
				"flex w-full items-center justify-center lg:justify-start",
				"gap-2 rounded-lg px-3 py-2 text-[13px] font-medium",
				"transition-colors cursor-pointer",
				isDark
					? "text-white/35 hover:bg-white/[0.06] hover:text-white"
					: "text-neutral-500 hover:bg-primary-500/5 hover:text-neutral-900",
			)}
			title="Sign out"
		>
			<SignOut size={18} weight="bold" />
			<span className="hidden lg:block">Sign out</span>
		</button>
	);
}
