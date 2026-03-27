import { DashboardSidebar } from "#/components/DashboardSidebar";
import { MobileBottomNav } from "#/components/MobileBottomNav";
import { MobileHeader } from "#/components/MobileHeader";
import type { NavItem } from "#/config/navigation";
import { cn } from "#/lib/utils";

interface DashboardLayoutProps {
	children: React.ReactNode;
	role: "doctor" | "patient";
	navItems: NavItem[];
}

export function DashboardLayout({
	children,
	role,
	navItems,
}: DashboardLayoutProps) {
	return (
		<div className="flex min-h-screen bg-neutral-50">
			<MobileHeader role={role} />

			<DashboardSidebar role={role} items={navItems} />

			<MobileBottomNav role={role} items={navItems} />

			{/* Main Content Area */}
			<main
				className={cn(
					"flex-1 min-h-screen overflow-y-auto hide-scrollbar",
					// Responsive left margin for sidebar offset
					"ml-0 md:ml-[68px] lg:ml-[260px]",
					// Top padding on mobile for header clearance (64px header + 16px padding)
					"pt-20 md:pt-0",
					// Bottom padding on mobile for bottom nav clearance
					"pb-[72px] md:pb-0",
				)}
			>
				<div className="min-h-screen pt-8 px-5 md:px-8 lg:px-10 pb-12 animate-fade-in">
					{children}
				</div>
			</main>
		</div>
	);
}
