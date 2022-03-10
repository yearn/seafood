const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/**/*.{html,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': colors.sky,
        'secondary': colors.slate,
        'selected': colors.pink,
        'ok': colors.green,
        'attention': colors.yellow,
        'error': colors.red,
        'curve': colors.sky,
        'ethereum': colors.zinc,
        'fantom': colors.indigo
      },
      height: ({ theme }) => ({
        'app-header': '64px'
      }),
      keyframes: {
        'slide-in-x': {
          '0%': { transform: 'translateX(-5%)' },
          '100%': { transform: 'translateX(0%)' }
        },
        'slide-out-x': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-5%)' }
        }
      },
      animation: {
        'slide-in-x': 'slide-in-x 100ms ease-in',
        'slide-out-x': 'slide-out-x 100ms ease-out'
      }
    }
  },
  variants: {
    extend: {
      scale: ['active'],
      transform: ['active']
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}