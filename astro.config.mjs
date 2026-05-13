import { defineConfig } from "astro/config"
import vercel from "@astrojs/vercel"

import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
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
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  integrations: [
    sitemap(),
    tailwind(),
    icon({
      iconDir: "./web/icons",
    }),
    react(),
  ],
})
