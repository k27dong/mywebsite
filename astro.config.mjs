import { defineConfig, envField } from "astro/config"
import vercel from "@astrojs/vercel"

import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"
import icon from "astro-icon"
import react from "@astrojs/react"

export default defineConfig({
  site: "https://www.kefan.me/",
  srcDir: "./web",
  markdown: {
    shikiConfig: {
      theme: "dark-plus",
      defaultColor: false,
      wrap: true,
    },
  },
  output: "static",
  env: {
    schema: {
      PUBLIC_API_URL: envField.string({
        context: "client",
        access: "public",
        default: "http://localhost:5000",
      }),
    },
  },
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  integrations: [
    sitemap(),
    icon({
      iconDir: "./web/icons",
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
