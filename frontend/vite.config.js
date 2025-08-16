import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      proxy: mode === 'development' ? {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      } : undefined,
      port: 5173,
      open: true
    },
    define: {
      // Expose environment variables to the client
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        mode === 'production' 
          ? env.VITE_API_BASE_URL || '/api' 
          : '/api'
      ),
      'import.meta.env.VITE_SOCKET_URL': JSON.stringify(
        mode === 'production'
          ? env.VITE_SOCKET_URL || ''
          : 'http://localhost:5001'
      )
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
        },
      },
    },
  };
});
