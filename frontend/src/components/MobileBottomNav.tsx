import { Link, useLocation } from "@tanstack/react-router";
import type { NavItem } from "#/config/navigation";
import { cn } from "#/lib/utils";

interface MobileBottomNavProps {
	role: "doctor" | "patient";
	items: NavItem[];
}

export function MobileBottomNav({ items }: MobileBottomNavProps) {
	// Only show first 4 items
	const displayItems = items.slice(0, 4);

	return (
		<nav
			className={cn(
				"md:hidden fixed bottom-0 left-0 right-0 z-50",
				"flex items-center justify-around",
				"bg-white border-t border-neutral-200",
				"shadow-[0_-4px_12px_rgba(13,31,45,0.08)]",
			)}
			style={{ height: "72px" }}
		>
			{displayItems.map((item) => (
				<MobileNavItem key={item.href} item={item} />
			))}
		</nav>
	);
}

function MobileNavItem({ item }: { item: NavItem }) {
	const { pathname } = useLocation();
	const isActive = pathname === item.href;
	const Icon = item.icon;

	return (
		<Link
			to={item.href}
			className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
		>
			{/* Active indicator dot */}
			<div className="h-1 w-1 mb-0.5">
				{isActive && <div className="h-1 w-1 rounded-full bg-primary-600" />}
			</div>

			<Icon
				size={22}
				weight={isActive ? "fill" : "regular"}
				className={cn(
					"transition-colors",
					isActive ? "text-primary-600" : "text-neutral-400",
				)}
			/>

			<span
				className={cn(
					"text-[11px] font-medium transition-colors",
					isActive ? "text-primary-600" : "text-neutral-500",
				)}
			>
				{item.title}
			</span>
		</Link>
	);
}
