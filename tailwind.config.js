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
        'attention': colors.yellow,
        'curve': colors.sky,
        'ethereum': colors.zinc,
        'fantom': colors.indigo
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
  plugins: [
    require('@tailwindcss/forms')
  ],
}