/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          700: '#1A2142',
          800: '#151C39',
          900: '#131B32',
          950: '#0A0F1E',
        },
        pink: {
          500: '#E9457A',
          600: '#D73A6B',
          700: '#C2305B',
        },
      },
    },
  },
  plugins: [],
}