import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: "#f0fdfa",
          500: "#14b8a6",
          600: "#0d9488",
        },
        indigo: { 400: "#818cf8", 500: "#6366f1", 600: "#4f46e5" },
      },
      // ===== BLOCO DE ANIMAÇÃO ADICIONADO AQUI =====
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
      // ===== FIM DO BLOCO =====
    },
  },
  plugins: [],
};

export default config;
