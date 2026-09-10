/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FBF9FF',
          100: '#F5F0FE',
          200: '#EBE1FD',
          300: '#DAC8FB',
          400: '#BF9EFA',
          500: '#9E6AF7',
          600: '#8B5CF6',
          700: '#7C3AED',
          800: '#6D28D9',
          900: '#5B21B6',
        },
        pastel: {
          violet: '#8B5CF6',
          violetBg: '#F3E8FF',
          violetBorder: '#E9D5FF',
          violetText: '#6D28D9',
          
          teal: '#0D9488',
          tealBg: '#CCFBF1',
          tealBorder: '#99F6E4',
          tealText: '#0F766E',
          
          emerald: '#10B981',
          emeraldBg: '#D1FAE5',
          emeraldBorder: '#A7F3D0',
          emeraldText: '#047857',
          
          amber: '#F59E0B',
          amberBg: '#FEF3C7',
          amberBorder: '#FDE68A',
          amberText: '#B45309',

          rose: '#F43F5E',
          roseBg: '#FFE4E6',
          roseBorder: '#FECDD3',
          roseText: '#BE123C',
        },
        surface: {
          bg: '#F8F7FC',
          card: '#FFFFFF',
          subtle: '#FAF8FF',
          border: 'rgba(139, 92, 246, 0.10)',
          borderHover: 'rgba(139, 92, 246, 0.20)',
          muted: '#F1EEF9',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 25px -4px rgba(139, 92, 246, 0.07), 0 2px 10px -2px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 12px 35px -6px rgba(139, 92, 246, 0.12), 0 4px 14px -3px rgba(0, 0, 0, 0.04)',
        'float-btn': '0 8px 24px -4px rgba(139, 92, 246, 0.45)',
        'tab-bar': '0 -4px 24px -2px rgba(139, 92, 246, 0.06)',
        'sheet': '0 -10px 40px -4px rgba(139, 92, 246, 0.15)',
      },
      borderRadius: {
        '2xl': '1.25rem',   // 20px
        '3xl': '1.5rem',    // 24px
        '4xl': '2rem',      // 32px
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      }
    },
  },
  plugins: [],
}
