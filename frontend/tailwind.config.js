const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ...colors,
        border: 'oklch(var(--border) / <alpha-value>)',
        ring: 'oklch(var(--ring) / <alpha-value>)',
        background: 'oklch(var(--background) / <alpha-value>)',
        foreground: 'oklch(var(--foreground) / <alpha-value>)',
        card: 'oklch(var(--card) / <alpha-value>)',
        'card-foreground': 'oklch(var(--card-foreground) / <alpha-value>)',
        live: '#10b981',
        scheduled: '#3b82f6',
        closed: '#ef4444',
        // Add any others you need...
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
    require('tailwindcss-motion'),
  ],
}
