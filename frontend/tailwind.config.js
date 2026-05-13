/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4f9',
          100: '#e1e8f0',
          200: '#c2d1e1',
          300: '#a3bad2',
          400: '#8fb5d9',
          500: '#1e3a8a', // Dark blue (main)
          600: '#1e40af',
          700: '#1e3a8a',
          800: '#1a2b5e',
          900: '#0f1e3d',
        },
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Red (accent)
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
    },
  },
  plugins: [],
}