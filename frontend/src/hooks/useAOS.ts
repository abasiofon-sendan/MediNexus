import AOS from "aos";
import { useEffect, useState } from "react";

export function useAOS() {
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		// Only run on client side
		if (typeof window !== "undefined") {
			AOS.init({
				duration: 700,
				once: true,
				offset: 100,
				easing: "ease-out",
			});
			setIsInitialized(true);
		}
	}, []);

	// Only return AOS attributes if we're on client side and initialized
	return {
		isInitialized,
		getAOSProps: (animation: string, delay?: number) => {
			if (!isInitialized) {
				return {};
			}
			return {
				"data-aos": animation,
				...(delay ? { "data-aos-delay": delay } : {}),
			};
		},
	};
}
