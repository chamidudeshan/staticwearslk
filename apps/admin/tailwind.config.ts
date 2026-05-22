import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        admin: {
          bg: '#060608',
          surface: '#0e0e12',
          card: '#12121a',
          border: '#1e1e28',
          text: '#e8e8f0',
          muted: '#666680',
          accent: '#ff6b35',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
