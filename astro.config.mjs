import path from "node:path";
import url from "node:url";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig, envField } from "astro/config";
import tailwind from "@astrojs/tailwind";
import db from "@astrojs/db";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import node from "@astrojs/node";
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  site: import.meta.env.PROD
    ? "https://todos.rileys-projects.com"
    : "http://localhost:4321",
  integrations: [tailwind({ applyBaseStyles: false }), react(), db()],
  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  },
  output: "server",
  adapter: node({ mode: "standalone" }),
  security: { checkOrigin: true },
  env: {
    schema: {
      GITHUB_CLIENT_ID: envField.string({
        context: "server",
        access: "secret",
      }),
      GITHUB_CLIENT_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
      GOOGLE_CLIENT_ID: envField.string({
        context: "server",
        access: "secret",
      }),
      GOOGLE_CLIENT_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
      PUSHER_APP_ID: envField.string({
        context: "server",
        access: "secret",
      }),
      PUSHER_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      PUSHER_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
      PUSHER_CLUSTER: envField.string({
        context: "server",
      }),
    },
  },
});
