import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
      jsxFactory: 'createComponent',
      jsxFragment: 'Fragment',
      fastRefresh: false,
    }),
  ],
  root: 'sample',
  index: 'index.html',
  define: {
    DEBUG: true,
    'process.env.NODE_ENV': '"development"',
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['../src/**/*'],
    force: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    hmr: {
      protocol: 'ws',
      overlay: true,
      host: 'localhost',
    },
    watch: {
      usePolling: true,
      interval: 100,
      include: ['sample/**/*', 'src/**/*'],
    },
  }
});