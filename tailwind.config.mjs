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
        ],
      },
      colors: {
        highlight: "#4a6c8c",
        light: "#f0f0f2",
        background: "#f0f0f2",
        textblack: "#0c0c0c",
      },
      typography: {
        quoteless: {
          css: {
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:first-of-type::after": { content: "none" },
          },
        },
        quotemargin: {
          css: {
            "blockquote p": { margin: "0.5rem 0", lineHeight: "1.6rem" },
          },
        },
        codeblockwidth: {
          css: {
            pre: {
              wordBreak: "break-word",
            },
          },
        },
        nonitalic: {
          css: {
            blockquote: {
              fontStyle: 'normal'
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
