import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          emerald: '#059669',
          deep: '#00A86B',
          slate: '#0F172A',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(5, 150, 105, 0.25), 0 8px 24px rgba(5, 150, 105, 0.2)',
      },
      backgroundImage: {
        'radial-sheen':
          'radial-gradient(circle at 20% 10%, rgba(5, 150, 105, 0.2), transparent 45%), radial-gradient(circle at 80% 20%, rgba(15, 23, 42, 0.7), transparent 35%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
