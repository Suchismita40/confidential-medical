import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'path';

export default defineConfig({
  cacheDir: './.vite',
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          content: [
            path.resolve(__dirname, './index.html'),
            path.resolve(__dirname, './app/**/*.{js,ts,jsx,tsx,mdx}'),
            path.resolve(__dirname, './src/**/*.{js,ts,jsx,tsx,mdx}'),
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
        }),
        autoprefixer(),
      ],
    },
  },
  build: {
    target: 'esnext',
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('onchain-runtime-v3')) return 'wasm';
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      extensions: ['.js', '.cjs'],
      ignoreDynamicRequires: true,
    },
  },
  plugins: [
    react(),
    wasm(),
    topLevelAwait({
      promiseExportName: '__tla',
      promiseImportName: (i) => `__tla_${i}`,
    }),
    {
      name: 'wasm-module-resolver',
      resolveId(source, importer) {
        if (
          source === '@midnight-ntwrk/onchain-runtime-v3' &&
          importer &&
          importer.includes('@midnight-ntwrk/compact-runtime')
        ) {
          return {
            id: source,
            external: false,
            moduleSideEffects: true,
          };
        }
        return null;
      },
    },
  ],
  optimizeDeps: {
    rolldownOptions: {
      target: 'esnext',
      supported: { 'top-level-await': true },
      platform: 'browser',
      format: 'esm',
      loader: {
        '.wasm': 'binary',
      },
    },
    include: ['@midnight-ntwrk/compact-runtime'],
    exclude: [
      '@midnight-ntwrk/onchain-runtime-v3',
      '@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm_bg.wasm',
      '@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm.js',
    ],
  },
  define: {},
  checks: {
    importIsUndefined: false,
    pluginTimings: false,
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.wasm'],
    mainFields: ['browser', 'module', 'main'],
  },
});
