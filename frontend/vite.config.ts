import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // 1. Disable source maps (reduces upload size significantly)
        sourcemap: false,
        // 2. Chunk size warning limit
        chunkSizeWarningLimit: 500,
        // 3. Code Splitting Strategy
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom')) {
                            return 'react-vendor';
                        }
                        if (id.includes('lucide-react')) {
                            return 'lucide-vendor';
                        }
                        if (id.includes('recharts')) {
                            return 'recharts-vendor';
                        }
                        // Split other large libs here if needed
                        return 'vendor';
                    }
                },
            },
        },
      },
    };
});
