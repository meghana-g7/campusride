/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          red: '#EA5858',
          hover: '#dc4848',
          dark: '#1e293b',
          light: '#f8fafc',
          pink: '#f43f5e',
          pinkBg: '#fdf2f8',
          green: '#10b981'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
