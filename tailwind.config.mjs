/** @type {import('tailwindcss').Config} */
export default {
  content: ["./web/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        jbmono: ["JetBrains Mono", "sans-serif"],
      },
    },
  },
  plugins: [],
}
