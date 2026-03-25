import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import TanStackQueryProvider from "./integrations/tanstack-query/root-provider";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
	const root = createRoot(rootElement);
	root.render(
		<StrictMode>
			<TanStackQueryProvider>
				<RouterProvider router={router} />
			</TanStackQueryProvider>
		</StrictMode>,
	);
}
