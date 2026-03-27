import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "#/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
	{
		variants: {
			variant: {
				default: "bg-neutral-100 text-neutral-700",
				active: "bg-success-100 text-success-700",
				pending: "bg-accent-100 text-accent-700",
				approved: "bg-success-100 text-success-700",
				denied: "bg-error-100 text-error-700",
				high: "bg-error-100 text-error-700",
				medium: "bg-accent-100 text-accent-700",
				low: "bg-neutral-100 text-neutral-700",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
