import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import Logo from "./Logo";

export default function Header() {
	return (
		<header className="fixed top-0 z-50 w-full border-b border-white/10 /bg-primary-950/80 bg-[#0D1F2D]/80 backdrop-blur-xl">
			<div className="container mx-auto flex h-24 items-center justify-between px-5 md:px-10">
				<Logo />
				<div className="flex items-center gap-4 md:gap-6">
					<Link
						to="/auth/login"
						className="hidden sm:block font-plus-sans text-base font-medium text-white/70 hover:text-white transition-colors"
					>
						Sign In
					</Link>
					<Link to="/auth/register">
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
