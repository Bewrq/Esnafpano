/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        amazon: {
          yellow: '#FF9900',
          'yellow-hover': '#E68A00',
          dark: '#131921',
          'dark-light': '#232F3E',
          blue: '#37475A',
          'blue-light': '#485769',
          orange: '#FF9900',
          'orange-hover': '#E68A00',
        },
        brand: {
          primary: '#FF9900',
          'primary-hover': '#E68A00',
          dark: '#131921',
          'dark-2': '#232F3E',
          gray: '#F3F3F3',
          'gray-2': '#EAEAEA',
          text: '#111111',
          muted: '#565959',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.12)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
