/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3'
        }
      },
      boxShadow: {
        glow: '0 10px 30px -12px rgba(79, 70, 229, 0.45)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
