/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#423A34',
        brand: {
          primary: '#423A34',
          'primary-dark': '#332D29',
        },
        background: {
          primary: '#EFE9E3',
          secondary: '#D6CFC4',
          white: '#FFFFFF',
        },
        text: {
          primary: '#3F3A36',
          inverse: '#EFE9E3',
          heading: '#524741',
        },
        accent: {
          muted: '#A6B640',
          secondary: '#C6866A',
          deep: '#C78553',
        },
        clay: {
          50: '#FBF5F0',
          100: '#F6E8DC',
          200: '#EDCEB8',
          300: '#E2AD89',
          400: '#D79368',
          500: '#C78553',
          600: '#B56D42',
          700: '#975739',
          800: '#7A4733',
          900: '#643C2C',
          950: '#361E16',
        },
        terracotta: {
          50: '#FBF5F2',
          100: '#F7E8E1',
          200: '#EECFC2',
          300: '#E4AE9A',
          400: '#D69878',
          500: '#C6866A',
          600: '#B16B50',
          700: '#935642',
          800: '#79483A',
          900: '#643E33',
          950: '#361F19',
        },
        error: {
          50: '#FDF4F3',
          100: '#FCE7E4',
          200: '#FAD3CD',
          300: '#F5B3AA',
          400: '#ED8578',
          500: '#E0604E',
          600: '#CC4434',
          700: '#AB3528',
          800: '#8D3025',
          900: '#752E25',
          950: '#40140F',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        display: ['3.5rem', { lineHeight: '1.2' }],
        'heading-1': ['2.5rem', { lineHeight: '1.2' }],
        'heading-2': ['2rem', { lineHeight: '1.2' }],
        'heading-3': ['1.5rem', { lineHeight: '1.2' }],
        'heading-4': ['1.25rem', { lineHeight: '1.2' }],
        'body-large': ['1.125rem', { lineHeight: '1.5' }],
        body: ['1rem', { lineHeight: '1.5' }],
        'body-small': ['0.875rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.5' }],
      },
      spacing: {
        section: {
          lg: '96px',
          md: '64px',
          sm: '48px',
        },
      },
      borderRadius: {
        card: '8px',
        'card-lg': '12px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      transitionDuration: {
        fast: '150ms',
        medium: '250ms',
        slow: '400ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
