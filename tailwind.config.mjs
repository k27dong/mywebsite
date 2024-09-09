/** @type {import('tailwindcss').Config} */
export default {
  content: ["./web/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        jbmono: ["JetBrains Mono", "sans-serif"],
        sourcehan: ["Source Han Serif", "serif"],
        pagetitle: [
          "Georgia",
          "Cambria",
          "Times New Roman",
          "Times",
          "Noto Serif SC ExtraBold",
          "serif",
        ],
        article: [
          "Georgia",
          "Cambria",
          "Times New Roman",
          "Times",
          "Source Han Serif",
          "serif",
        ]
      },
      colors: {
        highlight: "#0ae604",
        light: "#f0f0f2",
        background: "#f0f0f2",
        textblack: "#0c0c0c",
      },
      typography: {
        quoteless: {
          css: {
            'blockquote p:first-of-type::before': { content: 'none' },
            'blockquote p:first-of-type::after': { content: 'none' },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
