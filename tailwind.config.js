/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        prospecta: {
          blue: {
            50: '#EFF6FF',
            100: '#DBEAFE',
            500: '#3B82F6',
            600: '#2563EB', // Primary
            700: '#1D4ED8', // Primary dark
            800: '#1E40AF',
            900: '#1E3A8A',
          },
          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB', // Border
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280', // Muted
            700: '#374151', // Text secondary
            900: '#111827', // Text primary
          },
          success: {
            DEFAULT: '#16A34A',
            light: '#DCFCE7',
            dark: '#15803D',
          },
          warning: {
            DEFAULT: '#D97706',
            light: '#FEF3C7',
            dark: '#B45309',
          },
          error: {
            DEFAULT: '#DC2626',
            light: '#FEE2E2',
            dark: '#B91C1C',
          },
          info: {
            DEFAULT: '#2563EB',
            light: '#EFF6FF',
            dark: '#1D4ED8',
          },
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
      },
      boxShadow: {
        none: 'none',
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        inner: 'none',
      },
      dropShadow: {
        none: 'none',
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
      },
    },
  },
  plugins: [],
}
