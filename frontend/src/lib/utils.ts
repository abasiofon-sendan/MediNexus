import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Generate initials from a full name
 * @example getInitials("John Doe") => "JD"
 * @example getInitials("Mary Jane Watson") => "MJ"
 * @example getInitials("") => fallback
 */
export function getInitials(name?: string, fallback: string = "U"): string {
	if (!name || !name.trim()) return fallback;

	return name
		.trim()
		.split(" ")
		.filter((n) => n.length > 0)
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

/**
 * Generate a consistent color for initials avatar based on name
 * Uses a simple hash to pick from predefined color palette
 */
export function getAvatarColor(name?: string): string {
	if (!name || !name.trim()) {
		return "bg-primary-100 text-primary-700";
	}

	const colors = [
		"bg-primary-100 text-primary-700", // Teal
		"bg-info-100 text-info-700", // Blue
		"bg-success-100 text-success-700", // Green
		"bg-accent-100 text-accent-700", // Amber
	];

	// Simple hash function for consistent color assignment
	const hash = name.split("").reduce((acc, char) => {
		return acc + char.charCodeAt(0);
	}, 0);

	return colors[hash % colors.length];
}
