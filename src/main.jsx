import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@config/axios";
import "@assets/styles/index.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@config/queryClient";

import { RouterProvider } from "@tanstack/react-router";
import { router } from "@config/router";



// Render the app
const rootElement = document.getElementById("root");

if (rootElement && !rootElement._reactRootContainer) {
    const root = createRoot(rootElement);
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </StrictMode>
    );
}
