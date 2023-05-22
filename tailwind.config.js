const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
      screens: {
        'xs': '320px'
      },
      keyframes: {
        colorPicker: {
          '0%': {
            transform: 'translateY(-0.5rem)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1'
          }
        }
      },
      animation: {
        'color-picker': 'colorPicker 150ms ease-out'
      }
    }
	},
	plugins: [
		plugin(function({ matchUtilities, theme }) {
      matchUtilities(
        {
          'animate-menu': (value) => ({
            [`@keyframes openMenu-${value.replace('.', '\\.')}`]: {
              '0%': { height: '0', opacity: '0' },
              '100%': { height: value, opacity: '1' },
            },
            animation: `openMenu-${value.replace('.', '\\.')} 150ms ease-out`
          }),
        },
        { values: theme('height') }
      )
    })
	]
}
