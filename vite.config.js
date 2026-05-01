import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        // Make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "@": "/src",
            "@config": "/src/config",
            "@pages": "/src/pages",
            "@components": "/src/components",
            "@hooks": "/src/hooks",
            "@queries": "/src/queries",
            "@utils": "/src/utils",
            "@assets": "/src/assets",
            // /esm/icons/index.mjs exports the icons statically, so no separate chunks are created
            "@tabler/icons-react":
                "@tabler/icons-react/dist/esm/icons/index.mjs",
        },
    },
});
