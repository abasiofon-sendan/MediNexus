import type { Icon } from "@phosphor-icons/react";
import {
	ChartBar,
	FileText,
	LockKey,
	ShieldCheck,
	Users,
	Plus,
} from "@phosphor-icons/react";

export interface NavItem {
	title: string;
	href: string;
	icon: Icon;
}

/**
 * Patient navigation items - root level routes
 * Shorter URLs for default user type
 */
export const patientNavItems: NavItem[] = [
	{
		title: "Dashboard",
		href: "/dashboard",
		icon: ChartBar,
	},
	{
		title: "My Records",
		href: "/records",
		icon: FileText,
	},
	{
		title: "Access Consents",
		href: "/consents",
		icon: LockKey,
	},
	{
		title: "Audit Log",
		href: "/audit-log",
		icon: ShieldCheck,
	},
];

/**
 * Doctor navigation items - prefixed with /doctor
 */
export const doctorNavItems: NavItem[] = [
	{
		title: "Dashboard",
		href: "/doctor/dashboard",
		icon: ChartBar,
	},
	{
		title: "Patient Records",
		href: "/doctor/records",
		icon: FileText,
	},
	{
		title: "Create Record",
		href: "/doctor/create",
		icon: Plus,
	},
	{
		title: "My Patients",
		href: "/doctor/patients",
		icon: Users,
	},
];
