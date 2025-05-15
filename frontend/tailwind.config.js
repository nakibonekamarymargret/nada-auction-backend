/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust to your project structure
  ],
  theme: {
    extend: {
      colors: {
        live: '#10b981',
        scheduled: '#3b82f6',
        closed: '#ef4444',
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        baskerville: ['"Libre Baskerville"', 'serif'],
        tenor: ['"Tenor Sans"', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
        inter: ['Inter', 'sans-serif'],
        dm: ['"DM Serif Display"', 'serif'],
        manrope: ['Manrope', 'sans-serif'],
        button: ['Manrope', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 4s linear infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('tailwindcss-motion'), // You referenced this
  ],
}
