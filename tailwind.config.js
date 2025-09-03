/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0A0B',
          card: '#111111',
          border: '#1F1F23',
          hover: '#1A1A1D'
        },
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FCD34D',
          500: '#F59E0B',
          600: '#EAB308',
          700: '#CA8A04',
          900: '#92400E'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'neon': '0 0 20px rgba(245, 158, 11, 0.5)',
        'card': '0 20px 50px rgba(0, 0, 0, 0.8)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}