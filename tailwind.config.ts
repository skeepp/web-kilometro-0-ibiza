import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2D6A4F",
          accent: "#52B788",
          background: "#FEFAE0",
          earth: "#8B5E3C",
          text: "#1A1A1A",
          muted: "#6B7280"
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-lora)', 'serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(45, 106, 79, 0.08)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'gravity-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.95' },
        },
        'gravity-waves': {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'gravity-pulse': 'gravity-pulse 3s ease-in-out infinite',
        'gravity-waves': 'gravity-waves 4s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      backgroundImage: {
        'gravity-gradient': 'linear-gradient(135deg, #00FFB2 0%, #0060FF 100%)',
      }
    },
  },
  plugins: [],
};
export default config;
