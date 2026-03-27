import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AuditAction } from "#/types/api.types";

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

export function getRelativeTime(timestamp: string): string {
	const now = new Date();
	const logTime = new Date(timestamp);
	const diffMs = now.getTime() - logTime.getTime();

	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays > 0) {
		return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
	} else if (diffHours > 0) {
		return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
	} else if (diffMinutes > 0) {
		return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
	} else {
		return "Just now";
	}
}

export function getActionDisplayInfo(action: AuditAction) {
	const actionMap: Record<AuditAction, { color: string; icon: string; label: string; bgColor: string; textColor: string; borderColor: string }> = {
		READ: { color: "blue", icon: "👁️", label: "Record Viewed", bgColor: "bg-blue-50", textColor: "text-blue-700", borderColor: "border-blue-200" },
		WRITE_REQUEST: { color: "orange", icon: "📝", label: "Record Created", bgColor: "bg-orange-50", textColor: "text-orange-700", borderColor: "border-orange-200" },
		WRITE_APPROVED: { color: "green", icon: "✅", label: "Record Approved", bgColor: "bg-green-50", textColor: "text-green-700", borderColor: "border-green-200" },
		WRITE_REJECTED: { color: "red", icon: "❌", label: "Record Rejected", bgColor: "bg-red-50", textColor: "text-red-700", borderColor: "border-red-200" },
		CONSENT_GRANTED: { color: "teal", icon: "🔐", label: "Consent Granted", bgColor: "bg-teal-50", textColor: "text-teal-700", borderColor: "border-teal-200" },
		CONSENT_REVOKED: { color: "gray", icon: "🔓", label: "Consent Revoked", bgColor: "bg-gray-50", textColor: "text-gray-700", borderColor: "border-gray-200" },
	};
	return actionMap[action] || { color: "gray", icon: "•", label: action, bgColor: "bg-gray-50", textColor: "text-gray-700", borderColor: "border-gray-200" };
}

export function getTimeLeft(expiresAt: string): string {
	const now = new Date();
	const expires = new Date(expiresAt);
	const diffMs = expires.getTime() - now.getTime();

	if (diffMs <= 0) {
		return "Expired";
	}

	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffMinutes = Math.floor(diffMs / (1000 * 60));

	if (diffDays > 0) {
		return diffDays === 1 ? "1 day" : `${diffDays} days`;
	} else if (diffHours > 0) {
		return diffHours === 1 ? "1 hour" : `${diffHours} hours`;
	} else {
		return diffMinutes === 1 ? "1 minute" : `${diffMinutes} minutes`;
	}
}

export function isExpiringSoon(expiresAt: string): boolean {
	const now = new Date();
	const expires = new Date(expiresAt);
	const hoursUntilExpiry = (expires.getTime() - now.getTime()) / (1000 * 60 * 60);
	return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
}

export const CONSENT_DURATION_PRESETS = [
	{ value: 24, label: "24 hours" },
	{ value: 48, label: "2 days" },
	{ value: 168, label: "1 week" },
	{ value: 336, label: "2 weeks" },
	{ value: 720, label: "1 month" },
];
