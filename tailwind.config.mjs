/** @type {import('tailwindcss').Config} */
export default {
  content: ["./web/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        jbmono: ["JetBrains Mono", "sans-serif"],
        sourcehan: ["Source Han Serif", "serif"],
        timesnewroman: ["Times New Roman", "serif"],
      },
      colors: {
        highlight: "#0ae604",
        light: "#f0f0f2",
        background: "#f0f0f2",
        textblack: "#0c0c0c",
      },
    },
  },
  plugins: [],
}
