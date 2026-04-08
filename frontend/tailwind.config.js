/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Grafana-inspired color palette
        gray: {
          50: '#f7f7f7',
          100: '#e4e4e4',
          200: '#c2c2c2',
          300: '#9e9e9e',
          400: '#757575',
          500: '#5c5c5c',
          600: '#4c4c4c',
          700: '#404040',
          750: '#363636',
          800: '#2e2e2e',
          850: '#252525',
          900: '#1f1f1f',
          950: '#141414',
        },
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b9dfff',
          300: '#7cc4ff',
          400: '#36a5ff',
          500: '#1086ff',
          600: '#0068d6',
          700: '#0152a6',
          800: '#05478a',
          900: '#0a3d73',
        },
        success: {
          500: '#3cc13b',
        },
        warning: {
          500: '#f5b400',
        },
        danger: {
          500: '#e02f44',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'grafana': '0 1px 3px rgba(0,0,0,0.3)',
        'grafana-lg': '0 4px 6px rgba(0,0,0,0.4)',
        'grafana-xl': '0 10px 15px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

