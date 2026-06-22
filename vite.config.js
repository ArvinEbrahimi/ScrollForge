import { defineConfig, loadEnv } from 'vite';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || '/';

  return {
    root: '.',
    publicDir: 'public',
    base,
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString().split('T')[0]),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            gsap: ['gsap'],
            lenis: ['lenis'],
          },
        },
      },
    },
    server: {
      port: 5173,
      open: true,
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
  };
});
