// vite config — react app.
// callback.html is copied into dist so the OAuth redirect target ships too.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  // For GitHub Pages deploys at https://<user>.github.io/sndcld-Rndmzr/.
  // Override at build time: BASE_PATH=/ for root deploys (custom domain or user/org pages).
  base: process.env.BASE_PATH ?? '/sndcld-Rndmzr/',
  plugins: [
    react(),
    {
      name: 'copy-callback',
      closeBundle() {
        const dist = resolve(__dirname, 'dist');
        if (existsSync(resolve(__dirname, 'callback.html'))) {
          cpSync(resolve(__dirname, 'callback.html'), resolve(dist, 'callback.html'));
        }
      },
    },
  ],
  server: {
    host: '127.0.0.1',
    port: parseInt(process.env.VITE_PORT || '5173', 10),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
});
