import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Overpass', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: 'var(--color-bg-primary)',
          surface: 'var(--color-bg-secondary)',
          elevated: 'var(--color-bg-tertiary)',
          ink: 'var(--color-text-primary)',
          slate: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          border: 'var(--color-border)',
          primary: 'var(--color-accent-primary)',
          secondary: 'var(--color-accent-secondary)',
          accent: 'var(--color-accent-tertiary)',
          cyan: 'var(--color-accent-cyan)',
          green: 'var(--color-accent-green)',
          // Legacy aliases used across components
          navy: 'var(--color-text-primary)',
        },
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        glow: 'var(--shadow-glow)',
      },
      backgroundImage: {
        'gradient-brand': 'var(--gradient-primary)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-surface': 'var(--gradient-bg)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [typography],
};
