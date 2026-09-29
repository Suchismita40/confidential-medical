/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nordic: {
          bg: '#F8FAFC',
          panel: '#FFFFFF',
          hover: '#F1F5F9',
          border: '#E2E8F0',
          borderLight: '#CBD5E1',
          text: '#0F172A',
          olive: '#475569',
          muted: '#64748B',
        },
        emerald: {
          accent: '#0D9488',
          muted: '#0F766E',
          dim: 'rgba(13, 148, 136, 0.1)',
          surface: '#F0FDF4',
          border: '#BBF7D0',
        },
        midnight: {
          950: '#F8FAFC',
          900: '#FFFFFF',
          850: '#FFFFFF',
          800: '#F1F5F9',
          700: '#E2E8F0',
          600: '#CBD5E1',
          500: '#94A3B8',
          400: '#64748B',
          300: '#475569',
          200: '#334155',
          100: '#1E293B',
          50: '#0F172A',
        },
        slateSurface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          cardHover: '#F8FAFC',
          cardGlass: 'rgba(255, 255, 255, 0.95)',
          border: '#E2E8F0',
          borderLight: '#CBD5E1',
          borderActive: '#0D9488',
          subtle: '#F1F5F9',
        },
        primaryText: '#0F172A',
        mutedText: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        nordic: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        emerald: '0 2px 8px -2px rgba(13, 148, 136, 0.15)',
        glowEmerald: '0 2px 8px -2px rgba(13, 148, 136, 0.15)',
      },
    },
  },
  plugins: [],
};
