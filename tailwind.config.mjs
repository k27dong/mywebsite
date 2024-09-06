/** @type {import('tailwindcss').Config} */
export default {
  content: ["./web/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        jbmono: ["JetBrains Mono", "sans-serif"],
      },
			colors: {
        navbar: "#1e1e1e",
        highlight: "#0ae604",
        light: "#f0f0f2",
        dark: "#1e1e1e",
        mainbg: "#e5e5e5",
        maintxt: "#2f2f2f"
      },
    },
  },
  plugins: [],
}
