import { defineConfig } from "astro/config"

import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
import icon from "astro-icon"

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
  integrations: [
    mdx(),
    sitemap(),
    tailwind(),
    icon({
      iconDir: "./web/icons",
    }),
  ],
})
