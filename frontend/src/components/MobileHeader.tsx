import { ShieldCheck, SignOut, CaretDown } from "@phosphor-icons/react";
import { Avatar, AvatarFallback } from "#/components/ui/avatar";
import { cn, getAvatarColor, getInitials } from "#/lib/utils";
import { useAuthStore } from "#/stores/authStore";
import { useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";

interface MobileHeaderProps {
	role: "doctor" | "patient";
}

export function MobileHeader({ role }: MobileHeaderProps) {
	const { user } = useAuthStore();
	const navigate = useNavigate();
	const [showDropdown, setShowDropdown] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const handleLogout = () => {
		useAuthStore.getState().logout();
		navigate({ to: "/" });
	};

	const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
	const initials = getInitials(fullName, role === "doctor" ? "DR" : "PT");
	const avatarColor = getAvatarColor(fullName);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

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

				{/* User Avatar with Dropdown */}
				<div className="relative" ref={dropdownRef}>
					<button
						type="button"
						onClick={() => setShowDropdown(!showDropdown)}
						className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-neutral-100 transition-colors"
					>
						<Avatar size="default" className="ring-2 ring-primary-700">
							<AvatarFallback
								className={cn("text-sm font-medium font-plus-sans", avatarColor)}
							>
								{initials}
							</AvatarFallback>
						</Avatar>
						<CaretDown
							size={14}
							className={cn(
								"text-neutral-500 transition-transform",
								showDropdown && "rotate-180"
							)}
						/>
					</button>

					{/* Dropdown Menu */}
					{showDropdown && (
						<div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
							{/* User Info */}
							<div className="px-4 py-3 border-b border-neutral-100">
								<p className="text-sm font-semibold text-neutral-900">
									{role === "doctor" ? "Dr. " : ""}
									{fullName || "User"}
								</p>
								<p className="text-xs text-neutral-500 truncate">{user?.email}</p>
							</div>

							{/* Sign Out Button */}
							<button
								type="button"
								onClick={handleLogout}
								className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
							>
								<SignOut size={18} />
								Sign out
							</button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
