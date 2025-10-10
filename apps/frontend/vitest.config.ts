import { defineConfig } from 'vitest/config';
import solid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    css: false,
  },
});
