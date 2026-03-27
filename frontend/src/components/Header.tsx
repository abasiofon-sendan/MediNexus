import { CaretDown } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import Logo from "./Logo";
import { Button } from "./ui/button";

export default function Header() {
	const [showDropdown, setShowDropdown] = useState(false);

	return (
		<header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0D1F2D]/80 backdrop-blur-xl">
			<div className="container mx-auto flex h-24 items-center justify-between px-5 md:px-10">
				<Logo />
				<div className="flex items-center gap-4 md:gap-6">
					{/* Sign In Dropdown */}
					<div className="relative">
						<button
							type="button"
							onClick={() => setShowDropdown(!showDropdown)}
							onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
							className="hidden sm:flex items-center gap-1.5 font-plus-sans text-base font-medium text-white/70 hover:text-white transition-colors"
						>
							Sign In
							<CaretDown
								size={14}
								weight="bold"
								className={`transition-transform ${showDropdown ? "rotate-180" : ""}`}
							/>
						</button>

						{showDropdown && (
							<div className="absolute top-full right-0 mt-2 w-48 rounded-lg border border-white/10 bg-[#0D1F2D]/95 backdrop-blur-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
								<Link
									to="/login"
									className="block px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
								>
									Patient Sign In
								</Link>
								<Link
									to="/doctor/login"
									className="block px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors border-t border-white/5"
								>
									Provider Sign In
								</Link>
							</div>
						)}
					</div>

					<Link to="/register">
						<Button
							variant="secondary"
							size="sm"
							className="sm:h-12 sm:px-6 sm:text-[15px]"
						>
							Get Started
						</Button>
					</Link>
				</div>
			</div>
		</header>
	);
}
