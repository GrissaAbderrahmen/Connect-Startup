/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Teal (main brand color)
        primary: {
          50: '#f0fdfa',   // Very light teal
          100: '#ccfbf1',  // Light teal
          200: '#99f6e4',  // Soft teal
          300: '#5eead4',  // Medium light teal
          400: '#2dd4bf',  // Bright teal
          500: '#14b8a6',  // Main teal ⭐ PRIMARY
          600: '#0d9488',  // Deep teal
          700: '#0f766e',  // Darker teal
          800: '#115e59',  // Very dark teal
          900: '#134e4a',  // Deepest teal
        },
        // Secondary: Green (success, money, growth)
        secondary: {
          50: '#f0fdf4',   // Very light green
          100: '#dcfce7',  // Light green
          200: '#bbf7d0',  // Soft green
          300: '#86efac',  // Medium light green
          400: '#4ade80',  // Bright green
          500: '#22c55e',  // Main green ⭐ SECONDARY
          600: '#16a34a',  // Deep green
          700: '#15803d',  // Darker green
          800: '#166534',  // Very dark green
          900: '#14532d',  // Deepest green
        },
        // Accent: Emerald (blend of teal and green)
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',  // Main emerald ⭐ ACCENT
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Neutral grays (keep clean UI)
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      // Custom shadows with teal glow
      boxShadow: {
        'teal': '0 4px 14px 0 rgba(20, 184, 166, 0.15)',
        'teal-lg': '0 10px 40px 0 rgba(20, 184, 166, 0.2)',
        'green': '0 4px 14px 0 rgba(34, 197, 94, 0.15)',
        'green-lg': '0 10px 40px 0 rgba(34, 197, 94, 0.2)',
      },
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}