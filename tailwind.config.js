/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          background: '#0d1117',
          card: '#1f2937',
          text: {
            primary: '#e5e7eb',
            secondary: '#9ca3af',
          },
          primary: '#eab308',
          secondary: '#7c3aed',
          tertiary: '#a855f7',
          accent: '#eab308',
          danger: '#ef4444'
        },
        light: {
          background: '#ffffff',
          card: '#f3f4f6',
          text: {
            primary: '#1f2937',
            secondary: '#4b5563',
          },
          primary: '#eab308',
          secondary: '#7c3aed',
          tertiary: '#a855f7',
          accent: '#eab308',
          danger: '#dc2626'
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        lg: '10px',
        xl: '15px',
        '2xl': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        pulse: 'pulse 2s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        pulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};