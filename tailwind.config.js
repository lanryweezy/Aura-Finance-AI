/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        'light-primary': '#F8FAFC',
        'light-secondary': '#FFFFFF',
        'light-tertiary': '#F1F5F9',
        'aura-gray-50': '#F9FAFB',
        'aura-gray-100': '#F3F4F6',
        'aura-gray-200': '#E5E7EB',
        'aura-gray-800': '#1F2937',
        'aura-gray-900': '#111827',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
