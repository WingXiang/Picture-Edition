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
          50: '#f0f3fa',
          100: '#e1e7f5',
          200: '#c3d0ea',
          300: '#a5b8e0',
          400: '#6a89cb',
          500: '#2a4189', // Main color
          600: '#263a7b',
          700: '#203167',
          800: '#192752',
          900: '#142043',
        },
        accent: {
          50: '#fcf6ec',
          100: '#f9edd8',
          200: '#f1d2a1',
          300: '#eab869',
          400: '#d98a1a',
          500: '#c67e13', // Accent color
          600: '#b27111',
          700: '#945e0e',
          800: '#774c0b',
          900: '#613e09',
        }
      }
    },
  },
  plugins: [],
}
