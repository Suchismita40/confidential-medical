/** @type {import(\x27tailwindcss\x27).Config} */
module.exports = {
  content: [
    \x27./app/**/*.{js,ts,jsx,tsx,mdx}\x27,
    \x27./src/**/*.{js,ts,jsx,tsx,mdx}\x27,
  ],
  darkMode: \x27class\x27,
  theme: {
    extend: {
      colors: {
        // High-precision clinical & midnight palette
        midnight: {
          950: \x27#040711\x27,
          900: \x27#0A0F1D\x27,
          850: \x27#0E162B\x27,
          800: \x27#121D38\x27,
          700: \x27#1E2D4F\x27,
          600: \x27#2A3D66\x27,
          500: \x27#3F588A\x27,
          400: \x27#647FA8\x27,
          300: \x27#94AECB\x27,
          200: \x27#CBD9E8\x27,
          100: \x27#E8EEF5\x27,
          50: \x27#F4F7FB\x27,
        },
        clinical: {
          950: \x27#021B1A\x27,
          900: \x27#042F2E\x27,
          800: \x27#0B4A47\x27,
          700: \x27#0D6B66\x27,
          600: \x27#0D9488\x27,
          500: \x27#14B8A6\x27,
          400: \x27#2DD4BF\x27,
          300: \x27#5EEAD4\x27,
          200: \x27#99F6E4\x27,
          100: \x27#CCFBF1\x27,
          50: \x27#F0FDFA\x27,
        },
        slateSurface: {
          bg: \x27#090D16\x27,
          card: \x27#0F1626\x27,
          cardHover: \x27#141E33\x27,
          cardGlass: \x27rgba(15, 22, 38, 0.75)\x27,
          border: \x27#1E2B45\x27,
          borderLight: \x27#2A3B5C\x27,
          borderActive: \x27#14B8A6\x27,
          subtle: \x27#131B2D\x27,
        },
        // Backwards-compatible aliases for existing components
        olive: {
          50: \x27#f0fdfa\x27,
          100: \x27#ccfbf1\x27,
          200: \x27#99f6e4\x27,
          300: \x27#5eead4\x27,
          400: \x27#2dd4bf\x27,
          500: \x27#14b8a6\x27,
          600: \x27#0d9488\x27,
          700: \x27#0f766e\x27,
          800: \x27#115e59\x27,
          900: \x27#134e4a\x27,
          950: \x27#042f2e\x27,
        },
        surface: {
          bg: \x27#090D16\x27,
          card: \x27#0F1626\x27,
          border: \x27#1E2B45\x27,
          muted: \x27#131B2D\x27,
        },
        primaryText: \x27#F8FAFC\x27,
        mutedText: \x27#94A3B8\x27,
      },
      fontFamily: {
        sans: [\x27Inter\x27, \x27Plus Jakarta Sans\x27, \x27system-ui\x27, \x27sans-serif\x27],
        mono: [\x27JetBrains Mono\x27, \x27Fira Code\x27, \x27monospace\x27],
      },
      boxShadow: {
        subtle: \x270 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)\x27,
        card: \x270 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)\x27,
        hover: \x270 12px 28px -4px rgba(20, 184, 166, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.4)\x27,
        glowTeal: \x270 0 24px -4px rgba(20, 184, 166, 0.35)\x27,
        glowEmerald: \x270 0 24px -4px rgba(16, 185, 129, 0.35)\x27,
        glowAmber: \x270 0 24px -4px rgba(245, 158, 11, 0.35)\x27,
        glowRed: \x270 0 24px -4px rgba(239, 68, 68, 0.35)\x27,
      },
      animation: {
        \x27pulse-slow\x27: \x27pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite\x27,
        \x27shimmer\x27: \x27shimmer 2.5s infinite linear\x27,
      },
      keyframes: {
        shimmer: {
          \x270%\x27: { backgroundPosition: \x27-200% 0\x27 },
          \x27100%\x27: { backgroundPosition: \x27200% 0\x27 },
        },
      },
    },
  },
  plugins: [],
};
