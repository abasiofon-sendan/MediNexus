import * as React from "react";
import { cn } from "#/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
	label?: string;
	error?: string;
	icon?: React.ReactNode;
	variant?: "dark" | "light";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{ className, type, label, error, icon, variant = "dark", ...props },
		ref,
	) => {
		const isDark = variant === "dark";

		return (
			<div className="w-full">
				{label && (
					<label
						className={cn(
							"block text-sm font-medium mb-2 font-plus-sans",
							isDark ? "text-white/80" : "text-neutral-700",
						)}
					>
						{label}
					</label>
				)}
				<div className="relative">
					{icon && (
						<div
							className={cn(
								"absolute left-3 top-1/2 -translate-y-1/2",
								isDark ? "text-white/40" : "text-neutral-400",
							)}
						>
							{icon}
						</div>
					)}
					<input
						type={type}
						ref={ref}
						data-slot="input"
						className={cn(
							"h-12 w-full min-w-0 rounded-lg border px-4 py-3 text-base transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
							isDark
								? "border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:bg-white/8"
								: "border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary/10",
							error &&
								"border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10",
							icon && "pl-11",
							className,
						)}
						{...props}
					/>
				</div>
				{error && (
					<p className="mt-1.5 text-sm text-red-400 font-medium">{error}</p>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";

export { Input };
