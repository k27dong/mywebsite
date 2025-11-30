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
        DEFAULT: {
          css: {
            blockquote: {
              fontStyle: "normal",
              color: 'theme("colors.gray.700")',
            },
          },
        },
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
        bqitalic: {
          css: {
            blockquote: {
              fontStyle: "italic",
            },
          },
        },
        notebox: {
          css: {
            border: "1px solid #D1D5DB",
            backgroundColor: "#F3F4F6",
            padding: "1rem",
            margin: "2rem 0",
          },
        },
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        pop: "pop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
