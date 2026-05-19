/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  theme: {
    extend: {
      colors: {
        'hc-bg': '#000000',
        'hc-text': '#FFFFFF',
        'hc-accent': '#FFFF00',
        'hc-border': '#FFFFFF',
        'brand-cyan': '#00F5D4',
        'brand-purple': '#9B5DE5',
        'brand-pink': '#F15BB5',
        'dark-primary': '#070919',
        'dark-secondary': '#10142C',
        'dark-tertiary': '#1C203F',
        'light-primary': '#F0F2F5',
        'light-secondary': '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      }
    },
  },
  plugins: [],
}
