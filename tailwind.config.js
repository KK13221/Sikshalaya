/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        indigo: {
          950: 'oklch(0.18 0.12 270)',
          900: 'oklch(0.22 0.14 270)',
          800: 'oklch(0.28 0.14 270)',
          700: 'oklch(0.35 0.15 270)',
          600: 'oklch(0.42 0.15 270)',
          500: 'oklch(0.50 0.15 270)',
          400: 'oklch(0.60 0.12 270)',
          100: 'oklch(0.93 0.04 270)',
          50:  'oklch(0.97 0.01 270)',
        },
        saffron: {
          600: 'oklch(0.60 0.18 55)',
          500: 'oklch(0.72 0.17 55)',
          400: 'oklch(0.82 0.14 60)',
          100: 'oklch(0.95 0.05 60)',
        },
        surface: 'oklch(0.97 0.008 270)',
        'surface-card': 'oklch(1 0 0)',
        'text-primary': 'oklch(0.18 0.02 270)',
        'text-secondary': 'oklch(0.45 0.03 270)',
        'border-base': 'oklch(0.88 0.01 270)',
      },
    },
  },
  plugins: [],
}
