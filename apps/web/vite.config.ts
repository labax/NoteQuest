/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolvePwaReleaseId } from '../../scripts/pwa-release-id.mjs';

export default defineConfig(({ command }) => {
  const releaseId = resolvePwaReleaseId(process.env, { allowDevelopment: command === 'serve' });
  return {
    define: {
      __NOTEQUEST_RELEASE_ID__: JSON.stringify(releaseId),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(releaseId),
    },
    plugins: [
      react(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        injectRegister: null,
        manifest: false,
        injectManifest: {
          globPatterns: ['**/*.{html,js,css,svg,png,ico,webmanifest,json,woff2}'],
        },
      }),
    ],
    build: {
      outDir: '../../dist/apps/web',
      emptyOutDir: true,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
    },
  };
});
