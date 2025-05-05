/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark theme colors (default)
        background: '#0d1117',
        card: '#161b22',
        textLight: '#eaeaea',
        primary: '#58a6ff',
        secondary: '#f778ba',
        danger: '#ff6b6b',
        
        // Define color schemes for both dark and light themes
        darkTheme: {
          background: '#0d1117',
          card: '#161b22',
          textLight: '#eaeaea',
          primary: '#58a6ff',
          secondary: '#f778ba',
          danger: '#ff6b6b',
        },
        lightTheme: {
          background: '#ffffff', // couleur de fond pour le mode clair
          card: '#f7f7f7', // couleur de carte pour le mode clair
          textLight: '#333333', // couleur de texte pour le mode clair
          primary: '#007bff', // couleur principale pour le mode clair
          secondary: '#6c757d', // couleur secondaire pour le mode clair
          danger: '#dc3545', // couleur de danger pour le mode clair
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'lg': '10px',
        'xl': '15px',
        '2xl': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse': 'pulse 2s infinite',
      },
    },
  },
  plugins: [],
};
