/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          500: '#6E67EF',
          600: '#4F46E5',
          700: '#4338CA'
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
        surface: '#FFFFFF',
        surfaceAlt: '#F8FAFC',
        border: '#E5E7EB'
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '16px'
      },
      boxShadow: {
        sm: '0 1px 2px rgba(15,23,42,0.12)',
        md: '0 6px 16px rgba(15,23,42,0.12)',
        lg: '0 12px 32px rgba(15,23,42,0.15)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};


