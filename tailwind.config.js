/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0d9488',
          50: '#f0fdfa',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          900: '#134e4a',
        },
        accent: {
          DEFAULT: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        surface: {
          light: '#ffffff',
          DEFAULT: '#ffffff',
          dark: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        pill: '20px',
      },
    },
  },
  plugins: [],
};
