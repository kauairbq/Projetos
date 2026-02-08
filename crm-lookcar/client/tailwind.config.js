/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C8102E',
        secondary: '#222222',
        'text-light': '#FFFFFF',
        'background-light': '#F8F8F8',
      }
    },
  },
  plugins: [],
}
