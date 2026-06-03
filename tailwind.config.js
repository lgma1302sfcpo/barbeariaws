/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#050505',
          900: '#0b0b0c',
          800: '#151516',
          700: '#232326',
        },
        gold: {
          100: '#f8e8bd',
          300: '#e9cd82',
          500: '#c89f48',
          700: '#8d6426',
        },
      },
      boxShadow: {
        gold: '0 18px 50px rgba(200, 159, 72, 0.18)',
        glow: '0 0 0 1px rgba(233, 205, 130, 0.16), 0 22px 70px rgba(0, 0, 0, 0.55)',
      },
      backgroundImage: {
        'gold-line': 'linear-gradient(90deg, transparent, rgba(233, 205, 130, 0.75), transparent)',
      },
    },
  },
  plugins: [],
}
