const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        app: colors.sky
      },
      height: ({ theme }) => ({
        'app-header': '74px'
      })
    }
  },
  variants: {
    extend: {
      scale: ['active'],
      transform: ['active']
    },
  },
  plugins: [],
}