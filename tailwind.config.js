/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  safelist: [
    'rounded-2xl',
    'rounded-xl',
    'rounded-lg'
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#f2e5cb',
            text: '#7B5E3B',
            accent: '#DCC7A5',
            action: '#A7C08B',
            highlight: '#DCC7A5'
        }
      },
      fontFamily: {
        sans: [
          'ADLaM Display',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol'
        ]
      }
    },
  },
  plugins: [],
}
