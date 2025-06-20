/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './src/app.html'
  ],
  theme: {
    extend: {
      colors: {
        // BOSS UI color tokens (to be defined when available)
        boss: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#8b5cf6',
          neutral: '#374151',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        }
      },
      fontFamily: {
        // BOSS UI typography (to be defined when available)
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}; 