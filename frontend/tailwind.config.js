/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-elevated-1': 'var(--bg-elevated-1)',
        'bg-elevated-2': 'var(--bg-elevated-2)',
        'bg-elevated-3': 'var(--bg-elevated-3)',
        'fg-primary': 'var(--fg-primary)',
        'fg-secondary': 'var(--fg-secondary)',
        'fg-tertiary': 'var(--fg-tertiary)',
        'positive': 'var(--positive)',
        'warning': 'var(--warning)',
        'degraded': 'var(--degraded)',
        'accent': 'var(--accent)',
        'accent-purple': 'var(--accent-purple)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'pill': 'var(--radius-pill)',
      },
    },
  },
  plugins: [],
}
