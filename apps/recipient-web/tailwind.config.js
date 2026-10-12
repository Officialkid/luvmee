/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        luvmee: {
          blush: '#FCE7ED',
          ivory: '#FFF9F2',
          rose: '#E85D75',
          'rose-hover': '#D6465F',
          burgundy: '#542638',
          'burgundy-soft': '#733E53',
          muted: '#8E6072'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
      }
    }
  },
  plugins: []
};
