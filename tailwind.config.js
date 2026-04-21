/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#0a0e1a',
          800: '#0f1629',
          700: '#151d35',
          600: '#1c2645',
        },
        accent: {
          blue:  '#3b82f6',
          green: '#22c55e',
          red:   '#ef4444',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
