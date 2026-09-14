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
        background: '#050507',
        surface: {
          50: '#1c1c22',
          100: '#16161b',
          200: '#111115',
          300: '#0c0c0f',
          400: '#08080a',
          500: '#050507',
        },
        studio: {
          floor: '#0a0b0e',
          accent: '#ffffff',
          dim: '#8e8e93',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        ios: {
          card: 'rgba(20, 20, 25, 0.65)',
          border: 'rgba(255, 255, 255, 0.12)',
          blue: '#0071e3',
          red: '#ff3b30',
          green: '#34c759',
          gold: '#ffd60a',
          gray: '#8e8e93',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter"',
          'system-ui',
          'sans-serif',
        ],
        mono: ['"SF Mono"', 'Menlo', 'Monaco', 'monospace'],
      },
      backdropBlur: {
        '2xl': '40px',
        '3xl': '64px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
