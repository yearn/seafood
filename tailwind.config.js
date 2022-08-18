const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');

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
        'error': colors.red
      },
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
      },
      backgroundImage: {
        'gradient-radial-to-tr': 'radial-gradient(115% 90% at 0% 100%, var(--tw-gradient-stops))',
        'gradient-radial-to-tl': 'radial-gradient(115% 90% at 100% 100%, var(--tw-gradient-stops))',
        'gradient-radial-to-br': 'radial-gradient(90% 115% at 0% 0%, var(--tw-gradient-stops))',
        'gradient-radial-to-bl': 'radial-gradient(90% 115% at 100% 0%, var(--tw-gradient-stops))',
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
    require('@tailwindcss/forms'),
    plugin(function({ addUtilities }) {
      addUtilities({
        '.glow-attention-md': {
          'filter': 'drop-shadow(0 4px 3px rgb(250 204 21 / 0.1)) drop-shadow(0 2px 2px rgb(250 204 21 / 0.06))',
        }
      })
    })
  ],
}