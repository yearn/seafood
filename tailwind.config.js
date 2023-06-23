const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');
const {default: flattenColorPalette} = require('tailwindcss/lib/util/flattenColorPalette');
const {toRgba} = require('tailwindcss/lib/util/withAlphaVariable');

function heightSafeList() {
  const maxheight = 101;
  return Array(maxheight).fill(0).map((_, index) => `h-[${index}%]`);
}

module.exports = {
  content: ['./src/**/*.{html,js,ts,tsx}'],
  safelist: [
    'sm:h-14',
    'bg-stripes',
    'bg-stripes-black',
    'bg-secondary-900',
    ...heightSafeList()
  ],
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
      fontFamily: {
        'wordmark': ['JetBrains Mono'],
        'mono': ['JetBrains Mono'],
        'sans': ['JetBrains Mono']
      },
      fontSize: {
        'xxs': '.62rem'
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
    require('tailwind-scrollbar'),

    plugin(function({addUtilities}) {
      addUtilities({
        '.glow-attention-md': {
          'filter': 'drop-shadow(0 4px 3px rgb(250 204 21 / 0.1)) drop-shadow(0 2px 2px rgb(250 204 21 / 0.06))',
        }
      })
    }),

    plugin(function({addUtilities, theme}) {
      const stripes = {
        '.bg-stripes': {
          backgroundImage:
            'linear-gradient(var(--stripes-angle, 45deg), var(--stripes-color) 12.50%, transparent 12.50%, transparent 50%, var(--stripes-color) 50%, var(--stripes-color) 62.50%, transparent 62.50%, transparent 100%)',
          backgroundSize: '5.66px 5.66px',
        },
        '.bg-stripes-0': { '--stripes-angle': '0deg' },
        '.bg-stripes-45': { '--stripes-angle': '45deg' },
        '.bg-stripes-90': { '--stripes-angle': '90deg' },
        '.bg-stripes-135': { '--stripes-angle': '135deg' },
      };
      const addColor = (name, color) =>
        (stripes[`.bg-stripes-${name}`] = { '--stripes-color': color });
      const colors = flattenColorPalette(theme('backgroundColor'));
      for (let name in colors) {
        try {
          const [r, g, b, a] = toRgba(colors[name]);
          if (a !== undefined) {
            addColor(name, colors[name]);
          } else {
            addColor(name, `rgba(${r}, ${g}, ${b}, 0.4)`);
          }
        } catch (_) {
          addColor(name, colors[name]);
        }
      }
      addUtilities(stripes, ['responsive']);
    })
  ],
}