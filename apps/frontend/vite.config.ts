import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type PluginOption } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';

export default defineConfig(({ mode }) => {
  const plugins = [
    mode === 'development' ? devtools() : null,
    solidPlugin(),
    tailwindcss(),
  ].filter(Boolean) as PluginOption[];

  return {
    plugins,
    server: {
      port: 3000,
    },
    build: {
      target: 'esnext',
    },
  };
});
