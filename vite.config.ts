import { reactRouterVercelVitePlugin } from "@mcansh/react-router-vercel-vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { reactRouterDevTools } from "react-router-devtools";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouterDevTools(),
    tailwindcss(),
    reactRouter(),
    reactRouterVercelVitePlugin({ nodeJsRuntime: `nodejs22.x` }),
  ],
});
