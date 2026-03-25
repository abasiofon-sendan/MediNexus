import { createFileRoute } from "@tanstack/react-router";
import Footer from "#/components/Footer";
import Header from "#/components/Header";
import { Features } from "#/components/home/Features";
import Hero from "#/components/home/Hero";
import HowItWorks from "#/components/home/HowItWorks";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
	return (
		<>
			<Header />
			<Hero />
			<HowItWorks />
			<Features />
			<Footer />
		</>
	);
}
