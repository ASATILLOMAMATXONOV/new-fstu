// https://github.com/vitejs/vite/discussions/3448
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

// ----------------------------------------------------------------------

const adminPort = Number(process.env.VITE_PORT || 3001);

export default defineConfig({
  plugins: [react(), jsconfigPaths({ projects: ['tsconfig.json'] })],
  // https://github.com/jpuri/react-draft-wysiwyg/issues/1317
  base: process.env.VITE_APP_BASE_NAME || '/',
  define: {
    global: 'window'
  },
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1')
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1')
      }
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('tinymce') || id.includes('@tinymce')) {
            return 'editor-vendor';
          }

          if (
            id.includes('/@mui/') ||
            id.includes('/@emotion/') ||
            id.includes('/@ant-design/') ||
            id.includes('/notistack/')
          ) {
            return 'ui-vendor';
          }

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router/') ||
            id.includes('/react-router-dom/') ||
            id.includes('/react-intl/')
          ) {
            return 'react-vendor';
          }

          if (
            id.includes('/lodash/') ||
            id.includes('/formik/') ||
            id.includes('/yup/') ||
            id.includes('/swr/') ||
            id.includes('/jwt-decode/') ||
            id.includes('/jsonwebtoken/')
          ) {
            return 'data-vendor';
          }

          return 'vendor';
        }
      }
    }
  },
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3001
    port: adminPort
  },
  preview: {
    // this ensures that the browser opens upon preview start
    open: true,
    // this sets a default port to 3001
    port: adminPort
  }
});
