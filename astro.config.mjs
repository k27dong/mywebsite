import { defineConfig } from "astro/config"

import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"

export default defineConfig({
  site: "http://10.0.0.114:4321/",
  srcDir: "./web",
  integrations: [mdx(), sitemap(), tailwind()],
})
